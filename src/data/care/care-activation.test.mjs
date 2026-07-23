import assert from "node:assert/strict";
import test from "node:test";
import { activationRedirectStatus, activateCarePassportWithStore } from "./care-activation.ts";

function activationFixture(buyerPhone = "0912345678") {
  const sale = Object.freeze({ id: "sale-1", buyerPhone });
  const writes = { owners: [], events: [] };
  const store = {
    async findMachine() {
      return { id: "machine-uuid", machineCode: "MBMC-TEST" };
    },
    async findLatestSale() {
      return sale;
    },
    async hasOwner() {
      return false;
    },
    async insertOwner(owner) {
      writes.owners.push(owner);
      return true;
    },
    async insertActivationEvent(machineCode) {
      writes.events.push(machineCode);
      return true;
    },
  };
  return { sale, store, writes };
}

test("correct phone succeeds with a different free-form activation name", async () => {
  const fixture = activationFixture();
  const result = await activateCarePassportWithStore({
    machineCode: "mbmc-test",
    customerName: "  Trần Thị Bảo Anh  ",
    phone: "0912345678",
  }, fixture.store);

  assert.equal(result, "activated");
  assert.deepEqual(fixture.writes.owners, [{
    saleId: "sale-1",
    machineCode: "MBMC-TEST",
    customerName: "Trần Thị Bảo Anh",
    phone: "0912345678",
  }]);
  assert.deepEqual(fixture.sale, { id: "sale-1", buyerPhone: "0912345678" });
  assert.deepEqual(fixture.writes.events, ["MBMC-TEST"]);
});

test("correct phone succeeds in both +84 and 0-prefixed formats", async () => {
  for (const [recorded, submitted] of [
    ["0912345678", "+84 912 345 678"],
    ["+84 912 345 678", "0912345678"],
  ]) {
    const fixture = activationFixture(recorded);
    const result = await activateCarePassportWithStore({
      machineCode: "MBMC-TEST",
      customerName: "Tên kích hoạt",
      phone: submitted,
    }, fixture.store);
    assert.equal(result, "activated");
    assert.equal(fixture.writes.owners[0].phone, "0912345678");
  }
});

test("incorrect phone fails generically and performs no writes", async () => {
  const fixture = activationFixture();
  const result = await activateCarePassportWithStore({
    machineCode: "MBMC-TEST",
    customerName: "Tên khác hoàn toàn",
    phone: "0900000000",
  }, fixture.store);

  assert.equal(result, "details_mismatch");
  assert.deepEqual(fixture.writes, { owners: [], events: [] });
});

test("empty, too-short, and unreasonable activation names fail validation", async () => {
  for (const customerName of ["", " ", "A", "A".repeat(101)]) {
    const fixture = activationFixture();
    const result = await activateCarePassportWithStore({
      machineCode: "MBMC-TEST",
      customerName,
      phone: "0912345678",
    }, fixture.store);
    assert.equal(result, "invalid_input");
    assert.deepEqual(fixture.writes, { owners: [], events: [] });
  }
});

test("activation name is stored only in the ownership record, never the sale", async () => {
  const fixture = activationFixture();
  const originalSale = { ...fixture.sale };
  await activateCarePassportWithStore({
    machineCode: "MBMC-TEST",
    customerName: "  NGUYỄN Ánh Dương  ",
    phone: "0912345678",
  }, fixture.store);

  assert.deepEqual(fixture.sale, originalSale);
  assert.equal(fixture.writes.owners[0].customerName, "NGUYỄN Ánh Dương");
  assert.equal("customerName" in fixture.sale, false);
});

test("route status keeps phone mismatches generic", () => {
  assert.equal(activationRedirectStatus("details_mismatch"), "mismatch");
  assert.equal(activationRedirectStatus("failed"), "failed");
  assert.equal(activationRedirectStatus("not_found"), "failed");
});