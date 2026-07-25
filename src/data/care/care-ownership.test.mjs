import assert from "node:assert/strict";
import test from "node:test";
import { resolveCareLifecycle, resolveEffectiveCareOwnership } from "./care-ownership.ts";

const machine = { machineId: "machine-a", machineCode: "MBMC-NSXS", machineStatus: "sold" };
const sale = (id, overrides = {}) => ({ id, machine_id: "machine-a", buyer_phone: null, lifecycle_status: "completed", payment_status: "paid", handover_status: "handed_over", created_at: `2026-07-${id === "sale-2" ? "20" : "01"}T00:00:00Z`, completed_at: `2026-07-${id === "sale-2" ? "21" : "02"}T00:00:00Z`, sold_at: null, ...overrides });
const owner = (id, saleId, overrides = {}) => ({ id, machine_id: "MBMC-NSXS", sale_id: saleId, phone: "0326147088", activated_at: "2026-07-03T00:00:00Z", created_at: "2026-07-03T00:00:00Z", ...overrides });
const resolve = (owners, sales, overrides = {}) => resolveEffectiveCareOwnership({ ...machine, owners, sales, ...overrides });

test("modern completed Sale with exact owner succeeds", () => {
  const result = resolve([owner("owner-1", "sale-1")], [sale("sale-1")]);
  assert.equal(result.ownership?.owner.id, "owner-1");
  assert.equal(result.ownership?.compatibility, "modern");
});

test("legacy activated owner with draft Sale succeeds only when fulfilled and unequivocal", () => {
  const draft = sale("sale-1", { lifecycle_status: "draft", payment_status: "pending", completed_at: null });
  assert.equal(resolve([owner("owner-1", "sale-1")], [draft]).ownership?.compatibility, "legacy_linked");
  assert.equal(resolve([owner("owner-1", "sale-1")], [draft], { machineStatus: "available" }).reasonCode, "CARE_LEGACY_OWNERSHIP_UNSUPPORTED");
});

test("legacy null sale_id succeeds only with one safely fulfilled Sale", () => {
  const draft = sale("sale-1", { lifecycle_status: "draft", completed_at: null });
  assert.equal(resolve([owner("owner-1", null)], [draft]).ownership?.sale.id, "sale-1");
  assert.equal(resolve([owner("owner-1", null)], [draft, sale("sale-2", { lifecycle_status: "draft", completed_at: null })]).reasonCode, "CARE_LEGACY_OWNERSHIP_UNSUPPORTED");
});

test("newer draft Sale does not displace completed activated ownership", () => {
  const result = resolve([owner("owner-1", "sale-1")], [sale("sale-1"), sale("sale-2", { lifecycle_status: "draft", completed_at: null })]);
  assert.equal(result.ownership?.sale.id, "sale-1");
});

test("later completed resale becomes authoritative", () => {
  const result = resolve([owner("owner-old", "sale-1"), owner("owner-new", "sale-2")], [sale("sale-1"), sale("sale-2")]);
  assert.equal(result.ownership?.owner.id, "owner-new");
});

test("previous owner fails after completed resale without a current owner", () => {
  const result = resolve([owner("owner-old", "sale-1")], [sale("sale-1"), sale("sale-2")]);
  assert.equal(result.reasonCode, "CARE_NO_EFFECTIVE_OWNERSHIP");
});

test("two competing activated owners fail closed", () => {
  const draft = sale("sale-1", { lifecycle_status: "draft", completed_at: null });
  const result = resolve([owner("owner-a", "sale-1"), owner("owner-b", "sale-1")], [draft]);
  assert.equal(result.reasonCode, "CARE_AMBIGUOUS_OWNERSHIP");
});

test("multiple completed cycles choose latest effective completed ownership", () => {
  const result = resolve([owner("owner-old", "sale-1"), owner("owner-new", "sale-2")], [sale("sale-1"), sale("sale-2")]);
  assert.equal(result.ownership?.sale.id, "sale-2");
});

test("unactivated owner rows are not effective", () => {
  const result = resolve([owner("owner-1", "sale-1", { activated_at: null })], [sale("sale-1")]);
  assert.equal(result.reasonCode, "CARE_NO_EFFECTIVE_OWNERSHIP");
});

test("MBMC-NSXS modern fixture remains authoritative", () => {
  const result = resolve([owner("d6a1e044-5bd4-4076-a23e-f328be939944", "710523ef-755f-4a23-a97d-c5dac264650f")], [sale("710523ef-755f-4a23-a97d-c5dac264650f")]);
  assert.equal(result.ownership?.owner.id, "d6a1e044-5bd4-4076-a23e-f328be939944");
});

test("eligible sold machine without an owner requires activation", () => {
  const result = resolveCareLifecycle({ ...machine, owners: [], sales: [
    sale("sale-1", { buyer_phone: "0326147088" }),
  ] });
  assert.equal(result.state, "activation_required");
  assert.equal(result.sale.id, "sale-1");
});

test("activated current cycle resolves to returning-owner state", () => {
  const result = resolveCareLifecycle({ ...machine, owners: [
    owner("owner-1", "sale-1"),
  ], sales: [sale("sale-1", { buyer_phone: "0326147088" })] });
  assert.equal(result.state, "activated");
  assert.equal(result.ownership.owner.phone, "0326147088");
});

test("ambiguous authoritative completed Sales fail closed", () => {
  const first = sale("sale-1", { buyer_phone: "0326147088" });
  const second = sale("sale-2", {
    buyer_phone: "0912345678",
    completed_at: first.completed_at,
  });
  const result = resolveCareLifecycle({ ...machine, owners: [], sales: [first, second] });
  assert.equal(result.reasonCode, "CARE_ACTIVATION_AMBIGUOUS");
});

test("completed resale creates a separate activation cycle", () => {
  const result = resolveCareLifecycle({ ...machine, owners: [
    owner("owner-old", "sale-1"),
  ], sales: [
    sale("sale-1", { buyer_phone: "0326147088" }),
    sale("sale-2", { buyer_phone: "0912345678" }),
  ] });
  assert.equal(result.state, "activation_required");
  assert.equal(result.sale.id, "sale-2");
});
