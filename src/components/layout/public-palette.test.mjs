import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const css = readFileSync("src/app/globals.css", "utf8");
const tokens = Object.fromEntries([...css.matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
function color(value) { return value.startsWith("var(") ? color(tokens[value.slice(4, -1)]) : value; }
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
export function contrast(foreground, background) {
  const a = luminance(color(foreground)), b = luminance(color(background));
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
test("public green text, CTA states and focus rings preserve accessible contrast", () => {
  for (const name of ["--accent-strong", "--accent-hover", "--accent-pressed"]) assert.ok(contrast(tokens[name], "#ffffff") >= 4.5, name);
  for (const name of ["--accent-text", "--positive"]) for (const background of ["#ffffff", tokens["--background"], tokens["--accent-soft"], tokens["--accent-border"], tokens["--accent-surface"]]) assert.ok(contrast(tokens[name], background) >= 4.5, name + " on " + background);
  for (const background of ["#ffffff", tokens["--background"], tokens["--accent-soft"], tokens["--accent-border"]]) assert.ok(contrast(tokens["--focus-ring"], background) >= 3, "focus on " + background);
  assert.notEqual(color(tokens["--accent"]), color(tokens["--accent-strong"]));
  assert.equal(tokens["--foreground"], "#181817");
});
test("green CTAs use authority colors while neutral and inverse CTAs retain their roles", () => {
  const form = readFileSync("src/components/care/CareLookupForm.module.css", "utf8");
  assert.match(form, /\.submit \{[^}]*background: var\(--accent-strong\)/);
  assert.match(form, /\.submit:hover:not\(:disabled\).*var\(--accent-hover\)/);
  assert.match(form, /\.submit:active:not\(:disabled\).*var\(--accent-pressed\)/);
  assert.match(css, /\.primary-action \{ background: var\(--foreground\); color: white;/);
  assert.match(css, /\.desktop-navigation \.header-contact \{[^}]*background: #171717;/);
  const home = readFileSync("src/app/(sales)/_components/home/Home.module.css", "utf8");
  assert.match(home, /\.primaryAction \{\s*background: var\(--foreground\)/);
  assert.match(home, /\.desktopSpotlightCopy \.primaryAction \{[^}]*background: var\(--accent-strong\)/);
});
test("Care status colors harmonize while warning, expired, error and warm surfaces remain distinct", () => {
  const care = readFileSync("src/app/care/[machine_id]/care.module.css", "utf8");
  assert.match(care, /\.success \{[^}]*background: var\(--accent-soft\);[^}]*color: var\(--positive\)/);
  assert.match(care, /\.active \{[^}]*background: var\(--accent-soft\);[^}]*color: var\(--positive\)/);
  assert.match(care, /background: #fff1dc;/);
  assert.match(care, /background: #fff0ed;/);
  assert.match(care, /color: #8b2d20;/);
  assert.match(readFileSync("src/app/care/lookup.module.css", "utf8"), /data-warranty-status="expired"[^}]*color: #9b3830;/);
  const entry = readFileSync("src/app/(sales)/_components/home/HomeCareEntry.module.css", "utf8");
  assert.match(entry, /border: 1px solid var\(--care-border\)/);
  assert.match(entry, /background: var\(--care-surface\)/);
  assert.match(css, /background: #f5f1e9;/);
});

test("botanical palette keeps accessible text and a unified support surface", () => {
  assert.equal(tokens["--accent"], "#4e6b55");
  assert.ok(contrast(tokens["--accent"], "#ffffff") >= 4.5);
  assert.ok(contrast(tokens["--accent"], tokens["--accent-soft"]) >= 4.5);
  assert.notEqual(tokens["--accent"], tokens["--accent-text"]);
  const home = readFileSync("src/app/(sales)/_components/home/Home.module.css", "utf8");
  assert.match(home, /\.hero \.primaryAction \{ background: var\(--foreground\)/);
});

test("homepage decision support uses botanical authority with readable light copy", () => {
  const home = readFileSync("src/app/(sales)/_components/home/Home.module.css", "utf8");
  assert.match(home, /\.guidanceAction \{[^}]*background: var\(--accent-strong\);/);
  assert.match(home, /\.guidanceAction \.primaryAction \{[^}]*color: var\(--accent-strong\);/);
  assert.doesNotMatch(home, /#173f32/);
  const background = tokens["--accent-strong"];
  const lightCopy = "#" + background.slice(1).match(/../g).map(c => Math.round(parseInt(c,16) * .3 + 255 * .7).toString(16).padStart(2,"0")).join("");
  assert.ok(contrast(lightCopy, background) >= 4.5);
});

test("hero stays neutral and Care tint is isolated from botanical accents", () => {
  assert.equal(tokens["--care-surface"], "#f0f2ec");
  assert.equal(tokens["--care-border"], "#d3d8ce");
  assert.equal(tokens["--accent-strong"], "#34543d");
  assert.equal(tokens["--accent-surface"], "#eef2ee");
  assert.ok(contrast(tokens["--accent-text"], tokens["--care-surface"]) >= 4.5);
  assert.ok(contrast(tokens["--focus-ring"], tokens["--care-surface"]) >= 3);
  const home = readFileSync("src/app/(sales)/_components/home/Home.module.css", "utf8");
  const heroRules = [...home.matchAll(/\.hero \.primaryAction[^{}]*\{([^}]+)\}/g)].map(m => m[1]);
  assert.equal(heroRules.length, 3);
  for (const rule of heroRules) assert.doesNotMatch(rule, /var\(--accent/);
  assert.match(home, /\.hero \.primaryAction:hover \{ background: #2a2a2a;/);
  assert.match(home, /\.hero \.primaryAction:active \{ background: #111111;/);
});
