import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Exercise the real server reader and /care page against mocked HTTP responses.
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
const api = load("src/data/care/public-inspection.server.ts");
const Page = load("src/app/care/page.tsx").default;
const originalFetch = globalThis.fetch;
test.after(() => { globalThis.fetch = originalFetch; });
const render = async (lookup = "MBMC-001") => renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ lookup }) }));
const unavailable = /Không thể tra cứu lúc này\. Vui lòng thử lại\./;
const notFound = /Không tìm thấy máy hoặc báo cáo kiểm tra công khai\./;
const invalid = /Vui lòng kiểm tra Serial hoặc MBMC Machine ID đã nhập\./;

test("endpoint JSON 404 is a genuine lookup miss", async () => {
  globalThis.fetch = async () => Response.json({ error: "not_found" }, { status: 404 });
  assert.equal(await api.lookupCare("MBMC-001"), null);
  const html = await render();
  assert.match(html, notFound);
  assert.doesNotMatch(html, unavailable);
});

test("endpoint JSON 400 is invalid input, distinct from a lookup miss", async () => {
  globalThis.fetch = async () => Response.json({ error: "invalid_lookup" }, { status: 400 });
  await assert.rejects(api.lookupCare("invalid"), api.InvalidCareLookupError);
  const html = await render("invalid");
  assert.match(html, invalid);
  assert.doesNotMatch(html, notFound);
  assert.doesNotMatch(html, unavailable);
});

test("HTML route 404 is infrastructure failure and hides internal details", async () => {
  globalThis.fetch = async () => new Response("<html>INTERNAL_ENDPOINT_FAILURE</html>", { status: 404, headers: { "content-type": "text/html" } });
  await assert.rejects(api.lookupCare("MBMC-001"), /Care temporarily unavailable/);
  const html = await render();
  assert.match(html, unavailable);
  assert.doesNotMatch(html, notFound);
  assert.doesNotMatch(html, /INTERNAL_ENDPOINT_FAILURE|Care temporarily unavailable/);
});

test("5xx responses are infrastructure failures even with JSON not_found payload", async () => {
  for (const status of [500, 502, 503]) {
    globalThis.fetch = async () => Response.json({ error: "not_found" }, { status });
    await assert.rejects(api.lookupCare("MBMC-001"));
    const html = await render();
    assert.match(html, unavailable);
    assert.doesNotMatch(html, notFound);
  }
});

test("network failures show only public retry wording", async () => {
  globalThis.fetch = async () => { throw new Error("PRIVATE_NETWORK_FAILURE"); };
  const html = await render();
  assert.match(html, unavailable);
  assert.doesNotMatch(html, /PRIVATE_NETWORK_FAILURE/);
  assert.doesNotMatch(html, notFound);
});

test("non-JSON, malformed JSON, unrelated JSON 404 and malformed successes are errors", async () => {
  const cases = [
    () => new Response("not_found", { status: 404 }),
    () => new Response("{broken", { status: 404, headers: { "content-type": "application/json" } }),
    () => Response.json({ message: "Not Found" }, { status: 404 }),
    () => Response.json({ error: "wrong_endpoint" }, { status: 400 }),
    () => new Response("<html>login</html>", { headers: { "content-type": "text/html" } }),
    () => Response.json(null),
    () => Response.json({ error: "unavailable" }),
    () => Response.json({ machine_id: null, machine_path: null, reports: {} }),
    () => Response.json({ machine_id: "MBMC-001", machine_path: null, reports: [] }),
    () => Response.json({ machine_id: null, machine_path: null, reports: [null] }),
    () => Response.json({ machine_id: null, machine_path: null, reports: [{ report_id: "missing_fields" }] }),
  ];
  for (const response of cases) {
    globalThis.fetch = async () => response();
    await assert.rejects(api.lookupCare("MBMC-001"));
    const html = await render();
    assert.match(html, unavailable);
    assert.doesNotMatch(html, notFound);
  }
});

test("valid lookup results keep existing POST, no-store, and public links", async () => {
  let request;
  const result = { schema: "mbmc.public-care-lookup.v1", machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: [{ report_id: "dcr_abcdefghijklmnopqrstuvwx", accepted_at: "2026-09-01T00:00:00Z", display_name: "MacBook Air", report_path: "/care/report/dcr_abcdefghijklmnopqrstuvwx" }] };
  globalThis.fetch = async (url, options) => { request = { url, options }; return Response.json(result); };
  assert.deepEqual(await api.lookupCare("MBMC-001"), result);
  assert.equal(request.url, "https://app.mbmc.vn/api/public/care/lookup");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.cache, "no-store");
  assert.deepEqual(JSON.parse(request.options.body), { lookup: "MBMC-001" });
  const html = await render();
  assert.match(html, /href="\/care\/MBMC-001"/);
  assert.match(html, /MacBook Air/);
  assert.doesNotMatch(html, unavailable);
});

