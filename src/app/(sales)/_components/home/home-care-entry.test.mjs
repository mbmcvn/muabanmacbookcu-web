import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const modules = new Map();
const unrelated = new Set(["ClosingDecisionCta", "DecisionProblemFraming", "MbmcDesktopSpotlight", "HowMbmcHelps", "HumanGuidanceEntry", "AvailableMachines", "HomeTrustOverview", "HandoverStorySection", "UncertaintyRecognition"]);
function load(path) {
  path = resolve(path);
  if (modules.has(path)) return modules.get(path).exports;
  const compiledModule = { exports: {} }; modules.set(path, compiledModule);
  const source = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
  new Function("require", "module", "exports", source)(name => {
    if (name === "next/link") return function TestLink({ children, ...props }) { return createElement("a", props, children); };
    if (name === "next/image") return function TestImage({ fill, priority, ...props }) { void fill; void priority; return createElement("img", props); };
    if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    if (unrelated.has(name.slice(2))) { const key = name.slice(2); return { [key]: () => createElement("div", { "data-section": key }) }; }
    if (name.startsWith("@/") || name.startsWith(".")) {
      const base = name.startsWith("@/") ? resolve("src", name.slice(2)) : resolve(dirname(path), name);
      return load(/\.tsx?$/.test(base) ? base : existsSync(base + ".ts") ? base + ".ts" : base + ".tsx");
    }
    return require(name);
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const directory = "src/app/(sales)/_components/home/";
const { HomeView } = load(directory + "HomeView.tsx");
const { HomeHero } = load(directory + "HomeHero.tsx");
const { HomeCareEntry } = load(directory + "HomeCareEntry.tsx");
const { CareLookupForm } = load("src/components/care/CareLookupForm.tsx");
const render = element => renderToStaticMarkup(element);

test("Care entry renders directly after the unchanged hero and before all existing homepage sections", () => {
  const html = render(createElement(HomeView, { machineState: { status: "ready", machines: [] }, homepageStories: [] }));
  const hero = render(createElement(HomeHero));
  assert.ok(html.startsWith(hero + '<section class="container entry"'));
  assert.ok(html.indexOf("home-care-title") < html.indexOf('data-section="MbmcDesktopSpotlight"'));
  assert.match(hero, /href="\/chon-macbook"/);
  assert.match(hero, /href="\/may-dang-co"/);
  assert.match(html, /MBMC CARE/);
  assert.match(html, /Mở hồ sơ máy, bảo hành và báo cáo kiểm tra công khai bằng Serial hoặc MBMC Machine ID\./);
});

test("homepage native GET form preserves serial, Machine ID, shorthand and URL-encoded input", () => {
  const entry = HomeCareEntry();
  const formProps = entry.props.children[1].props;
  for (const value of ["C02ABCDE1234", "MBMC-NSXS", "NSXS", " nsxs ", "MBMC & +/#? tiếng Việt"]) {
    const form = CareLookupForm({ ...formProps, lookup: value });
    const input = form.props.children[1].props.children[0].props.children[1];
    assert.equal(input.props.defaultValue, value);
    assert.equal(input.props.name, "lookup");
    assert.equal(input.props.maxLength, undefined);
    assert.equal(input.props.pattern, undefined);
    assert.equal(input.props.autoCapitalize, "none");
    assert.equal(form.props.method, "get");
    assert.equal(form.props.action, "/care");
    // Browser GET forms serialize the successful named input through URL encoding.
    const destination = new URL(form.props.action + "?" + new URLSearchParams({ [input.props.name]: input.props.defaultValue }), "https://mbmc.vn");
    assert.equal(destination.pathname, "/care");
    assert.equal(destination.searchParams.get("lookup"), value);
    assert.equal([...destination.searchParams].length, 1);
    if (value.includes("&")) assert.match(destination.search, /%26.*%2B.*%2F%23%3F/);
  }
});

test("empty input uses native required validation and accessible keyboard submission without complex UI", () => {
  const form = CareLookupForm(HomeCareEntry().props.children[1].props);
  const [label, control, helper] = form.props.children;
  const input = control.props.children[0].props.children[1];
  const button = control.props.children[1];
  assert.equal(input.props.defaultValue, "");
  assert.equal(input.props.required, true);
  assert.equal(form.props.noValidate, undefined);
  assert.equal(button.props.formNoValidate, undefined);
  assert.equal(button.props.type, "submit");
  assert.equal(label.props.htmlFor, input.props.id);
  assert.equal(input.props["aria-describedby"], helper.props.id);
  assert.equal(input.props.placeholder, "Nhập Serial, MBMC-NSXS hoặc NSXS");
  assert.match(render(form), /<label[^>]*>.*Serial \/ MBMC Machine ID/);
});

test("entry and shared form have no API, normalization or client lookup state; Care retains its original input cap", () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("homepage must not call Care API"); };
  try { assert.match(render(createElement(HomeCareEntry)), /action="\/care"/); }
  finally { globalThis.fetch = originalFetch; }
  for (const path of [directory + "HomeCareEntry.tsx", "src/components/care/CareLookupForm.tsx"]) {
    assert.doesNotMatch(readFileSync(path, "utf8"), /fetch\(|lookupCare|normalizeCare|public-inspection|supabase|useState|useEffect|\.trim\(\).*lookup/);
  }
  const care = readFileSync("src/app/care/CareLookupResults.tsx", "utf8");
  assert.match(care, /SharedCareLookupForm lookup=\{lookup\} maxLength=\{40\}/);
});

test("entry layout is compact and mobile-contained, sharing Care field/button styles and visible focus", () => {
  const css = readFileSync(directory + "HomeCareEntry.module.css", "utf8");
  assert.match(css, /grid-template-columns: minmax\(0, 2fr\) minmax\(0, 3fr\)/);
  assert.match(css, /\.entry \.form[^}]*min-width: 0[^}]*margin: 0/);
  assert.match(css, /@media \(max-width: 56rem\)[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  const shared = readFileSync("src/components/care/CareLookupForm.module.css", "utf8");
  assert.match(shared, /\.inputArea input[^}]*width: 100%[^}]*min-width: 0/);
  assert.match(shared, /input:focus-visible/);
  assert.match(shared, /@media \(max-width: 640px\)[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(shared, /\.submit \{ width: 100%;/);
});


test("homepage and Care use the same grouped editorial control, label, placeholder and quiet helper", () => {
  const { CareLookupForm: CarePageForm } = load("src/app/care/CareLookupResults.tsx");
  for (const element of [createElement(HomeCareEntry), createElement(CarePageForm, { lookup: " nsxs " })]) {
    const html = render(element);
    assert.equal((html.match(/<form /g) ?? []).length, 1);
    assert.equal((html.match(/type="submit"/g) ?? []).length, 1);
    assert.match(html, /method="get"/);
    assert.match(html, /action="\/care"/);
    assert.match(html, /class="control"/);
    assert.match(html, /class="searchIcon" aria-hidden="true" focusable="false"/);
    assert.match(html, /placeholder="Nhập Serial, MBMC-NSXS hoặc NSXS"/);
    assert.match(html, /Dùng Serial trên máy, MBMC Machine ID hoặc 4 ký tự cuối của mã\./);
  }
  assert.match(render(createElement(CarePageForm, { lookup: " nsxs " })), /value=" nsxs "/);
});

test("grouped input and button share height; surfaces stay quiet and Care avoids nested cards", () => {
  const css = readFileSync("src/components/care/CareLookupForm.module.css", "utf8");
  assert.match(css, /\.inputArea input[^}]*min-height: 3\.75rem/);
  assert.match(css, /\.submit \{[^}]*min-height: 3\.75rem/);
  assert.match(css, /\.control:focus-within[^}]*border-color: var\(--accent\)/);
  assert.match(css, /\.submit:focus-visible/);
  assert.doesNotMatch(css, /gradient|box-shadow|border-strong/);
  const pageCss = readFileSync("src/app/care/lookup.module.css", "utf8");
  assert.match(pageCss, /\.searchModule[^}]*minmax\(0, 2fr\) minmax\(0, 3fr\)/);
  assert.doesNotMatch(pageCss.match(/\.searchModule \{[^}]*\}/)[0], /background|border-radius|box-shadow/);
});
