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
let publicMachine = null;
let machineReadFails = false;
let machineReads = 0;
const machineQuery = [];
const modules = new Map();
function load(path) {
  path = resolve(path);
  if (modules.has(path)) return modules.get(path).exports;
  const compiledModule = { exports: {} };
  modules.set(path, compiledModule);
  const source = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 },
  }).outputText.replaceAll(".toSorted(", ".slice().sort(");
  new Function("require", "module", "exports", source)((name) => {
    if (name === "@/lib/supabase/server") return { createServerSupabaseClient: () => {
      const query = {
        from: (table) => { machineReads++; machineQuery.push(["from", table]); return query; },
        select: (fields) => { machineQuery.push(["select", fields]); return query; },
        eq: (...args) => { machineQuery.push(["eq", ...args]); return query; },
        in: (...args) => { machineQuery.push(["in", ...args]); return query; },
        is: (...args) => { machineQuery.push(["is", ...args]); return query; },
        limit: async (count) => { machineQuery.push(["limit", count]); if (machineReadFails) throw new Error("PRIVATE_INVENTORY_FAILURE"); return { data: Array.isArray(publicMachine) ? publicMachine : publicMachine ? [publicMachine] : [], error: null }; },
      }; return query;
    } };
    if (name === "server-only") return {};
    if (name === "next/navigation") return { usePathname: () => "/care", notFound: () => { throw new Error("not_found"); } };
    if (name === "next/image") return function TestImage({ fill, sizes, ...props }) { void fill; return createElement("img", { ...props, sizes }); };
    if (name === "next/link") return function TestLink({ children, ...props }) { return createElement("a", props, children); };
    if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (name.startsWith("@/") || name.startsWith(".")) {
      const base = name.startsWith("@/") ? resolve("src", name.slice(2)) : resolve(dirname(path), name);
      return load(/\.tsx?$/.test(base) ? base : existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`);
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

test("active and expired warranty use supplied status, expiry, duration and semantic dots", async () => {
  for (const [status, label, expiry] of [["active", "Còn bảo hành", "2026-11-15T05:00:00Z"], ["expired", "Hết bảo hành", "2026-09-15T05:00:00Z"]]) {
    globalThis.fetch = async () => Response.json({ machine_id: "MBMC-NSXS", machine_path: "/care/MBMC-NSXS", reports: [], warranty: { status, expiresAt: expiry, durationLabel: "1 tháng" } });
    const html = await render("MBMC-NSXS");
    assert.match(html, new RegExp(`data-warranty-status="${status}"`));
    assert.match(html, new RegExp(label));
    assert.match(html, /class="warrantyDot" aria-hidden="true"/);
    assert.match(html, /Hạn bảo hành/);
    assert.match(html, status === "active" ? /15\/11\/2026/ : /15\/09\/2026/);
    assert.match(html, /Thời gian bảo hành/);
    assert.match(html, /1 tháng/);
    assert.match(html, /href="\/care\/MBMC-NSXS"/);
  }
});

test("absent warranty source never invents status, dates, duration or a dot", async () => {
  for (const warranty of [undefined, null, { status: null, expiresAt: null, durationLabel: null }]) {
    globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: [], warranty });
    const html = await render();
    assert.match(html, /Thông tin bảo hành chưa được công bố\./);
    assert.doesNotMatch(html, /data-warranty-status|class="warrantyDot"|Còn bảo hành|Hết bảo hành|1 tháng/);
  }
});

test("warranty presentation does not recalculate server status from browser dates", async () => {
  globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: [], warranty: { status: "expired", expiresAt: "2030-11-15T05:00:00Z", durationLabel: null } });
  const html = await render();
  assert.match(html, /Hết bảo hành/);
  assert.doesNotMatch(html, /Còn bảo hành/);
  assert.match(html, /Chưa có thông tin/);
});

test("malformed optional warranty fields preserve the infrastructure-error state", async () => {
  for (const warranty of [{ status: "guessed", expiresAt: null, durationLabel: null }, { status: "active", expiresAt: "bad", durationLabel: null }, { status: "active", expiresAt: null, durationLabel: 1 }]) {
    globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: [], warranty });
    const html = await render();
    assert.match(html, unavailable);
    assert.doesNotMatch(html, notFound);
    assert.doesNotMatch(html, /data-warranty-status/);
  }
});

test("Care reuses the shared public header and footer without assigning a false active nav item", async () => {
  globalThis.fetch = async () => Response.json({ error: "not_found" }, { status: 404 });
  const html = await render();
  assert.match(html, /<header class="site-header">/);
  assert.match(html, /<footer class="site-footer">/);
  assert.equal((html.match(/<main\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /aria-current="page"/);
  const nav = html.match(/<nav class="desktop-navigation"[\s\S]*?<\/nav>/)?.[0];
  assert.ok(nav);
  assert.doesNotMatch(nav, /href="\/care"/);
  assert.match(html, notFound);
});

test("semantic warranty colors and narrow-screen date/value layout are contained", () => {
  const css = readFileSync("src/app/care/lookup.module.css", "utf8");
  assert.match(css, /data-warranty-status="active"[^}]*background: var\(--accent\)/);
  assert.match(css, /data-warranty-status="expired"[^}]*background: #9b3830/);
  assert.match(css, /@media \(max-width: 400px\)[^}]*grid-template-columns: minmax\(0, 1fr\)/);
});


test("resolved Machine uses its approved cover derivative, public model, and unchanged Care/warranty", async () => {
  publicMachine = careMachine("new_in_stock");
  globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: publicReports(), warranty: { status: "active", expiresAt: "2026-11-15T05:00:00Z", durationLabel: "1 tháng" } });
  const html = await render();
  assert.equal((html.match(/<img /g) ?? []).length, 1);
  assert.match(html, /src="https:\/\/img.mbmc.vn\/machines\/one\/card.webp"/);
  assert.match(html, /alt="Ảnh đại diện MacBook Air M2"/);
  assert.match(html, /<dt>Model<\/dt><dd>MacBook Air M2<\/dd>/);
  assert.match(html, /MBMC-001/);
  assert.match(html, /href="\/care\/MBMC-001"/);
  assert.match(html, /Còn bảo hành/);
  assert.match(html, /1 tháng/);
  assert.doesNotMatch(html, /PRIVATE_|original.webp/);
  publicMachine = null;
});

test("unavailable public Machine projection keeps a deliberate placeholder and never infers model from reports", async () => {
  globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: publicReports() });
  for (const value of [null, { ...careMachine("sold"), machine_id: "MBMC-OTHER" }]) {
    publicMachine = value;
    const html = await render();
    assert.match(html, /class="machinePhoto"/);
    assert.match(html, /Chưa có ảnh công khai/);
    assert.doesNotMatch(html, /<img |<dt>Model<\/dt>|Wrong machine/);
    assert.match(html, /Thông tin bảo hành chưa được công bố/);
  }
  machineReadFails = true;
  const html = await render();
  assert.match(html, /Chưa có ảnh công khai/);
  assert.doesNotMatch(html, unavailable);
  assert.doesNotMatch(html, /PRIVATE_INVENTORY_FAILURE/);
  machineReadFails = false;
  publicMachine = null;
});

test("serial-only report result does not read inventory or invent a Machine image", async () => {
  const before = machineReads;
  globalThis.fetch = async () => Response.json({ machine_id: null, machine_path: null, reports: publicReports() });
  const html = await render("C02ABC123456");
  assert.equal(machineReads, before);
  assert.doesNotMatch(html, /class="machinePhoto"|<img |<dt>Model<\/dt>/);
  assert.match(html, /Chưa có MBMC Machine ID/);
});

test("representative photo has contained 4:3 frame and mobile single-column metadata", () => {
  const css = readFileSync("src/app/care/lookup.module.css", "utf8");
  assert.match(css, /\.machinePhoto \{[^}]*aspect-ratio: 4 \/ 3[^}]*min-width: 0[^}]*overflow: hidden/);
  assert.match(css, /minmax\(0, 36fr\) minmax\(0, 64fr\)/);
  assert.match(css, /@media \(max-width: 640px\) \{ \.machineBody \{ grid-template-columns: minmax\(0, 1fr\)/);
  const component = readFileSync("src/app/care/CareLookupResults.tsx", "utf8");
  assert.match(component, /objectFit: "contain"/);
});


function careMachine(status = "sold") {
  return {
    machine_id: "MBMC-001", status, deleted_at: null, model_text: "MacBook Air M2",
    machine_family: "macbook", storage_type: "ssd", chip: "M2", ram_gb: 8, ssd_gb: 256, color: "Midnight", retail_price_expected: 15000000,
    public_availability: { state_valid: true, availability: "available", reservation_kind: null },
    machine_publications: { status: "published", slug: "mbmc-one", approved_by: "staff", approved_at: "2026-01-01T00:00:00Z", published_by: "staff", published_at: "2026-01-01T00:00:00Z", approved_editorial_revision: 1, published_editorial_revision: 1 },
    machine_editorials: { revision: 1, public_condition_summary: "Tốt", included_items: {}, reviewed_by: "staff", reviewed_at: "2026-01-01T00:00:00Z" },
    machine_images: [{ id: "internal-image-id", public_url: "https://img.mbmc.vn/machines/one/original.webp", image_type: "cover", image_stage: "listing", visibility: "public", sort_order: 1, is_cover: true, processing_status: "ready", derivatives: { card: { url: "https://img.mbmc.vn/machines/one/card.webp", width: 640, height: 640, mime_type: "image/webp" } }, object_key: "PRIVATE_STORAGE_KEY" }],
    serial: "PRIVATE_SERIAL", internal_id: "PRIVATE_ID",
  };
}

const carePresentation = load("src/data/care/care-machine-presentation.server.ts");
const inventoryProjection = load("src/data/machines/project-public-candidates.ts");

test("sold Machine has exact Care thumbnail while the same fully published row stays out of inventory", async () => {
  const sold = careMachine("sold");
  sold.machine_id = "MBMC-NSXS";
  publicMachine = sold;
  machineQuery.length = 0;
  const presentation = await carePresentation.getCareMachinePresentation("MBMC-NSXS");
  assert.equal(presentation.image.url, "https://img.mbmc.vn/machines/one/card.webp");
  assert.deepEqual(Object.keys(presentation), ["displayName", "image"]);
  assert.deepEqual(Object.keys(presentation.image), ["url", "alt"]);
  assert.doesNotMatch(JSON.stringify(presentation), /PRIVATE_|internal-image-id|serial|status|object_key/);
  assert.deepEqual(inventoryProjection.publicSummaries([sold]), []);
  const stocked = { ...sold, status: "new_in_stock" };
  assert.equal(inventoryProjection.publicSummaries([stocked]).length, 1);
  assert.deepEqual(carePresentation.projectCareMachinePresentation("MBMC-NSXS", stocked), presentation);
  assert.ok(machineQuery.some(call => JSON.stringify(call) === JSON.stringify(["eq", "machine_id", "MBMC-NSXS"])));
  assert.ok(machineQuery.some(call => JSON.stringify(call) === JSON.stringify(["in", "status", ["new_in_stock", "sold"]])));
  assert.ok(machineQuery.some(call => JSON.stringify(call) === JSON.stringify(["limit", 2])));
  assert.doesNotMatch(JSON.stringify(machineQuery), /ilike|serial|search/);
  globalThis.fetch = async () => Response.json({ machine_id: "MBMC-NSXS", machine_path: "/care/MBMC-NSXS", reports: [] });
  assert.match(await render("MBMC-NSXS"), /src="https:\/\/img.mbmc.vn\/machines\/one\/card.webp"/);
  publicMachine = null;
});

test("Care never returns private, raw, provenance or unsafe image URLs; absent image keeps safe identity", () => {
  for (const override of [{ visibility: "private" }, { image_stage: "raw" }, { image_type: "proof" }, { image_type: "bill" }, { public_url: "https://private.local/photo.jpg", derivatives: null }, { public_url: "https://img.mbmc.vn/machines/photo.webp?signature=SECRET", derivatives: null }]) {
    const row = careMachine();
    Object.assign(row.machine_images[0], override);
    assert.equal(carePresentation.projectCareMachinePresentation("MBMC-001", row).image, null);
  }
  const row = careMachine(); row.machine_images = [];
  assert.deepEqual(carePresentation.projectCareMachinePresentation("MBMC-001", row), { displayName: "MacBook Air M2", image: null });
  row.model_text = "serial: C02ABCDE1234";
  assert.equal(carePresentation.projectCareMachinePresentation("MBMC-001", row).displayName, null);
});

test("Care exact identity rejects mismatches, noncanonical IDs and unsupported states before presentation", async () => {
  const before = machineReads;
  for (const id of ["mbmc-001", "MBMC-001%", "C02ABCDE1234", "MBMC-"]) assert.equal(await carePresentation.getCareMachinePresentation(id), null);
  assert.equal(machineReads, before);
  for (const overrides of [{ machine_id: "MBMC-OTHER" }, { status: "draft" }, { deleted_at: "2026-01-01" }]) assert.equal(carePresentation.projectCareMachinePresentation("MBMC-001", { ...careMachine(), ...overrides }), null);
});

test("Care uses canonical cover rather than first sorted photo; ambiguous covers fail closed", () => {
  const row = careMachine();
  row.machine_images.push({ ...row.machine_images[0], id: "first-commercial", public_url: "https://img.mbmc.vn/machines/one/first.webp", sort_order: 0, is_cover: false, image_type: "exterior", derivatives: null });
  assert.equal(carePresentation.projectCareMachinePresentation("MBMC-001", row).image.url, "https://img.mbmc.vn/machines/one/card.webp");
  row.machine_images[1].is_cover = true;
  assert.equal(carePresentation.projectCareMachinePresentation("MBMC-001", row).image, null);
});


test("exact Care presentation rejects ambiguous rows and retains placeholder when a resolved Machine has no image", async () => {
  publicMachine = [careMachine(), careMachine()];
  assert.equal(await carePresentation.getCareMachinePresentation("MBMC-001"), null);
  publicMachine = careMachine(); publicMachine.machine_images = [];
  globalThis.fetch = async () => Response.json({ machine_id: "MBMC-001", machine_path: "/care/MBMC-001", reports: [] });
  const html = await render();
  assert.match(html, /Chưa có ảnh công khai/);
  assert.match(html, /<dt>Model<\/dt><dd>MacBook Air M2<\/dd>/);
  assert.doesNotMatch(html, /<img /);
  publicMachine = null;
});
