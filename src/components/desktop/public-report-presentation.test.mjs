import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Render the actual TSX components and execute the current route with a mocked
// public API response. No second report renderer or reader is used by the tests.
const require = createRequire(import.meta.url);
const modules = new Map();
function load(path) {
  path = resolve(path);
  if (modules.has(path)) return modules.get(path).exports;
  const compiledModule = { exports: {} };
  modules.set(path, compiledModule);
  const source = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("require", "module", "exports", source)((name) => {
    if (name === "server-only") return {};
    if (name === "next/navigation") return { notFound: () => { throw new Error("not_found"); } };
    if (name === "next/link") return function TestLink({ children, ...props }) { return createElement("a", props, children); };
    if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (name.startsWith("@/") || name.startsWith(".")) {
      const base = name.startsWith("@/") ? resolve("src", name.slice(2)) : resolve(dirname(path), name);
      return load(existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`);
    }
    return require(name);
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const Display = load("src/components/desktop/PublicDisplayEvidence.tsx").default;
const Report = load("src/components/desktop/PublicDeviceCheckReport.tsx").default;
const page = load("src/app/care/report/[reportId]/page.tsx");
const reportId = "dcr_abcdefghijklmnopqrstuvwx";
const evidence = (displayAspectRatio = 1.5) => ({
  version: 1, coordinateSpace: "normalized", origin: "top_left", displayAspectRatio,
  regions: [
    { regionId: "first", kind: "rectangle", x: .1, y: .2, width: .3, height: .4, testColor: "red" },
    { regionId: "second", kind: "rectangle", x: .7, y: .8, width: .2, height: .1, testColor: "black" },
  ],
});
const report = () => ({
  report_id: reportId, schema_version: "mbmc.desktop-device-check.v1", completed_at: "2026-09-01T00:00:00Z", accepted_at: "2026-09-01T00:01:00Z",
  device: { model_identifier: "MacBookAir10,1", display_name: "MacBook Air M1", serial: "C02••••AB12" },
  submitter: { role: "user", label_vi: "Người dùng gửi kết quả", manual_provenance_vi: "Quan sát thủ công" },
  summary: { passed: 0, warning: 1, failed: 0, unknown: 0 },
  diagnostics: [{ diagnostic_id: "display", title: { vi: "Màn hình" }, outcome: "warning", outcome_label: { vi: "Cần chú ý" }, summary: null }],
  manual_inspection: null, limitations: { vi: ["Kết quả tại thời điểm kiểm tra."] }, immutable_notice: { vi: "Bản ghi bất biến." },
});
const renderDisplay = value => renderToStaticMarkup(createElement(Display, { evidence: value }));
const renderReport = value => renderToStaticMarkup(createElement(Report, { report: value }));

test("absent Display evidence preserves historical report presentation", () => {
  assert.equal(renderDisplay(undefined), "");
  const html = renderReport(report());
  assert.match(html, /Chi tiết kiểm tra/);
  assert.match(html, /Cần chú ý/);
  assert.doesNotMatch(html, /Khu vực đã được đánh dấu|class="screen"/);
});

test("Display evidence renders through existing grouped diagnostics", () => {
  const value = report();
  value.diagnostics[0].displayEvidence = evidence();
  const html = renderReport(value);
  assert.match(html, /Khu vực đã được đánh dấu trong bài kiểm tra/);
  assert.match(html, /aspect-ratio:1.5/);
  assert.match(html, /Cần chú ý/);
});

test("ordered regions share exactly one schematic with factual test-color metadata", () => {
  const html = renderDisplay(evidence());
  assert.match(html, /left:10%;top:20%;width:30%;height:40%/);
  assert.match(html, /left:70%;top:80%;width:20%;height:10%/);
  assert.match(html, /2 khu vực được đánh dấu/);
  assert.equal((html.match(/data-display-schematic="true"/g) ?? []).length, 1);
  assert.equal((html.match(/role="img"/g) ?? []).length, 1);
  const screen = html.slice(html.indexOf('data-display-schematic="true"'), html.indexOf('</div>'));
  assert.deepEqual([...screen.matchAll(/data-display-region="(\d+)"/g)].map(match => match[1]), ["1", "2"]);
  assert.match(html, /Khu vực 1 · Nền kiểm tra: Đỏ/);
  assert.match(html, /Khu vực 2 · Nền kiểm tra: Đen/);
  assert.ok(html.indexOf("Khu vực 1 ·") < html.indexOf("Khu vực 2 ·"));
  assert.ok(html.indexOf("</div>") < html.indexOf("Khu vực 1 ·"));
  assert.match(html, /background-color:red/);
  assert.match(html, /background-color:black/);
});

test("null aspect ratio uses only a labeled 16:10 presentation fallback", () => {
  const value = evidence(null);
  const before = structuredClone(value);
  const html = renderDisplay(value);
  assert.match(html, /aspect-ratio:1.6/);
  assert.match(html, /Tỷ lệ minh họa 16:10/);
  assert.deepEqual(value, before);
});

test("every supplied test color is used without an invented background", () => {
  for (const testColor of ["white", "black", "red", "green", "blue"]) {
    const value = evidence();
    value.regions = [{ ...value.regions[0], testColor }];
    const html = renderDisplay(value);
    assert.match(html, new RegExp(`background-color:${testColor}`));
    assert.equal((html.match(/background-color:/g) ?? []).length, 1);
  }
});

test("Display marks introduce no defect semantics or raw evidence", () => {
  const value = evidence();
  value.internal = "RAW_PRIVATE_SENTINEL";
  const html = renderDisplay(value);
  assert.doesNotMatch(html, /điểm chết|hở sáng|vết ố|đè màn|nguyên nhân|mức độ|nghiêm trọng|thay màn|sửa màn|chẩn đoán|RAW_PRIVATE|regionId|coordinateSpace|<pre|application\/json/i);
  assert.match(html, /Khu vực đã được đánh dấu trong bài kiểm tra/);
});

test("masked serial is displayed verbatim and never enters lookup links", () => {
  const value = report();
  const html = renderReport(value);
  assert.match(html, /C02••••AB12/);
  assert.match(html, /href="\/care"/);
  const links = html.match(/href="[^"]*"/g) ?? [];
  for (const link of links) {
    assert.doesNotMatch(link, /serial=|lookup=|C02|%E2%80%A2|device-check\?/);
  }
});

test("current reader and route preserve public canonical metadata and force-dynamic", async () => {
  const originalFetch = globalThis.fetch;
  let requested;
  globalThis.fetch = async (url, options) => { requested = { url, options }; return Response.json(report()); };
  try {
    const props = { params: Promise.resolve({ reportId }) };
    const metadata = await page.generateMetadata(props);
    assert.equal(metadata.alternates.canonical, `https://mbmc.vn/care/report/${reportId}`);
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(page.dynamic, "force-dynamic");
    assert.equal(requested.url, `https://app.mbmc.vn/api/public/desktop/report/${reportId}`);
    assert.equal(requested.options.cache, "no-store");
    const element = await page.default(props);
    assert.equal(element.type, Report);
    assert.match(renderToStaticMarkup(element), /Bản ghi bất biến/);
  } finally { globalThis.fetch = originalFetch; }
});

test("schematics stay inside the available mobile width", () => {
  const css = readFileSync("src/components/desktop/PublicDisplayEvidence.module.css", "utf8");
  assert.match(css, /\.evidence[^}]*min-width: 0[^}]*max-width: 100%/);
  assert.match(css, /\.screen[^}]*width: 100%[^}]*overflow: hidden/);
  assert.match(css, /\.compact \.figure[^}]*width: min\(100%, 24rem\)/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /overflow-wrap: anywhere/);
  const html = renderToStaticMarkup(createElement(Display, { evidence: evidence(), variant: "compact" }));
  assert.match(html, /data-display-variant="compact"/);
});

