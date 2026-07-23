import assert from "node:assert/strict";
import test from "node:test";
import {
  mapPublicCareEvent,
  prepareActivationName,
  normalizeMachineCode,
  normalizePhone,
} from "./care-contract.ts";

test("normalizes machine codes and phone formats while trimming activation names", () => {
  assert.equal(normalizeMachineCode(" mbmc-1234 "), "MBMC-1234");
  assert.equal(prepareActivationName("  Nguyễn Văn A  "), "Nguyễn Văn A");
  assert.equal(normalizePhone("+84 912 345 678"), "0912345678");
});

test("maps only allowlisted event types to synthesized public text", () => {
  assert.deepEqual(mapPublicCareEvent({
    id: "event-1",
    event_type: "support_ticket",
    created_at: "2026-07-23T00:00:00Z",
    title: "private raw title",
    note: "private raw note",
  }), {
    id: "event-1",
    title: "Đã tiếp nhận yêu cầu hỗ trợ",
    createdAt: "2026-07-23T00:00:00Z",
  });
  assert.equal(mapPublicCareEvent({
    id: "event-2",
    event_type: "internal_note",
    created_at: null,
  }), null);
});
