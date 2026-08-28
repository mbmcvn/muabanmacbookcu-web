import assert from "node:assert/strict";
import test from "node:test";
import {
  mapPublicCareEvent,
  mapPublicCareOffer,
  prepareActivationName,
  normalizeMachineCode,
  normalizePhone,
  resolveWarrantyStatus,
} from "./care-contract.ts";

test("normalizes machine codes and phone formats while trimming activation names", () => {
  assert.equal(normalizeMachineCode(" mbmc-1234 "), "MBMC-1234");
  assert.equal(prepareActivationName("  Nguyễn Văn A  "), "Nguyễn Văn A");
  assert.equal(normalizePhone("+84 912 345 678"), "0912345678");
});

test("maps only allowlisted event types to synthesized public text", () => {
  assert.deepEqual(
    mapPublicCareEvent({
      id: "event-1",
      event_type: "support_ticket",
      created_at: "2026-07-23T00:00:00Z",
      title: "private raw title",
      note: "private raw note",
    }),
    {
      id: "event-1",
      title: "Đã tiếp nhận yêu cầu hỗ trợ",
      createdAt: "2026-07-23T00:00:00Z",
    },
  );
  assert.equal(
    mapPublicCareEvent({
      id: "event-2",
      event_type: "internal_note",
      created_at: null,
    }),
    null,
  );
});

test("warranty status uses the canonical exclusive timestamptz boundary", () => {
  const expiry = "2026-08-28T10:00:00.000Z";
  assert.equal(
    resolveWarrantyStatus(expiry, new Date("2026-08-28T09:59:59.999Z")),
    "active",
  );
  assert.equal(
    resolveWarrantyStatus(expiry, new Date("2026-08-28T10:00:00.000Z")),
    "expired",
  );
  assert.equal(
    resolveWarrantyStatus(expiry, new Date("2026-08-29T10:00:00.000Z")),
    "expired",
  );
  assert.equal(resolveWarrantyStatus(null), "unavailable");
});

test("canonical Care offer eligibility gates resolver products", () => {
  const product = {
    product_code: "care_3",
    total_coverage_months: 3,
    price: 800000,
  };
  assert.deepEqual(
    mapPublicCareOffer({
      eligible: true,
      reason_code: "eligible",
      purchase_deadline_at: "2026-08-31T00:00:00Z",
      available_products: [product],
    }),
    {
      eligible: true,
      reasonCode: "eligible",
      purchaseDeadlineAt: "2026-08-31T00:00:00Z",
      options: [{ code: "care_3", totalCoverageMonths: 3, price: 800000 }],
    },
  );
  assert.deepEqual(
    mapPublicCareOffer({
      eligible: false,
      reason_code: "deadline_expired",
      available_products: [product],
    }).options,
    [],
  );
});
