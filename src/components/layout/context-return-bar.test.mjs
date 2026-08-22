import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("./ContextReturnBar.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../../app/(sales)/layout.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../../app/(sales)/sales-bottom-stack.css", import.meta.url), "utf8");

test("return destinations are selected only from the local allowlist", () => {
  assert.match(component, /const RETURN_CONTEXTS = \{[\s\S]*kai:[\s\S]*href: "https:\/\/auryes\.vn\/kai"/);
  assert.match(component, /value in RETURN_CONTEXTS/);
  assert.doesNotMatch(component, /searchParams\.get\(["'](?:return|redirect|url)/);
});

test("query context is persisted and internal navigation restores the session", () => {
  assert.match(component, /searchParams\.get\("context"\)/);
  assert.match(component, /window\.sessionStorage\.setItem\(STORAGE_KEY, context\)/);
  assert.match(component, /nextContext = readStoredContext\(\)/);
  assert.match(component, /const STORAGE_KEY = "mbmc:return-context"/);
});

test("blocked session storage is isolated from visible query behavior", () => {
  assert.match(component, /function storeContext[\s\S]*try \{[\s\S]*sessionStorage\.setItem[\s\S]*catch/);
  assert.match(component, /if \(isReturnContext\(queryContext\)\)[\s\S]*nextContext = queryContext/);
  assert.match(component, /function clearStoredContext[\s\S]*catch/);
});

test("dismiss removes only context and return uses a fixed assignment", () => {
  assert.match(component, /url\.searchParams\.delete\("context"\)/);
  assert.match(component, /window\.history\.replaceState/);
  assert.match(component, /window\.location\.assign\(context\.href\)/);
  assert.doesNotMatch(component, /history\.back/);
});

test("the client island is mounted only in the public sales server layout", () => {
  assert.match(layout, /<Suspense fallback=\{null\}>\s*<ContextReturnBar \/>\s*<\/Suspense>/);
  assert.doesNotMatch(layout, /["']use client["']/);
});

test("bottom stack clears content and both existing machine CTAs", () => {
  assert.match(styles, /return-context-active-clearance/);
  assert.match(styles, /experience-active-clearance/);
  assert.match(styles, /\.public-machine-sticky[\s\S]*bottom: calc/);
  assert.match(styles, /\.machine-sticky-action[\s\S]*bottom: calc/);
  assert.match(styles, /html:is\(\.return-context-active, \.experience-mode-active\) body/);
});

test("bar includes safe area, accessible tap targets, and reduced motion handling", () => {
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /min-height: 2\.75rem/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(component, /aria-label="Đóng thanh quay lại thẻ Kai"/);
});
