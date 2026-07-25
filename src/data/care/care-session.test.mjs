import assert from "node:assert/strict";
import test from "node:test";
import {
  CARE_SESSION_MAX_AGE_SECONDS,
  careSessionCookieOptions,
  createCareSession,
  parseCareSession,
} from "./care-session.ts";

process.env.CARE_SESSION_SECRET =
  "test-secret-with-at-least-thirty-two-characters";
const access = {
  machineCode: "MBMC-A",
  saleId: "sale-a",
  ownershipId: "owner-a",
};

test("Care session is signed, scoped, short lived, and contains no phone", () => {
  const token = createCareSession(access, 1_000_000);
  assert.deepEqual(parseCareSession(token, 1_000_001), access);
  assert.equal(token.includes("0326147088"), false);
  assert.equal(CARE_SESSION_MAX_AGE_SECONDS, 2700);
  assert.equal(careSessionCookieOptions.httpOnly, true);
  assert.equal(careSessionCookieOptions.sameSite, "lax");
  assert.equal(careSessionCookieOptions.path, "/care");
});

test("expired and tampered sessions fail closed", () => {
  const token = createCareSession(access, 1_000_000);
  assert.equal(
    parseCareSession(
      token,
      1_000_000 + (CARE_SESSION_MAX_AGE_SECONDS + 1) * 1000,
    ),
    null,
  );
  assert.equal(parseCareSession(`${token}x`, 1_000_001), null);
});
