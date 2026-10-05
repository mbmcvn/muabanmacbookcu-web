/* Test hook adapters switch between SSR React and the interaction harness. */
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
let harness;
function load(path) {
  path = resolve(path);
  if (cache.has(path)) return cache.get(path).exports;
  const mod = { exports: {} }; cache.set(path, mod);
  const source = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  new Function("require", "module", "exports", source)(name => {
    if (name === "react") return { ...React, useState: initial => harness ? [harness.state ??= typeof initial === "function" ? initial() : initial, value => { harness.state = value; }] : React.useState(initial), useMemo: fn => harness ? fn() : React.useMemo(fn, []), useEffect: fn => { if (harness) harness.effect = fn; } };
    if (name === "@/hooks/useContactChannel") return { useContactChannel: () => ({ channel: null }), withContactChannel: value => value };
    if (name === "next/link") return function TestLink({ children, ...props }) { return React.createElement("a", props, children); };
    if (name === "./InventoryFilters") return { InventoryFilters: function Filters() {} };
    if (name === "./InventoryToolbar") return { InventoryToolbar: function Toolbar() {} };
    if (name === "./InventoryEmptyState") return { InventoryEmptyState: function Empty() {}, NoPublishedMachinesState: function Unpublished() {} };
    if (name === "./MachineCatalog") return { MachineCatalog: function Catalog() {} };
    if (name === "./DesiredSpecDemand") return { DesiredSpecDemand: function Demand() {} };
    if (name === "@/components/contact/CopyInventoryLink") return { CopyInventoryLink: function Copy() {} };
    if (name.startsWith(".") || name.startsWith("@/")) {
      const base = name.startsWith("@/") ? resolve("src", name.slice(2)) : resolve(dirname(path), name);
      return load(/\.tsx?$/.test(base) ? base : base + (name === "./InventoryIntro" ? ".tsx" : ".ts"));
    }
    return require(name);
  }, mod, mod.exports);
  return mod.exports;
}
const base = "src/app/(sales)/may-dang-co/_components/";
const { buildInventoryHeading } = load(base + "inventory-heading.ts");
const { emptyInventoryFacets, parseInventoryUrlState, serializeInventoryUrlState } = load("src/data/machines/public-inventory-query.ts");
const { InventoryIntro } = load(base + "InventoryIntro.tsx");
const { InventoryExplorer } = load(base + "InventoryExplorer.tsx");
const heading = values => buildInventoryHeading({ ...emptyInventoryFacets(), ...values }).text;

test("headings use canonical public family, chip, RAM and storage labels", () => {
  for (const [facets, expected] of [
    [{}, "Mac đang có"],
    [{ family: "air" }, "Mac Air đang có"],
    [{ family: "air", chip: ["m1"] }, "Mac Air M1 đang có"],
    [{ family: "air", chip: ["m1"], ram: ["8"] }, "Mac Air M1 8GB đang có"],
    [{ family: "air", chip: ["m1"], ram: ["8"], storage: ["256"] }, "Mac Air M1 8GB 256GB đang có"],
    [{ family: "pro", chip: ["m2-pro-max"], ram: ["16"] }, "Mac Pro M2 Pro / M2 Max 16GB đang có"],
    [{ family: "imac", chip: ["m1"], ram: ["16"] }, "iMac M1 16GB đang có"],
    [{ family: "mini", chip: ["m2"], storage: ["1024-plus"] }, "Mac mini M2 1TB+ đang có"],
    [{ chip: ["m3-plus"], ram: ["32-plus"] }, "Mac M3 trở lên 32GB+ đang có"],
  ]) assert.equal(heading(facets), expected);
});

test("ambiguous facets are omitted independently; secondary facets do not describe the title", () => {
  assert.equal(heading({ family: "air", chip: ["m1", "m2"], ram: ["8", "16"], storage: ["256", "512"] }), "Mac Air đang có");
  assert.equal(heading({ family: ["air", "pro"] }), "Mac đang có");
  assert.equal(heading({ family: "air", price: "under-12", screen: ["compact"], display: ["27-5k"], storageType: ["ssd"] }), "Mac Air đang có");
  assert.equal(heading(parseInventoryUrlState(new URLSearchParams("family=air,pro")).facets), "Mac đang có");
});

test("URL parsing and shared URL serialization agree with interactive canonical state", () => {
  const state = { query: "silver", sort: "price-desc", facets: { ...emptyInventoryFacets(), family: "mini", chip: ["m2"], ram: ["16"], storage: ["512"] } };
  assert.equal(buildInventoryHeading(parseInventoryUrlState(new URLSearchParams(serializeInventoryUrlState(state))).facets).text, buildInventoryHeading(state.facets).text);
});

