import assert from "node:assert/strict";
import test from "node:test";
import {
  CARE_VERIFICATION_ERROR,
  careContextMatches,
  normalizeVietnamesePhone,
  verifyCareAccess,
} from "./care-access.ts";

process.env.CARE_SESSION_SECRET =
  "test-secret-with-at-least-thirty-two-characters";
const current = {
  machineCode: "MBMC-A",
  saleId: "sale-current",
  ownershipId: "owner-current",
  phone: "0326147088",
};

function store(ownership = current) {
  return {
    attempts: [],
    async consumeAttempt(key) {
      this.attempts.push(key);
      return true;
    },
    async findCurrentOwnership() {
      return ownership;
    },
    async contextIsCurrent(access) {
      return (
        access.saleId === current.saleId &&
        access.ownershipId === current.ownershipId &&
        access.machineCode === current.machineCode
      );
    },
  };
}

test("common Vietnamese phone formatting resolves identically", () => {
  for (const value of [
    "0326147088",
    "0326 147 088",
    "0326.147.088",
    "+84326147088",
    "84326147088",
  ]) {
    assert.equal(normalizeVietnamesePhone(value), "0326147088");
  }
  for (const value of ["abc", "0326", "0123456789", "+841234567890"]) {
    assert.equal(normalizeVietnamesePhone(value), null);
  }
});

test("only the current ownership phone grants access", async () => {
  assert.deepEqual(
    await verifyCareAccess(
      { machineCode: "MBMC-A", phone: "0326 147 088", origin: "ip-a" },
      store(),
    ),
    {
      machineCode: "MBMC-A",
      saleId: "sale-current",
      ownershipId: "owner-current",
    },
  );
  assert.equal(
    await verifyCareAccess(
      { machineCode: "MBMC-A", phone: "0912345678", origin: "ip-a" },
      store(),
    ),
    null,
  );
});

test("previous owner, another machine, missing owner, and limiter fail generically", async () => {
  const previous = { ...current, saleId: "sale-old", phone: "0912345678" };
  assert.equal(
    await verifyCareAccess(
      { machineCode: "MBMC-A", phone: previous.phone, origin: "ip-a" },
      store(current),
    ),
    null,
  );
  assert.equal(
    await verifyCareAccess(
      { machineCode: "MBMC-B", phone: current.phone, origin: "ip-a" },
      store(null),
    ),
    null,
  );
  const limited = store();
  limited.consumeAttempt = async () => false;
  assert.equal(
    await verifyCareAccess(
      { machineCode: "MBMC-A", phone: current.phone, origin: "ip-a" },
      limited,
    ),
    null,
  );
  assert.match(CARE_VERIFICATION_ERROR, /Thông tin chưa khớp/);
});

test("ownership changes and cross-machine sessions invalidate prior access", () => {
  const access = {
    machineCode: "MBMC-A",
    saleId: "sale-current",
    ownershipId: "owner-current",
  };
  assert.equal(careContextMatches(access, access), true);
  assert.equal(
    careContextMatches(access, { ...access, saleId: "sale-resale" }),
    false,
  );
  assert.equal(
    careContextMatches(access, { ...access, ownershipId: "owner-new" }),
    false,
  );
  assert.equal(
    careContextMatches(access, { ...access, machineCode: "MBMC-B" }),
    false,
  );
  assert.equal(careContextMatches(access, null), false);
});
