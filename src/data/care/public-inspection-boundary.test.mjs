import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
test("website Care inspection reads only curated operational APIs", () => {
  const source = read("./public-inspection.server.ts");
  assert.match(source, /import "server-only"/);
  assert.match(source, /https:\/\/app\.mbmc\.vn/);
  assert.match(source, /api\/public\/desktop\/report/);
  assert.match(source, /api\/public\/care\/lookup/);
  assert.match(source, /cache: "no-store"/);
  assert.doesNotMatch(source, /supabase|report_payload|service_role|authorization_id|machine_owners|payments/);
});
test("Care report reuses public presentation, canonical metadata and no internal actions", () => {
  const source = read("../../app/care/report/[reportId]/page.tsx");
  assert.match(source, /PublicDeviceCheckReport/);
  assert.match(source, /getPublicInspectionReport/);
  assert.match(source, /https:\/\/mbmc\.vn\/care\/report/);
  assert.match(source, /index: false/);
  assert.doesNotMatch(source, /DesktopReportWorkspace|report_payload|credential|license|quota|feedback/);
});
