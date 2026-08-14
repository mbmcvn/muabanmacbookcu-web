import assert from "node:assert/strict";
import test from "node:test";
import {
  activationRedirectStatus,
  activateCarePassportWithStore,
} from "./care-activation.ts";

process.env.CARE_SESSION_SECRET =
  "care-activation-test-secret-at-least-32-characters";

function activationFixture(buyerPhone = "0912345678") {
  const sale = Object.freeze({ id: "sale-1", buyerPhone });
  const writes = { owners: [], events: [] };
  const store = {
    async consumeAttempt() {
      return true;
    },
    async resolve() {
      return {
        state: "activation_required",
        machine: { id: "machine-uuid", machineCode: "MBMC-TEST" },
        sale,
      };
    },
    async insertOwner(owner) {
      writes.owners.push(owner);
      return "owner-1";
    },
    async findOwnerAccess() {
      return null;
    },
    async insertActivationEvent(machineCode) {
      writes.events.push(machineCode);
      return true;
    },
  };
  return { sale, store, writes };
}

test("correct Sale phone and valid name create exact-cycle ownership and access", async () => {
  const fixture = activationFixture();
  const result = await activateCarePassportWithStore(
    {
      machineCode: "mbmc-test",
      customerName: "  Trần Thị Bảo Anh  ",
      phone: "0912345678",
      origin: "198.51.100.1",
    },
    fixture.store,
  );
  assert.equal(result.reasonCode, "CARE_ACTIVATION_SUCCESS");
  assert.deepEqual(result.access, {
    machineCode: "MBMC-TEST",
    saleId: "sale-1",
    ownershipId: "owner-1",
  });
  assert.deepEqual(fixture.writes.owners, [
    {
      saleId: "sale-1",
      machineCode: "MBMC-TEST",
      customerName: "Trần Thị Bảo Anh",
      phone: "0912345678",
    },
  ]);
});

test("Vietnamese +84 and 0-prefixed phones compare identically", async () => {
  for (const [recorded, submitted] of [
    ["0912345678", "+84 912 345 678"],
    ["+84 912 345 678", "0912345678"],
  ]) {
    const fixture = activationFixture(recorded);
    const result = await activateCarePassportWithStore(
      {
        machineCode: "MBMC-TEST",
        customerName: "Tên kích hoạt",
        phone: submitted,
        origin: "198.51.100.1",
      },
      fixture.store,
    );
    assert.equal(result.reasonCode, "CARE_ACTIVATION_SUCCESS");
  }
});

test("wrong Sale phone performs no writes", async () => {
  const fixture = activationFixture();
  const result = await activateCarePassportWithStore(
    {
      machineCode: "MBMC-TEST",
      customerName: "Tên hợp lệ",
      phone: "0900000000",
      origin: "198.51.100.1",
    },
    fixture.store,
  );
  assert.equal(result.reasonCode, "CARE_ACTIVATION_PHONE_MISMATCH");
  assert.deepEqual(fixture.writes, { owners: [], events: [] });
});

test("invalid names and phones have distinct internal reasons", async () => {
  const fixture = activationFixture();
  assert.equal(
    (
      await activateCarePassportWithStore(
        {
          machineCode: "MBMC-TEST",
          customerName: " ",
          phone: "0912345678",
          origin: "198.51.100.1",
        },
        fixture.store,
      )
    ).reasonCode,
    "CARE_ACTIVATION_NAME_INVALID",
  );
  assert.equal(
    (
      await activateCarePassportWithStore(
        {
          machineCode: "MBMC-TEST",
          customerName: "Tên hợp lệ",
          phone: "123",
          origin: "198.51.100.1",
        },
        fixture.store,
      )
    ).reasonCode,
    "CARE_ACTIVATION_PHONE_INVALID",
  );
});

test("duplicate activation is idempotent and returns the current access", async () => {
  const fixture = activationFixture();
  fixture.store.insertOwner = async () => null;
  fixture.store.findOwnerAccess = async () => ({
    machineCode: "MBMC-TEST",
    saleId: "sale-1",
    ownershipId: "owner-existing",
  });
  const result = await activateCarePassportWithStore(
    {
      machineCode: "MBMC-TEST",
      customerName: "Tên hợp lệ",
      phone: "0912345678",
      origin: "198.51.100.1",
    },
    fixture.store,
  );
  assert.equal(result.reasonCode, "CARE_ACTIVATION_SUCCESS");
  assert.equal(result.access.ownershipId, "owner-existing");
  assert.deepEqual(fixture.writes.events, []);
});

test("already activated resolution cannot bypass returning-owner verification", async () => {
  const fixture = activationFixture();
  fixture.store.resolve = async () => ({
    state: "activated",
    access: {
      machineCode: "MBMC-TEST",
      saleId: "sale-1",
      ownershipId: "owner-1",
    },
  });
  const result = await activateCarePassportWithStore(
    {
      machineCode: "MBMC-TEST",
      customerName: "Tên hợp lệ",
      phone: "0912345678",
      origin: "198.51.100.1",
    },
    fixture.store,
  );
  assert.equal(result.reasonCode, "CARE_ALREADY_ACTIVATED");
  assert.equal(result.access, null);
});

test("public redirect status remains generic", () => {
  assert.equal(
    activationRedirectStatus({
      reasonCode: "CARE_ACTIVATION_PHONE_MISMATCH",
      access: null,
    }),
    "failed",
  );
  assert.equal(
    activationRedirectStatus({
      reasonCode: "CARE_ACTIVATION_RATE_LIMITED",
      access: null,
    }),
    "failed",
  );
  assert.equal(
    activationRedirectStatus({
      reasonCode: "CARE_ACTIVATION_CREATE_FAILED",
      access: null,
    }),
    "failed",
  );
});

test("persistent limiter blocks before ownership resolution or writes", async () => {
  const fixture = activationFixture();
  let resolves = 0;
  fixture.store.consumeAttempt = async () => false;
  fixture.store.resolve = async () => {
    resolves += 1;
    throw new Error("must not resolve");
  };
  const result = await activateCarePassportWithStore(
    {
      machineCode: "MBMC-TEST",
      customerName: "Tên hợp lệ",
      phone: "0912345678",
      origin: "198.51.100.1",
    },
    fixture.store,
  );
  assert.equal(result.reasonCode, "CARE_ACTIVATION_RATE_LIMITED");
  assert.equal(result.access, null);
  assert.equal(resolves, 0);
  assert.deepEqual(fixture.writes, { owners: [], events: [] });
});