test("existing authority, battery, SSD and grouped findings stay visible with Display evidence", () => {
  const value = report();
  value.submitter = { role: "delegated_inspector", publication_type: "delegated_inspection", display_name: "Kiểm định viên", network_name: "Mạng lưới kiểm định", manual_provenance_vi: "Quan sát kiểm định" };
  value.battery = { cycle_count: 42, status: "charged", health_deviation_assessment: "normal" };
  value.ssd = { estimated_health_percent: 98, critical_warning: 0 };
  value.diagnostics[0].displayEvidence = evidence();
  value.diagnostics[0].findings = [{ finding_id: "display_visual", title: { vi: "Quan sát màn hình" }, outcome: "unknown", outcome_label: { vi: "Chưa xác định" }, summary: null }];
  const html = renderReport(value);
  assert.match(html, /Kiểm định được ủy quyền/);
  assert.match(html, /Mạng lưới kiểm định/);
  assert.match(html, /Đã sạc đầy/);
  assert.match(html, /Bình thường/);
  assert.match(html, /42/);
  assert.match(html, /98%/);
  assert.match(html, /Quan sát màn hình/);
  assert.match(html, /Chưa xác định/);
  assert.match(html, /Khu vực đã được đánh dấu/);
});

test("Display warning and failed findings embed compact evidence inside the issue card", () => {
  for (const outcome of ["warning", "failed"]) {
    const value = report();
    value.schema_version = "mbmc.desktop-device-check.v4";
    value.diagnostics[0].outcome = outcome;
    value.diagnostics[0].displayEvidence = evidence();
    value.diagnostics[0].findings = [{ finding_id: "display_visual", title: { vi: "Quan sát màn hình" }, outcome, outcome_label: { vi: "Kết quả được cung cấp" }, summary: null }];
    value.issues = [{ diagnostic_id: "display", finding_id: "display_visual", title: { vi: "Quan sát màn hình" }, outcome, outcome_label: { vi: "Kết quả được cung cấp" } }];
    value.undetermined = [];
    const before = structuredClone(value);
    const html = renderReport(value);
    const issues = html.slice(html.indexOf('id="issues-title"'), html.indexOf('id="detail-title"'));
    const card = issues.match(/<li\b[\s\S]*?<\/li>/)?.[0];
    assert.ok(card);
    assert.match(card, /data-display-variant="compact"/);
    assert.match(card, /data-display-schematic="true"/);
    assert.equal((issues.match(/data-display-schematic="true"/g) ?? []).length, 1);
    const details = html.slice(html.indexOf('id="detail-title"'));
    assert.match(details, /data-display-variant="detail"/);
    assert.equal((details.match(/data-display-schematic="true"/g) ?? []).length, 1);
    assert.match(issues, /Khu vực 1 · Nền kiểm tra: Đỏ/);
    assert.match(issues, /Khu vực 2 · Nền kiểm tra: Đen/);
    assert.doesNotMatch(issues, /điểm chết|vết ố|đè màn|mức độ|nguyên nhân|sửa chữa/i);
    assert.deepEqual(value, before);

    delete value.diagnostics[0].displayEvidence;
    const withoutEvidence = renderReport(value);
    assert.doesNotMatch(withoutEvidence, /data-display-schematic|data-display-variant/);
  }
});

test("unknown Display findings and unrelated issue cards do not gain compact evidence", () => {
  const value = report();
  value.diagnostics[0].displayEvidence = evidence();
  value.issues = [{ diagnostic_id: "battery", finding_id: null, title: { vi: "Pin" }, outcome: "warning", outcome_label: { vi: "Cần chú ý" } }];
  value.undetermined = [{ diagnostic_id: "display", finding_id: "display_visual", title: { vi: "Quan sát màn hình" }, outcome: "unknown", outcome_label: { vi: "Chưa xác định" } }];
  const html = renderReport(value);
  const highlights = html.slice(html.indexOf('id="issues-title"'), html.indexOf('id="detail-title"'));
  assert.doesNotMatch(highlights, /data-display-schematic|data-display-variant="compact"/);
  assert.match(html.slice(html.indexOf('id="detail-title"')), /data-display-variant="detail"/);
});