test("overlong input is invalid locally; no input shows no error", async () => {
  globalThis.fetch = async () => { throw new Error("must not fetch"); };
  assert.match(await render("A".repeat(41)), invalid);
  const html = await render("");
  assert.doesNotMatch(html, unavailable);
  assert.doesNotMatch(html, notFound);
  assert.doesNotMatch(html, invalid);
});

const publicReports = () => [
  { report_id: "dcr_newestabcdefghijklmnopqr", accepted_at: "2026-10-04T02:00:00Z", display_name: "MacBook Air 13-inch M2 2022", report_path: "/care/report/dcr_newestabcdefghijklmnopqr" },
  { report_id: "dcr_olderabcdefghijklmnopqrs", accepted_at: "2026-09-01T00:00:00Z", display_name: "MacBook Air 13-inch M2 2022", report_path: "/care/report/dcr_olderabcdefghijklmnopqrs" },
];

test("serial lookup shows one summary, neutral missing Machine ID, and ordered canonical report rows", async () => {
  const reports = publicReports();
  const result = { machine_id: null, machine_path: null, reports };
  globalThis.fetch = async () => Response.json(result);
  const html = await render("C02ABC123456");
  assert.match(html, /Chưa có MBMC Machine ID/);
  assert.match(html, /Chiếc máy này chưa được gắn MBMC Machine ID trong hệ thống\. Vẫn hiển thị các báo cáo kiểm tra công khai theo Serial\./);
  assert.match(html, /2 báo cáo công khai/);
  assert.match(html, /Danh sách báo cáo kiểm tra công khai/);
  assert.match(html, /Tiếp nhận · GMT\+7/);
  assert.match(html, /<time dateTime="2026-10-04T02:00:00Z"/);
  for (const report of reports) assert.match(html, new RegExp(`href="${report.report_path}"`));
  assert.ok(html.indexOf(reports[0].report_id) < html.indexOf(reports[1].report_id));
  assert.doesNotMatch(html, notFound);
  assert.doesNotMatch(html, /passed|đạt kiểm tra|status-dot/i);
  const summary = html.slice(html.indexOf('aria-labelledby="care-summary-title"'), html.indexOf('aria-labelledby="care-reports-title"'));
  assert.match(summary, /MacBook Air 13-inch M2 2022/);
  assert.match(summary, /Serial đã được ẩn/);
  assert.doesNotMatch(summary, /C02ABC123456/);
  // Exact query persistence is confined to the editable user-supplied input.
  assert.match(html, /name="lookup"[^>]*value="C02ABC123456"/);
});

test("resolved Machine with no reports shows identity, Care link and a neutral report empty state", async () => {
  globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: [] });
  const html = await render();
  assert.match(html, /MBMC Machine ID/);
  assert.match(html, /href="\/care\/MBMC-001"/);
  assert.match(html, /Xem Care của máy/);
  assert.match(html, /Chưa có báo cáo kiểm tra công khai cho máy này\./);
  assert.doesNotMatch(html, notFound);
  assert.doesNotMatch(html, /Chưa có MBMC Machine ID/);
  assert.doesNotMatch(html, /MacBook Air|Đang bảo hành|status-dot/);
});

test("summary ignores private serial/internal fields and never changes API report order", async () => {
  const reports = publicReports().reverse();
  globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports, serial: "PRIVATE_FULL_SERIAL", internal_id: "PRIVATE_INTERNAL_ID" });
  const html = await render();
  assert.doesNotMatch(html, /PRIVATE_FULL_SERIAL|PRIVATE_INTERNAL_ID/);
  assert.match(html, /Serial đã được ẩn/);
  assert.ok(html.indexOf(reports[0].report_id) < html.indexOf(reports[1].report_id));
});

test("lookup layout contains narrow screens and long public identifiers", () => {
  const css = readFileSync("src/app/care/lookup.module.css", "utf8");
  assert.match(css, /width: min\(64rem, calc\(100% - 2rem\)\)/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /\.field input[^}]*width: 100%[^}]*min-width: 0/);
  assert.match(css, /text-overflow: ellipsis/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /\.reportId[^}]*white-space: normal[^}]*overflow-wrap: anywhere/);
});
