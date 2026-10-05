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
    if (name.endsWith(".module.css")) return Object.fromEntries(["anchor", "trigger", "panel", "popover", "mobile", "mobilePanel"].map(key => [key, `submenu_${key}`]));
    if (name === "react") return { ...React,
      useState: (...args) => hooks ? hooks.state(...args) : React.useState(...args),
      useRef: (...args) => hooks ? hooks.ref(...args) : React.useRef(...args),
      useCallback: (...args) => hooks ? args[0] : React.useCallback(...args),
      useEffect: (...args) => hooks ? hooks.effects.push(args[0]) : React.useEffect(...args),
    };
    if (name === "next/link") return function TestLink({ children, ...props }) { return React.createElement("a", props, children); };
    if (name === "next/navigation") return { usePathname: () => "/care" };
    if (name === "@/hooks/useContactChannel") return { useContactChannel: () => ({ channel: null, contactLabel: "Messenger", contactUrl: null }), withContactChannel: href => href };
    if (name === "./InventoryExplorer") return { InventoryExplorer: ({ machines, children }) => React.createElement(React.Fragment, null, React.createElement("header", { className: "inventory-signal" }), children, machines.length ? React.createElement("div", { id: "inventory-filters" }) : null) };
    if (name.startsWith(".") || name.startsWith("@/")) {
      const base = name.startsWith("@/") ? resolve("src", name.slice(2)) : resolve(dirname(path), name);
      return load(/\.tsx?$/.test(base) ? base : existsSync(base + ".ts") ? base + ".ts" : base + ".tsx");
    }
    return require(name);
  }, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const { MacNavigation, isNavigationPathCurrent } = load("src/components/layout/MacNavigation.tsx");
const { NavigationSubmenu } = load("src/components/layout/NavigationSubmenu.tsx");
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
    tree = NavigationSubmenu({ name: "mac", label: "Mac", links, pathname: "/care", ...props });
    hooks = null;
    refs[0].current = { contains: target => target === inside, querySelector: selector => { assert.equal(selector, ".navigation-group-submenu a"); return ({ focus: () => { childFocused = true; } }); } };
    refs[1].current = { focus: () => { focused = true; tree.props.onFocus(); } };
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

test("shared top navigation groups Mac and Care and keeps all other destinations", () => {
  const html = renderToStaticMarkup(React.createElement(SiteHeader));
  const nav = html.match(/<nav class="desktop-navigation"[\s\S]*?<\/nav>/)[0];
  assert.equal((nav.match(/class="navigation-group-trigger submenu_trigger"/g) ?? []).length, 2);
  assert.match(nav, /href="\/may-dang-co"[^>]*>Mac<\/a>/);
  assert.doesNotMatch(nav, /navigation-group-chevron|⌄/);
  assert.doesNotMatch(nav, /Máy đang có/);
  assert.match(nav, /href="\/may-dang-co"/);
  assert.match(nav, /href="\/chon-macbook"/);
  for (const [href, label] of [["/people", "Khách hàng"], ["/chinh-sach", "Chính sách"], ["/phan-mem", "Phần mềm"]]) { assert.match(nav, new RegExp(`href="${href}"`)); assert.match(nav, new RegExp(label)); }
  assert.match(nav, /Bán máy cho MBMC/);
  assert.match(nav, /Messenger/);
  assert.match(nav, /href="\/care"[^>]*>Care<\/a>/);
  assert.doesNotMatch(nav, /class="desktop-nav-label-full">Chính sách/);
  assert.match(nav, /<span>Chính sách<\/span><small>Bảo hành, MBMC Care và các chính sách liên quan<\/small>/);
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

test("desktop hover, focus, outside, Escape and focus departure operate the actual Mac disclosure", () => {
  const menu = mount();
  try {
    assert.equal(menu.button().props["aria-expanded"], false);
    assert.equal(menu.panel().props.hidden, true);
    menu.tree.props.onMouseEnter(); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.tree.props.onMouseLeave(); menu.render(); assert.equal(menu.panel().props.hidden, true);
    menu.tree.props.onFocus(); menu.render(); assert.equal(menu.button().props["aria-expanded"], true);
    assert.equal(menu.button().props.href, "/may-dang-co");
    assert.equal(menu.button().props.onClick, undefined);
    assert.equal(menu.button().props["aria-controls"], menu.panel().props.id);
    assert.deepEqual(menu.panel().props.children.map(child => child.props.href), links.map(link => link.href));
    menu.event("pointerdown", { target: menu.inside }); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.event("keydown", { key: "Escape" }); menu.render(); assert.equal(menu.panel().props.hidden, true); assert.equal(menu.focused, true);
    menu.tree.props.onFocus(); menu.render();
    menu.event("pointerdown", { target: {} }); menu.render(); assert.equal(menu.panel().props.hidden, true);
    menu.tree.props.onFocus(); menu.render();
    menu.tree.props.onBlur({ currentTarget: { contains: target => target === menu.inside }, relatedTarget: menu.inside }); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.tree.props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null }); menu.render(); assert.equal(menu.panel().props.hidden, true);
  } finally { menu.cleanup(); }
});

