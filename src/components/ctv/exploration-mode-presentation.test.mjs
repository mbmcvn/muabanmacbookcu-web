import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(
  new URL("./ExplorationMode.tsx", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../../app/(sales)/sales-experience.css", import.meta.url),
  "utf8",
);
const globals = readFileSync(
  new URL("../../app/globals.css", import.meta.url),
  "utf8",
);

test("normal visitors render no bar and receive no bottom spacing class", () => {
  assert.match(component, /if \(!active\) return null/);
  assert.match(styles, /html\.experience-mode-active body\s*\{/);
  assert.doesNotMatch(styles, /(^|\n)body\s*\{[^}]*padding-bottom/s);
});

test("experience visitors receive a fixed bottom bar and content clearance", () => {
  assert.match(styles, /\.experience-bar\s*\{[^}]*position:\s*fixed/s);
  assert.match(styles, /bottom:\s*0/);
  assert.match(styles, /padding-bottom:\s*var\(--experience-bar-clearance\)/);
  assert.match(component, /classList\.add\(ACTIVE_CLASS\)/);
  assert.match(component, /classList\.remove\(ACTIVE_CLASS\)/);
});

test("sticky top navigation remains unchanged and above normal content", () => {
  assert.match(
    globals,
    /\.site-header\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;[^}]*z-index:\s*50/s,
  );
  assert.doesNotMatch(styles, /\.site-header/);
  assert.doesNotMatch(styles, /\.experience-bar\s*\{[^}]*\n\s*top\s*:/s);
});

test("bar layers above fixed sales CTAs but below intentional overlays", () => {
  assert.match(styles, /\.experience-bar\s*\{[^}]*z-index:\s*40/s);
  assert.match(globals, /\.public-machine-sticky\s*\{[^}]*z-index:\s*29/s);
  assert.match(globals, /\.machine-lightbox\s*\{[^}]*z-index:\s*100/s);
  assert.match(
    styles,
    /experience-mode-active \.public-machine-sticky[\s\S]*bottom:\s*var\(--experience-bar-clearance\)/,
  );
});

test("internal navigation session bootstrap and close behavior are unchanged", () => {
  assert.match(component, /searchParams\.get\("experience"\) === "ctv-join"/);
  assert.match(component, /sessionStorage\.setItem\(KEY, "1"\)/);
  assert.match(component, /sessionStorage\.getItem\(KEY\) === "1"/);
  assert.match(component, /sessionStorage\.removeItem\(KEY\)/);
  assert.match(component, /window\.close\(\)/);
  assert.match(component, /setTimeout\(\(\) => setFallback\(true\), 150\)/);
});

test("responsive layout stays compact", () => {
  assert.match(styles, /@media \(min-width:\s*48rem\)/);
  assert.match(styles, /flex-wrap:\s*wrap/);
  assert.match(styles, /flex-wrap:\s*nowrap/);
  assert.match(styles, /min-height:\s*4\.25rem/);
});
