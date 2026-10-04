/* Test hook adapters deliberately switch between SSR React and the interaction harness. */
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const modules = new Map();
let hooks = null;
function load(path) {
  path = resolve(path);
  if (modules.has(path)) return modules.get(path).exports;
  const compiledModule = { exports: {} }; modules.set(path, compiledModule);
  const source = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  new Function("require", "module", "exports", source)(name => {
    if (name === "react") return { ...React,
      useState: (...args) => hooks ? hooks.state(...args) : React.useState(...args),
      useRef: (...args) => hooks ? hooks.ref(...args) : React.useRef(...args),
      useCallback: (...args) => hooks ? args[0] : React.useCallback(...args),
      useEffect: (...args) => hooks ? hooks.effects.push(args[0]) : React.useEffect(...args),
    };
    if (name === "next/link") return function TestLink({ children, ...props }) { return React.createElement("a", props, children); };
    if (name === "next/navigation") return { usePathname: () => "/care" };
    if (name === "@/hooks/useContactChannel") return { useContactChannel: () => ({ channel: null, contactLabel: "Messenger", contactUrl: null }), withContactChannel: href => href };
    if (name === "./InventoryExplorer") return { InventoryExplorer: () => React.createElement("div", { id: "inventory-filters" }) };
    if (name.startsWith(".") || name.startsWith("@/")) {
      const base = name.startsWith("@/") ? resolve("src", name.slice(2)) : resolve(dirname(path), name);
      return load(/\.tsx?$/.test(base) ? base : existsSync(base + ".ts") ? base + ".ts" : base + ".tsx");
    }
    return require(name);
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const { MacNavigation, isNavigationPathCurrent } = load("src/components/layout/MacNavigation.tsx");
const { SiteHeader } = load("src/components/layout/SiteHeader.tsx");
const { InventoryPageView } = load("src/app/(sales)/may-dang-co/_components/InventoryPageView.tsx");
const links = [
  { href: "/may-dang-co", label: "Mac đang có", description: "Xem những máy đang sẵn sàng bán" },
  { href: "/chon-macbook", label: "Chọn MacBook", description: "Để MBMC gợi ý theo nhu cầu và ngân sách" },
];

function mount(props = {}) {
  const states = [], refs = [], listeners = new Map();
  const previousDocument = globalThis.document;
  globalThis.document = { addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  let stateIndex = 0, refIndex = 0, cleanups = [], tree, focused = false, childFocused = false;
  const inside = {};
  const context = {
    effects: [],
    state(initial) { const i = stateIndex++; states[i] ??= initial; return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }]; },
    ref(initial) { const i = refIndex++; refs[i] ??= { current: initial }; return refs[i]; },
  };
  const render = () => {
    cleanups.forEach(cleanup => cleanup?.()); context.effects = []; stateIndex = 0; refIndex = 0;
    hooks = context;
    tree = MacNavigation({ links, pathname: "/care", ...props });
    hooks = null;
    refs[0].current = { contains: target => target === inside, querySelector: () => ({ focus: () => { childFocused = true; } }) };
    refs[1].current = { focus: () => { focused = true; } };
    cleanups = context.effects.map(effect => effect());
    return tree;
  };
  render();
  return {
    render, inside, get tree() { return tree; }, get focused() { return focused; }, get childFocused() { return childFocused; },
    button: () => tree.props.children[0], panel: () => tree.props.children[1],
    event: (key, event) => listeners.get(key)?.(event),
    cleanup: () => { cleanups.forEach(cleanup => cleanup?.()); globalThis.document = previousDocument; hooks = null; },
  };
}

test("shared top navigation has one Mac trigger and keeps all other destinations", () => {
  const html = renderToStaticMarkup(React.createElement(SiteHeader));
  const nav = html.match(/<nav class="desktop-navigation"[\s\S]*?<\/nav>/)[0];
  assert.equal((nav.match(/class="mac-navigation-trigger"/g) ?? []).length, 1);
  assert.match(nav, />Mac /);
  assert.doesNotMatch(nav, /Máy đang có/);
  assert.match(nav, /href="\/may-dang-co"/);
  assert.match(nav, /href="\/chon-macbook"/);
  for (const [href, label] of [["/people", "Khách hàng"], ["/chinh-sach", "Chính sách"], ["/phan-mem", "Phần mềm"]]) { assert.match(nav, new RegExp(`href="${href}"`)); assert.match(nav, new RegExp(label)); }
  assert.match(nav, /Bán máy cho MBMC/);
  assert.match(nav, /Messenger/);
  assert.doesNotMatch(nav, /href="\/care"/);
});

test("Mac and child active states cover inventory and chooser routes without prefix collisions", () => {
  for (const pathname of ["/may-dang-co", "/may-dang-co/model", "/chon-macbook", "/chon-macbook/result"]) {
    const menu = mount({ pathname });
    try {
      assert.equal(menu.button().props["data-active"], true);
      assert.equal(menu.panel().props.children.filter(child => child.props["aria-current"] === "page").length, 1);
    } finally { menu.cleanup(); }
  }
  assert.equal(isNavigationPathCurrent("/may-dang-co-extra", "/may-dang-co"), false);
  assert.equal(isNavigationPathCurrent("/care", "/chon-macbook"), false);
  assert.equal(isNavigationPathCurrent("/chon-macbook", "/chon-macbook?contact=zalo"), true);
});

test("desktop hover, click, outside, Escape and focus departure operate the actual Mac disclosure", () => {
  const menu = mount();
  try {
    assert.equal(menu.button().props["aria-expanded"], false);
    assert.equal(menu.panel().props.hidden, true);
    menu.tree.props.onMouseEnter(); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.tree.props.onMouseLeave(); menu.render(); assert.equal(menu.panel().props.hidden, true);
    menu.button().props.onClick(); menu.render(); assert.equal(menu.button().props["aria-expanded"], true);
    assert.equal(menu.button().props.type, "button");
    assert.equal(menu.button().props["aria-controls"], menu.panel().props.id);
    assert.deepEqual(menu.panel().props.children.map(child => child.props.href), links.map(link => link.href));
    menu.event("pointerdown", { target: menu.inside }); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.event("keydown", { key: "Escape" }); menu.render(); assert.equal(menu.panel().props.hidden, true); assert.equal(menu.focused, true);
    menu.button().props.onClick(); menu.render();
    menu.event("pointerdown", { target: {} }); menu.render(); assert.equal(menu.panel().props.hidden, true);
    menu.button().props.onClick(); menu.render();
    menu.tree.props.onBlur({ currentTarget: { contains: target => target === menu.inside }, relatedTarget: menu.inside }); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.tree.props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null }); menu.render(); assert.equal(menu.panel().props.hidden, true);
  } finally { menu.cleanup(); }
});

