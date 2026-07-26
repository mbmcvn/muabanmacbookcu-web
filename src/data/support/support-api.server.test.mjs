import test from "node:test";
import assert from "node:assert/strict";
import {
  getSupportMachine,
  SupportMachineNotFoundError,
} from "./support-api.server.ts";
process.env.MBMC_PUBLIC_API_KEY_ID = "website";
process.env.MBMC_PUBLIC_API_SECRET = "s".repeat(32);
process.env.MBMC_OPERATIONAL_API_BASE_URL = "https://app.mbmc.vn";
test("known Machine returns only validated public context and signed GET", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return Response.json({
      schemaVersion: "public-support-machine-context.v1",
      machineCode: "MBMC-001",
      displayName: "MacBook Air M1",
      configuration: "M1 · 8GB · 256GB",
    });
  };
  const result = await getSupportMachine(" mbmc-001 ");
  assert.equal(
    request.url,
    "https://app.mbmc.vn/api/public/support-machines/MBMC-001",
  );
  assert.match(request.init.headers.get("x-mbmc-signature"), /^v1=/);
  assert.deepEqual(Object.keys(result), [
    "schemaVersion",
    "machineCode",
    "displayName",
    "configuration",
  ]);
  assert.doesNotMatch(JSON.stringify(result), /uuid|serial|owner|sale/i);
});
test("unknown Machine preserves a distinct generic 404 signal", async () => {
  globalThis.fetch = async () => new Response(null, { status: 404 });
  await assert.rejects(
    getSupportMachine("MBMC-404"),
    SupportMachineNotFoundError,
  );
});
