import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CARE_RESALE_REASONS, isCareResaleReason } from "./care-resale.ts";
const route = fs.readFileSync(
  new URL("../../app/api/care/[machine_id]/resale/route.ts", import.meta.url),
  "utf8",
);
const form = fs.readFileSync(
  new URL(
    "../../app/care/[machine_id]/resale/ResaleDemandForm.tsx",
    import.meta.url,
  ),
  "utf8",
);
const repo = fs.readFileSync(
  new URL("./care-repository.server.ts", import.meta.url),
  "utf8",
);
const notify = fs.readFileSync(
  new URL("../../lib/demand-notification.server.ts", import.meta.url),
  "utf8",
);
test("resale flow is authenticated, machine-aware, canonical, and only fans out newly created rows", () => {
  assert.match(route, /readCurrentCareAccess/);
  assert.match(route, /if \(!access\)/);
  assert.match(route, /care_session_required/);
  assert.match(repo, /create_authenticated_care_resale_demand_v1/);
  assert.match(route, /if \(outcome\.created\)/);
  assert.match(
    route,
    /notifyCareDemandBestEffort\([\s\S]*"resale_upgrade",[\s\S]*outcome\.submissionId,[\s\S]*access\.machineCode/,
  );
  assert.match(form, /Ghi chú thêm \(không bắt buộc\)/);
  assert.match(form, /Lý do bán lại/);
  assert.match(form, /type="radio"/);
  assert.match(form, /if \(busy \|\| !reason/);
  assert.match(form, /response\.status === 401/);
  assert.match(form, /verification=expired/);
  assert.match(form, /JSON\.stringify\(\{ reason, note, submissionKey \}\)/);
  assert.doesNotMatch(form, /Mã yêu cầu/);
  assert.match(repo, /p_reason: input\.reason/);
  assert.match(route, /isCareResaleReason\(input\.reason\)/);
  assert.match(form, /crypto\.randomUUID/);
});
test("resale reason domain exposes exactly three stable canonical values", () => {
  assert.deepEqual(
    CARE_RESALE_REASONS.map(([value]) => value),
    ["low_usage", "needs_mismatch", "switch_machine"],
  );
  for (const [value] of CARE_RESALE_REASONS)
    assert.equal(isCareResaleReason(value), true);
  for (const value of ["", "other", "Ít dùng", null])
    assert.equal(isCareResaleReason(value), false);
});
test("Care fan-out reuses signed operational bridge and is failure isolated", () => {
  assert.match(notify, /\/api\/internal\/care-demand-notifications/);
  assert.match(notify, /signedSupportHeaders/);
  assert.match(notify, /AbortSignal\.timeout\(5_000\)/);
  assert.match(notify, /catch/);
  assert.match(notify, /submissionId/);
});