test("one h1 highlights only the descriptor and places the live count immediately below", () => {
  for (const facets of [emptyInventoryFacets(), { ...emptyInventoryFacets(), family: "air", chip: ["m1"] }]) {
    const html = renderToStaticMarkup(React.createElement(InventoryIntro, { total: 3, facets }));
    assert.equal((html.match(/<h1>/g) ?? []).length, 1);
    assert.match(html, /<\/h1><p class="inventory-signal">/);
    assert.equal(html.match(/<h1>(.*?)<\/h1>/)[1].replace(/<[^>]+>/g, ""), buildInventoryHeading(facets).text);
    if (facets.family) assert.match(html, /<span class="inventory-heading-descriptor">Air M1<\/span>/);
    else assert.doesNotMatch(html, /inventory-heading-descriptor/);
  }
});

function find(tree, name) {
  if (!React.isValidElement(tree)) return;
  if (tree.type.name === name) return tree;
  for (const child of React.Children.toArray(tree.props.children)) { const found = find(child, name); if (found) return found; }
}
test("initial URL, interaction, back/forward and reset synchronize heading and results", () => {
  const oldWindow = globalThis.window;
  const listeners = new Map();
  globalThis.window = { location: { search: "?family=air&chip=m1&ram=8", pathname: "/may-dang-co", hash: "" }, history: { pushState() {}, replaceState() {} }, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  harness = {};
  const machine = { displayName: "MacBook Air", code: "test", machineFamily: "macbook", productLine: "macbook-air", chip: "M1", ramGb: 8, storage: { capacityGb: 256, type: "ssd" }, color: null, price: { amount: 10000000 }, familyFacts: { displaySizeInches: 13 } };
  const render = () => InventoryExplorer({ machines: [machine], initialState: parseInventoryUrlState(new URLSearchParams(window.location.search)) });
  try {
    let tree = render();
    const intro = () => find(tree, "InventoryIntro").props;
    assert.equal(heading(intro().facets), "Mac Air M1 8GB đang có"); assert.equal(intro().total, 1);
    const cleanup = harness.effect();
    find(tree, "Filters").props.onMultiChange("ram", ["16"]); tree = render();
    assert.equal(heading(intro().facets), "Mac Air M1 16GB đang có"); assert.equal(intro().total, 0);
    window.location.search = "?family=mini&chip=m2"; listeners.get("popstate")(); tree = render();
    assert.equal(heading(intro().facets), "Mac mini M2 đang có");
    window.location.search = "?family=air&chip=m1&ram=8"; listeners.get("popstate")(); tree = render();
    assert.equal(heading(intro().facets), "Mac Air M1 8GB đang có");
    find(tree, "Filters").props.onClearAll(); tree = render();
    assert.equal(heading(intro().facets), "Mac đang có"); assert.equal(intro().total, 1);
    cleanup(); assert.equal(listeners.has("popstate"), false);
  } finally { harness = undefined; globalThis.window = oldWindow; }
});

test("server and client use the same initial canonical state without changing metadata", () => {
  const page = readFileSync(resolve(base, "../page.tsx"), "utf8");
  const explorer = readFileSync(resolve(base, "InventoryExplorer.tsx"), "utf8");
  assert.match(page, /await searchParams/);
  assert.match(page, /initialState = parseInventoryUrlState\(params\)/);
  assert.match(page, /initialState=\{initialState\}/);
  assert.match(explorer, /useState<InventoryUrlState>\(\(\) => initialState \?\? defaultState\(\)\)/);
  assert.match(page, /metadata: Metadata = \{ title: "Mac đang có"/);
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /\.inventory-heading-descriptor \{ color: var\(--accent\); \}/);
});

test("mobile inventory hides redundant copy and keeps compact controls touchable", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const start = css.indexOf("@media (max-width: 39.99rem)");
  const mobile = css.slice(start, css.indexOf("\n}", start) + 2);
  assert.doesNotMatch(css, /inventory-chooser-callout/);
  assert.match(mobile, /\.inventory-intro > p:not\(\.inventory-signal\) \{ display: none;/);
  assert.match(mobile, /\.facet-trigger, \.facet-group fieldset button \{ min-height: 2\.75rem;/);
  assert.match(mobile, /\.active-facets button \{ min-height: 2\.75rem;/);
  assert.match(mobile, /\.inventory-controls \.search-field \{ min-height: 3rem;/);
  assert.match(mobile, /\.inventory-toolbar \{ min-height: 2\.5rem;/);
  assert.match(mobile, /\.inventory-page \.machine-catalog \{ padding-top: \.75rem;/);
  assert.doesNotMatch(mobile, /(?:[;{]\s*)(?:overflow(?:-x)?|width|grid-template-columns):/);
  assert.match(css, /\.inventory-intro \{ max-width: 47rem; margin-bottom: \.85rem;/);
  assert.match(mobile, /\.inventory-intro \{ margin-bottom: \.5rem;/);
  assert.match(css, /\.inventory-intro > p:not\(\.inventory-signal\) \{ margin-bottom: \.85rem;/);
});
