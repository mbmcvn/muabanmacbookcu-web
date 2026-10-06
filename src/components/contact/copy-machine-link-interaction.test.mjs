/* Hook adapters call the real rendered button handler and replay state/timer updates. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import ts from "typescript";
import { copyText } from "../../lib/copy-text.ts";
import { copyMachineShareUrl } from "../../lib/contact-routing.ts";
import { canonicalMachineUrl } from "../../lib/public-machine-url.ts";

const require = createRequire(import.meta.url);
let feedback, reset, cleanup, delay;
const timer = { current: null };
const output = ts.transpileModule(readFileSync("src/components/contact/CopyMachineLink.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", output)(name => ({
  react: { ...React, useState: () => [feedback, value => { feedback = value; }], useRef: () => timer, useEffect: fn => { cleanup = fn(); } },
  "@/hooks/useContactChannel": { useContactChannel: () => ({ shareReferralCode: "MBMC" }) },
  "@/lib/contact-routing": { copyMachineShareUrl },
  "@/lib/public-machine-url": { canonicalMachineUrl },
  "@/lib/copy-text": { copyText },
}[name] ?? require(name)), loaded, loaded.exports);
const render = () => loaded.exports.CopyMachineLink({ slug: "mbmc-ftff", machineId: "MBMC-FTFF", compact: true });

test("absent browser globals do not affect module loading/render and copy errors stay inside the component", async () => {
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator"), oldDocument = globalThis.document, oldWindow = globalThis.window;
  delete globalThis.navigator; delete globalThis.document;
  globalThis.window = { isSecureContext: false, setTimeout: fn => { reset = fn; return 1; }, clearTimeout() {} };
  try {
    feedback = "idle";
    assert.doesNotThrow(render);
    await assert.doesNotReject(render().props.onClick({ preventDefault() {}, stopPropagation() {} }));
    assert.equal(render().props["data-feedback"], "failed");
    cleanup();
  } finally {
    globalThis.document = oldDocument; globalThis.window = oldWindow;
    if (oldNavigator) Object.defineProperty(globalThis, "navigator", oldNavigator);
  }
});

test("real copy handler prevents navigation, copies attributed canonical URL, shows success and resets", async () => {
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator"), oldWindow = globalThis.window;
  let written, prevented = 0, stopped = 0, cleared = 0;
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard: { writeText: async value => { written = value; } } } });
  globalThis.window = { isSecureContext: true, setTimeout: (fn, ms) => { reset = fn; delay = ms; return 1; }, clearTimeout: () => cleared++ };
  try {
    feedback = "idle";
    await render().props.onClick({ preventDefault: () => prevented++, stopPropagation: () => stopped++ });
    assert.equal(written, "https://mbmc.vn/may/mbmc-ftff?ref=MBMC");
    assert.equal(prevented, 1); assert.equal(stopped, 1);
    const button = render(); assert.equal(button.props["data-feedback"], "copied");
    assert.equal(button.props.children[0].props.children.type, "path");
    assert.equal(button.props.children[0].props.children.props.d, "m5 12 4 4L19 6");
    assert.equal(delay, 1200); reset(); assert.equal(render().props["data-feedback"], "idle");
    cleanup(); assert.ok(cleared > 0);
    const css = readFileSync("src/app/globals.css", "utf8");
    assert.match(css, /\.machine-card-copy\[data-feedback="copied"\] \{ border-color: var\(--accent-strong\); background: var\(--accent-soft\);/);
  } finally {
    globalThis.window = oldWindow;
    if (oldNavigator) Object.defineProperty(globalThis, "navigator", oldNavigator); else delete globalThis.navigator;
  }
});

test("missing or rejected Clipboard API uses temporary selectable text, removes it and restores focus", async () => {
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator"), oldDocument = globalThis.document, oldElement = globalThis.HTMLElement, oldWindow = globalThis.window;
  let value, removed = 0, focused = 0, selected = 0;
  class FocusTarget { focus() { focused++; } }
  globalThis.HTMLElement = FocusTarget;
  globalThis.window = { isSecureContext: false, setTimeout: fn => { reset = fn; return 1; }, clearTimeout() {} };
  globalThis.document = {
    activeElement: new FocusTarget(), body: { appendChild() {} },
    createElement: () => ({ value: "", style: {}, setAttribute() {}, select() { selected++; value = this.value; }, setSelectionRange() {}, remove() { removed++; } }),
    execCommand: command => command === "copy",
  };
  try {
    for (const clipboard of [undefined, { writeText: async () => { throw new Error("Denied"); } }]) {
      Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard } });
      await copyText("https://mbmc.vn/may/mbmc-ftff?ref=MBMC");
      assert.equal(value, "https://mbmc.vn/may/mbmc-ftff?ref=MBMC");
    }
    assert.equal(selected, 2); assert.equal(removed, 2); assert.equal(focused, 2);
    feedback = "idle";
    assert.equal(globalThis.window.isSecureContext, false);
    await render().props.onClick({ preventDefault() {}, stopPropagation() {} });
    assert.equal(render().props["data-feedback"], "copied");
    assert.equal(removed, 3);
    globalThis.document.execCommand = () => false;
    await assert.rejects(copyText("unchanged")); assert.equal(removed, 4);
    await render().props.onClick({ preventDefault() {}, stopPropagation() {} });
    const failed = render(); assert.equal(failed.props["data-feedback"], "failed");
    assert.equal(failed.props.children[2].props.className, "machine-card-copy-error");
    assert.equal(failed.props.children[2].props.children, "Không thể sao chép");
    cleanup();
  } finally {
    globalThis.document = oldDocument; globalThis.HTMLElement = oldElement; globalThis.window = oldWindow;
    if (oldNavigator) Object.defineProperty(globalThis, "navigator", oldNavigator); else delete globalThis.navigator;
  }
});
