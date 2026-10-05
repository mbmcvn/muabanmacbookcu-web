/* The adapter switches between server snapshots and a simulated hydrated browser. */
/* eslint-disable react-hooks/rules-of-hooks */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
function browserHarness(initialCookie) {
  const originals = { document: Object.getOwnPropertyDescriptor(globalThis, "document"), localStorage: Object.getOwnPropertyDescriptor(globalThis, "localStorage"), fetch: globalThis.fetch, url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
  let cookie = "mbmc_ctv_referral=" + initialCookie, hydrated = false;
  const calls = [];
  const document = {};
  Object.defineProperty(document, "cookie", { get: () => cookie, set: value => { cookie = value.split(";")[0]; } });
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { setItem() { throw new Error("storage disabled"); } } });
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public-resolver.test";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anonymous-key";
  globalThis.fetch = async (_url, options) => {
    const code = JSON.parse(options.body).p_referral_code; calls.push(code);
    return { ok: true, json: async () => code === "5DZE" ? [{ display_name: "Kris Trần", zalo_phone: "0900000001", facebook_contact_url: "https://m.me/kris.test", preferred_channel: "facebook" }] : [] };
  };
  const modules = new Map();
  function load(file) {
    file = resolve(file);
    if (modules.has(file)) return modules.get(file).exports;
    const mod = { exports: {} }; modules.set(file, mod);
    const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    new Function("require", "module", "exports", source)(name => {
      if (name === "react") return { ...React, useSyncExternalStore: (subscribe, getSnapshot, getServerSnapshot) => hydrated ? getSnapshot() : React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) };
      if (name.startsWith(".") || name.startsWith("@/")) {
        const base = name.startsWith("@/") ? resolve("src", name.slice(2)) : resolve(dirname(file), name);
        return load(/\.tsx?$/.test(base) ? base : base + (existsSync(base + ".ts") ? ".ts" : ".tsx"));
      }
      return require(name);
    }, mod, mod.exports);
    return mod.exports;
  }
  const hook = load("src/hooks/useContactChannel.ts");
  const { ContactActionLink } = load("src/components/contact/ContactActionLink.tsx");
  const render = () => renderToStaticMarkup(React.createElement(ContactActionLink));
  return {
    hook, render, calls, hydrate: () => { hydrated = true; }, cookie: () => cookie,
    cleanup() {
      for (const key of ["document", "localStorage"]) {
        if (originals[key]) Object.defineProperty(globalThis, key, originals[key]); else delete globalThis[key];
      }
      globalThis.fetch = originals.fetch;
      for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", originals.url], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", originals.key]]) {
        if (value === undefined) delete process.env[name]; else process.env[name] = value;
      }
    },
  };
}

test("explicit MBMC replaces persisted 5DZE in actual hook, CTA href, evidence and subsequent funnel browsing", async () => {
  const browser = browserHarness("5DZE");
  try {
    const serverHtml = browser.render();
    browser.hydrate();
    assert.equal(browser.render(), serverHtml);
    await browser.hook.synchronizeContactAttribution("?ref=MBMC");
    assert.equal(browser.render(), serverHtml);
    assert.match(browser.render(), /href="https:\/\/zalo.me\/0326147088"/);
    assert.doesNotMatch(browser.render(), /Kris|kris.test|5DZE/);
    assert.deepEqual(browser.calls, []);
    assert.equal(browser.cookie(), "mbmc_ctv_referral=MBMC");
    const snapshot = browser.hook.useContactChannel();
    assert.equal(snapshot.referralCode, "MBMC");
    assert.equal(snapshot.referralEvidence, null);
    for (const path of ["/", "/may-dang-co?chip=m1", "/may/mbmc-ftff", "/chon-macbook"]) {
      const href = browser.hook.withContactChannel(path, snapshot.channel, snapshot.shareReferralCode);
      assert.equal(new URL(href, "https://mbmc.vn").searchParams.get("ref"), "MBMC");
      await browser.hook.synchronizeContactAttribution(href.split("?")[1]);
      assert.equal(browser.hook.useContactChannel().referralCode, "MBMC");
    }
  } finally { browser.cleanup(); }
});

test("actual partner CTA label, destination, evidence and share context switch together on query changes", async () => {
  const browser = browserHarness("MBMC");
  try {
    browser.hydrate();
    await browser.hook.synchronizeContactAttribution("?ref=5DZE");
    assert.match(browser.render(), /href="https:\/\/m.me\/kris.test"/);
    assert.match(browser.render(), /Nhắn Kris Trần trên Messenger/);
    assert.equal(browser.hook.useContactChannel().referralEvidence, "5DZE");
    assert.equal(browser.hook.useContactChannel().shareReferralCode, "5DZE");
    await browser.hook.synchronizeContactAttribution("?ref=MBMC&channel=messenger");
    assert.match(browser.render(), /href="https:\/\/m.me\/61592174842507"/);
    assert.doesNotMatch(browser.render(), /Kris|kris.test/);
    assert.equal(browser.hook.useContactChannel().referralEvidence, null);
    assert.deepEqual(browser.calls, ["5DZE"]);
    await browser.hook.synchronizeContactAttribution("");
    assert.equal(browser.hook.useContactChannel().referralCode, "MBMC");
  } finally { browser.cleanup(); }
});

test("route observer is a narrow suspense sibling; cookies and storage failures do not disable MBMC", async () => {
  const layout = readFileSync("src/app/(sales)/layout.tsx", "utf8");
  const observer = readFileSync("src/components/contact/ContactAttributionObserver.tsx", "utf8");
  assert.match(layout, /<Suspense fallback=\{null\}><ContactAttributionObserver \/><\/Suspense>/);
  assert.match(observer, /\[pathname, search\]/);
  const browser = browserHarness("%invalid-cookie");
  try {
    browser.hydrate();
    await browser.hook.synchronizeContactAttribution("?ref=MBMC&channel=zalo");
    assert.equal(browser.hook.useContactChannel().referralCode, "MBMC");
    assert.equal(browser.hook.useContactChannel().contactUrl, "https://zalo.me/0326147088");
  } finally { browser.cleanup(); }
});
