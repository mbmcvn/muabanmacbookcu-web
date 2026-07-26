import test from "node:test";
import assert from "node:assert/strict";
import { sha256Hex } from "./support-signing.server.ts";
import { POST } from "../../app/api/public-support-tickets/route.ts";
process.env.MBMC_PUBLIC_API_KEY_ID = "website";
process.env.MBMC_PUBLIC_API_SECRET = "s".repeat(32);
process.env.MBMC_OPERATIONAL_API_BASE_URL = "https://app.mbmc.vn";
process.env.MBMC_PUBLIC_WEB_ORIGIN = "https://mbmc.vn";
function browserRequest(origin = "https://mbmc.vn") {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    schemaVersion: "public-support-ticket-intake.v1",
    machineCode: "MBMC-001",
    contactName: "An",
    contactPhone: "0901234567",
    category: "display",
    description: "Flicker",
    idempotencyKey: "request_123456789",
  }))
    form.set(key, value);
  form.append(
    "attachments[]",
    new File(["image"], "screen.jpg", { type: "image/jpeg" }),
  );
  return new Request("https://mbmc.vn/api/public-support-tickets", {
    method: "POST",
    headers: { origin, "cf-connecting-ip": "203.0.113.9" },
    body: form,
  });
}
test("valid same-origin multipart is rebuilt, exact-byte signed, and safely forwarded", async () => {
  let captured;
  globalThis.fetch = async (url, init) => {
    captured = { url, init };
    return Response.json(
      {
        schemaVersion: "public-support-ticket-receipt.v1",
        ticketCode: "MBMC-ST-ONE",
        status: "submitted",
        createdAt: "2026-07-26T00:00:00Z",
      },
      { status: 201 },
    );
  };
  const response = await POST(browserRequest());
  assert.equal(response.status, 201);
  assert.equal(captured.url, "https://app.mbmc.vn/api/public/support-tickets");
  const bytes = new Uint8Array(captured.init.body);
  assert.equal(
    captured.init.headers.get("x-mbmc-body-sha256"),
    sha256Hex(bytes),
  );
  assert.equal(
    captured.init.headers.get("x-mbmc-client-network"),
    "203.0.113.9",
  );
  assert.match(
    captured.init.headers.get("content-type"),
    /^multipart\/form-data; boundary=/,
  );
  const forwarded = await new Request(captured.url, {
    method: "POST",
    headers: { "content-type": captured.init.headers.get("content-type") },
    body: captured.init.body,
  }).formData();
  assert.equal(forwarded.get("machineCode"), "MBMC-001");
  assert.equal(forwarded.getAll("attachments[]").length, 1);
  assert.deepEqual(await response.json(), {
    schemaVersion: "public-support-ticket-receipt.v1",
    ticketCode: "MBMC-ST-ONE",
    status: "submitted",
    createdAt: "2026-07-26T00:00:00Z",
  });
});
test("invalid Origin is rejected before forwarding", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error();
  };
  const response = await POST(browserRequest("https://evil.example"));
  assert.equal(response.status, 401);
  assert.equal(called, false);
});
test("operational details are never passed through", async () => {
  globalThis.fetch = async () =>
    Response.json(
      {
        error: { code: "database_constraint", requestId: "operational-id" },
        bucket: "private",
        detail: "support_tickets_phone_key",
      },
      { status: 500 },
    );
  const response = await POST(browserRequest());
  assert.equal(response.status, 503);
  const text = await response.text();
  assert.doesNotMatch(
    text,
    /database_constraint|operational-id|bucket|support_tickets/,
  );
  assert.match(text, /temporarily_unavailable/);
});