test("mobile Mac navigates and exposes both destinations without disclosure", () => {
  let navigated = false;
  const menu = mount({ mobile: true, onNavigate: () => { navigated = true; } });
  try {
    assert.equal(menu.tree.props.onMouseEnter, undefined);
    assert.equal(menu.button().props.href, "/may-dang-co");
    assert.equal(menu.panel().props.hidden, false);
    assert.deepEqual(menu.panel().props.children.map(child => child.props.href), links.map(link => link.href));
    menu.button().props.onClick(); menu.render(); assert.equal(navigated, true);
    navigated = false;
    menu.panel().props.children[1].props.onClick(); assert.equal(navigated, true);
    assert.equal(menu.panel().props.hidden, false);
  } finally { menu.cleanup(); }
});

test("Mac link activation and Enter do not toggle or intercept navigation", () => {
  const menu = mount();
  try {
    assert.equal(menu.button().props.href, "/may-dang-co");
    assert.equal(menu.button().props.onClick, undefined);
    menu.button().props.onKeyDown({ key: "Enter", preventDefault: () => assert.fail("Enter intercepted") });
    menu.render(); assert.equal(menu.panel().props.hidden, true);
  } finally { menu.cleanup(); }
});

test("inventory page omits the chooser callout and keeps intro before filters", () => {
  for (const machines of [[{}], []]) {
    const html = renderToStaticMarkup(React.createElement(InventoryPageView, { machines }));
    assert.doesNotMatch(html, /inventory-chooser-callout|Chưa biết bắt đầu từ đâu|Để MBMC gợi ý|href="\/chon-macbook"/);
    if (machines.length) assert.ok(html.indexOf("inventory-signal") < html.indexOf("inventory-filters"));
  }
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.doesNotMatch(css, /inventory-chooser-callout/);


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

test("desktop Mac submenu is an independent vertical popover in the header stacking layer", () => {
  const globalCss = readFileSync("src/app/globals.css", "utf8");
  const css = readFileSync("src/components/layout/NavigationSubmenu.module.css", "utf8") + globalCss;
  const rule = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = css.match(new RegExp(escaped + " \\{([^}]+)\\}"));
    assert.ok(match, selector);
    return match[1];
  };
  assert.match(rule(".anchor"), /position: relative;/);
  const popover = rule(".popover");
  for (const declaration of ["position: absolute;", "top: calc(100% + 8px);", "left: 0;", "z-index: 1;", "width: 300px;", "padding: 12px;", "background: var(--surface);"]) {
    assert.ok(popover.includes(declaration), declaration);
  }
  assert.match(popover, /border: 1px solid var\(--border\);/);
  assert.match(popover, /box-shadow:/);
  assert.match(rule(".popover::before"), /height: 8px;/);
  assert.match(rule(".panel"), /display: grid;[\s\S]*grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(rule(".panel.panel > a"), /display: grid;/);
  assert.match(rule(".panel[hidden]"), /display: none;/);
  assert.match(css, /\.panel > a > small \{ display: block;/);
  assert.match(rule(".site-header"), /z-index: 50;/);
  assert.match(rule(".site-header, .header-inner, .desktop-navigation"), /overflow: visible;/);
  for (const selector of ["html", "body", ".container", ".site-header", ".header-inner", ".desktop-navigation", ".anchor"]) {
    assert.doesNotMatch(rule(selector), /(?:overflow(?:-y)?:\s*(?:hidden|clip)|transform:|filter:|isolation:)/);
  }
  assert.match(rule(".mobilePanel"), /position: static;[\s\S]*width: 100%;/);
});

const careLinks = [
  { href: "/care", label: "Tra cứu Care", description: "Tra cứu hồ sơ máy, bảo hành và báo cáo kiểm tra" },
  { href: "/chinh-sach", label: "Chính sách", description: "Bảo hành, MBMC Care và các chính sách liên quan" },
];
const careProps = { name: "care", label: "Care", links: careLinks };

test("Care and its corresponding child activate only Care and policy route families", () => {
  for (const [pathname, child] of [["/care", 0], ["/care/report/abc", 0], ["/chinh-sach", 1], ["/chinh-sach/bao-hanh", 1], ["/chinh-sach/mbmc-care", 1]]) {
    const menu = mount({ ...careProps, pathname });
    try {
      assert.equal(menu.button().props["data-active"], true);
      assert.equal(menu.panel().props.children[child].props["aria-current"], "page");
      assert.equal(menu.panel().props.children[1 - child].props["aria-current"], undefined);
    } finally { menu.cleanup(); }
  }
  for (const pathname of ["/careless", "/chinh-sach-extra", "/may-dang-co", "/chon-macbook", "/people", "/phan-mem"]) {
    const menu = mount({ ...careProps, pathname });
    try { assert.equal(menu.button().props["data-active"], undefined); }
    finally { menu.cleanup(); }
  }
});

test("Care is a direct link with hover, focus, ArrowDown, Escape and outside access", () => {
  const menu = mount(careProps);
  const previousRAF = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = callback => callback();
  try {
    assert.equal(menu.button().props.href, "/care");
    assert.equal(menu.button().props.children, "Care");
    assert.equal(menu.button().props.onClick, undefined);
    assert.equal(menu.button().props["aria-controls"], "desktop-care-navigation");
    assert.equal(menu.tree.props.className, "navigation-group submenu_anchor");
    assert.equal(menu.panel().props.className, "navigation-group-submenu submenu_panel submenu_popover");
    assert.equal(menu.panel().props.hidden, true);
    menu.button().props.onKeyDown({ key: "Enter", preventDefault: () => assert.fail("Enter intercepted") });
    menu.render(); assert.equal(menu.panel().props.hidden, true);
    menu.tree.props.onMouseEnter(); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.tree.props.onMouseLeave(); menu.render(); assert.equal(menu.panel().props.hidden, true);
    menu.tree.props.onFocus(); menu.render(); assert.equal(menu.panel().props.hidden, false);
    menu.tree.props.onBlur({ currentTarget: { contains: () => true }, relatedTarget: menu.inside });
    menu.render(); assert.equal(menu.panel().props.hidden, false);
    assert.deepEqual(menu.panel().props.children.map(child => child.props.href), ["/care", "/chinh-sach"]);
    menu.event("keydown", { key: "Escape" }); menu.render();
    assert.equal(menu.panel().props.hidden, true); assert.equal(menu.focused, true);
    let prevented = false;
    menu.button().props.onKeyDown({ key: "ArrowDown", preventDefault: () => { prevented = true; } });
    menu.render(); assert.equal(prevented, true); assert.equal(menu.childFocused, true);
    assert.equal(menu.panel().props.hidden, false);
    menu.event("pointerdown", { target: {} }); menu.render(); assert.equal(menu.panel().props.hidden, true);
  } finally { menu.cleanup(); globalThis.requestAnimationFrame = previousRAF; }
});

test("mobile Care exposes both child links and the primary link navigates without interception", () => {
  let navigations = 0;
  const menu = mount({ ...careProps, mobile: true, onNavigate: () => { navigations++; } });
  try {
    assert.equal(menu.button().props.href, "/care");
    assert.equal(menu.button().props["aria-controls"], "mobile-care-navigation");
    assert.equal(menu.panel().props.hidden, false);
    assert.deepEqual(menu.panel().props.children.map(child => child.props.href), ["/care", "/chinh-sach"]);
    menu.button().props.onClick(); assert.equal(navigations, 1);
    menu.panel().props.children[1].props.onClick(); assert.equal(navigations, 2);
    menu.render(); assert.equal(menu.panel().props.hidden, false);
  } finally { menu.cleanup(); }
});

test("opened mobile header groups policies under Care and preserves all other primary links", () => {
  hooks = {
    effects: [],
    state: initial => [{ ...initial, open: true }, () => {}],
    ref: () => ({ current: null }),
  };
  let html;
  try { html = renderToStaticMarkup(React.createElement(SiteHeader)); }
  finally { hooks = null; }
  const nav = html.match(/<nav id="mobile-navigation-menu"[\s\S]*?<\/nav>/)[0];
  assert.match(nav, /href="\/care"[^>]*>Care<\/a>/);
  assert.match(nav, /id="mobile-care-navigation" class="navigation-group-submenu submenu_panel submenu_mobilePanel"><a href="\/care"[^>]*><span>Tra cứu Care<\/span>/);
  assert.match(nav, /href="\/chinh-sach"[^>]*><span>Chính sách<\/span><small>/);
  assert.equal((nav.match(/href="\/chinh-sach"/g) ?? []).length, 1);
  for (const href of ["/may-dang-co", "/chon-macbook", "/people", "/phan-mem"]) assert.ok(nav.includes('href="' + href + '"'));
  assert.match(nav, /Bán máy cho MBMC/);
  assert.ok(nav.indexOf('>Mac</a>') < nav.indexOf('>Care</a>'));
  assert.ok(nav.indexOf('>Care</a>') < nav.indexOf('>Khách hàng</span>'));
});


test("Mac and Care carry their own anchor and overlay, independently of a horizontal nav ancestor", () => {
  const mac = MacNavigation({ links, pathname: "/may-dang-co" });
  assert.equal(mac.type, NavigationSubmenu);
  const headerSource = readFileSync("src/components/layout/SiteHeader.tsx", "utf8");
  assert.match(headerSource, /<NavigationSubmenu name="care" label="Care" links={careLinks}/);
  assert.match(readFileSync("src/components/layout/NavigationSubmenu.tsx", "utf8"), /import styles from "\.\/NavigationSubmenu\.module\.css"/);
  const css = readFileSync("src/components/layout/NavigationSubmenu.module.css", "utf8");
  assert.doesNotMatch(css, /desktop-navigation|mac-navigation|care-navigation/);
  assert.match(css, /\.anchor\s*{[^}]*position: relative;[^}]*overflow: visible;/);
  assert.match(css, /\.popover\s*{[^}]*position: absolute;[^}]*top: calc\(100% \+ 8px\);[^}]*left: 0;[^}]*z-index: 1;/);
  for (const props of [mac.props, { ...careProps, pathname: "/care" }]) {
    const menu = mount(props);
    try {
      assert.equal(menu.tree.type, "div");
      assert.equal(menu.tree.props.className, "navigation-group submenu_anchor");
      assert.equal(menu.tree.props.children.length, 2);
      const [trigger, panel] = menu.tree.props.children;
      assert.equal(trigger.props.href, props.links[0].href);
      assert.equal(panel.type, "div");
      assert.equal(panel.props.className, "navigation-group-submenu submenu_panel submenu_popover");
      assert.equal(panel.props.children.length, 2);
      assert.deepEqual(panel.props.children.map(child => child.props.href), props.links.map(link => link.href));
      menu.tree.props.onMouseEnter(); menu.render();
      assert.equal(menu.panel().props.hidden, false);
      assert.equal(menu.panel().props.className, panel.props.className);
    } finally { menu.cleanup(); }
    const mobile = mount({ ...props, mobile: true });
    try {
      assert.equal(mobile.tree.props.className, "navigation-group submenu_anchor navigation-group--mobile submenu_mobile");
      assert.equal(mobile.panel().props.className, "navigation-group-submenu submenu_panel submenu_mobilePanel");
      assert.equal(mobile.panel().props.hidden, false);
      assert.equal(mobile.button().props.href, props.links[0].href);
    } finally { mobile.cleanup(); }
  }
});