test("mobile Mac expands on tap with both child links and closes the parent after navigation", () => {
  let navigated = false;
  const menu = mount({ mobile: true, onNavigate: () => { navigated = true; } });
  try {
    assert.equal(menu.tree.props.onMouseEnter, undefined);
    menu.button().props.onClick(); menu.render(); assert.equal(menu.panel().props.hidden, false);
    assert.equal(menu.panel().props.id, "mobile-mac-navigation");
    menu.button().props.onClick(); menu.render(); assert.equal(menu.panel().props.hidden, true);
    menu.button().props.onClick(); menu.render();
    menu.panel().props.children[0].props.onClick(); menu.render(); assert.equal(menu.panel().props.hidden, true); assert.equal(navigated, true);
    assert.match(readFileSync("src/components/layout/SiteHeader.tsx", "utf8"), /<MacNavigation[^>]*mobile onNavigate=\{closeMenu\}/);
  } finally { menu.cleanup(); }
});

test("inventory chooser callout is after live intro and before filters, including empty inventory", () => {
  for (const machines of [[{}], []]) {
    const html = renderToStaticMarkup(React.createElement(InventoryPageView, { machines }));
    assert.match(html, /Chưa biết bắt đầu từ đâu\?/);
    assert.match(html, /href="\/chon-macbook">Để MBMC gợi ý/);
    assert.ok(html.indexOf("inventory-signal") < html.indexOf("inventory-chooser-callout"));
    if (machines.length) assert.ok(html.indexOf("inventory-chooser-callout") < html.indexOf("inventory-filters"));
  }
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /\.mac-navigation-submenu\[hidden\] \{ display: none;/);
  assert.match(css, /\.mac-navigation--mobile \.mac-navigation-submenu \{ position: static; width: 100%/);
  assert.match(css, /@media \(max-width: 40rem\) \{ \.inventory-chooser-callout[^}]*flex-direction: column/);
});


test("ArrowDown opens the disclosure and moves focus to its first link; focused links survive pointer leave", () => {
  const menu = mount();
  const previousRAF = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = callback => callback();
  try {
    let prevented = false;
    menu.button().props.onKeyDown({ key: "ArrowDown", preventDefault: () => { prevented = true; } });
    menu.render();
    assert.equal(prevented, true);
    assert.equal(menu.panel().props.hidden, false);
    assert.equal(menu.childFocused, true);
    menu.tree.props.onFocus({ target: menu.inside }); menu.render();
    menu.tree.props.onMouseLeave(); menu.render();
    assert.equal(menu.panel().props.hidden, false);
  } finally { menu.cleanup(); globalThis.requestAnimationFrame = previousRAF; }
});
