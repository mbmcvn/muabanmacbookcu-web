import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CARE_VERIFICATION_ERROR,
  verifyCareAccess,
} from "./care-access.ts";

process.env.CARE_SESSION_SECRET =
  "test-secret-with-at-least-thirty-two-characters";

const formSource = readFileSync(
  new URL("../../app/care/[machine_id]/VerificationForm.tsx", import.meta.url),
  "utf8",
);
const routeSource = readFileSync(
  new URL("../../app/care/[machine_id]/verify/route.ts", import.meta.url),
  "utf8",
);
const stored = {
  machineCode: "MBMC-NSXS",
  saleId: "sale-completed",
  ownershipId: "owner-current",
  phone: "0326147088",
};

function store() {
  return {
    async consumeAttempt() {
      return true;
    },
    async findCurrentOwnership() {
      return stored;
    },
    async contextIsCurrent() {
      return true;
    },
  };
}

async function encodedPhone(body) {
  const request = new Request("http://localhost/care/MBMC-NSXS/verify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const form = await request.formData();
  const value = form.get("phone");
  return typeof value === "string" ? value : "";
}

test("rendered form submits an enabled tel field named phone", () => {
  assert.match(formSource, /<form[\s\S]*method="post"/);
  assert.match(formSource, /name="phone"/);
  assert.match(formSource, /type="tel"/);
  assert.match(formSource, /inputMode="tel"/);
  assert.match(formSource, /autoComplete="tel"/);
  assert.doesNotMatch(formSource, /disabled=\{pending\}[\s\S]*required/);
});

test("route reads the native form key and uses string form encoding", async () => {
  assert.match(routeSource, /form\.get\("phone"\)/);
  assert.match(routeSource, /typeof phoneField === "string"/);
  assert.equal(await encodedPhone("phone=0326147088"), stored.phone);
  assert.equal(await encodedPhone("wrong_phone=0326147088"), "");
});

test("stored and formatted phones succeed through encoded form values", async () => {
  for (const body of ["phone=0326147088", "phone=0326+147+088"]) {
    const phone = await encodedPhone(body);
    const access = await verifyCareAccess(
      { machineCode: "MBMC-NSXS", phone, origin: "browser-test" },
      store(),
    );
    assert.deepEqual(access, {
      machineCode: "MBMC-NSXS",
      saleId: "sale-completed",
      ownershipId: "owner-current",
    });
  }
});

test("missing, wrong-key, and wrong phones fail with the generic message", async () => {
  for (const body of [
    "",
    "wrong_phone=0326147088",
    "phone=0912345678",
  ]) {
    const phone = await encodedPhone(body);
    assert.equal(
      await verifyCareAccess(
        { machineCode: "MBMC-NSXS", phone, origin: "browser-test" },
        store(),
      ),
      null,
    );
  }
  assert.match(CARE_VERIFICATION_ERROR, /Thông tin chưa khớp/);
});

test("successful route path writes the session on its returned redirect", () => {
  const redirect = routeSource.indexOf(
    "const response = NextResponse.redirect(destination, 303)",
  );
  const cookie = routeSource.indexOf("response.cookies.set(");
  const returned = routeSource.indexOf("return response", cookie);
  assert.ok(redirect > 0);
  assert.ok(cookie > redirect);
  assert.ok(returned > cookie);
  assert.match(routeSource, /CARE_SESSION_COOKIE/);
});
