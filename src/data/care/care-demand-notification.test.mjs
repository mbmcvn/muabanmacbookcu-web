import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
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
  assert.match(repo, /create_authenticated_care_resale_demand_v1/);
  assert.match(route, /if \(outcome\.created\)/);
  assert.match(
    route,
    /notifyCareDemandBestEffort\([\s\S]*"resale_upgrade",[\s\S]*outcome\.submissionId,[\s\S]*access\.machineCode/,
  );
  assert.match(form, /Ghi chú thêm \(không bắt buộc\)/);
  assert.match(form, /crypto\.randomUUID/);
});
test("Care fan-out reuses signed operational bridge and is failure isolated", () => {
  assert.match(notify, /\/api\/internal\/care-demand-notifications/);
  assert.match(notify, /signedSupportHeaders/);
  assert.match(notify, /AbortSignal\.timeout\(5_000\)/);
  assert.match(notify, /catch/);
  assert.match(notify, /submissionId/);
});
