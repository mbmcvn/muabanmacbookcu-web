import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const block = readFileSync(
  new URL("./CareStoryBlock.tsx", import.meta.url),
  "utf8",
);
const body = readFileSync(
  new URL("./CareStoryBody.tsx", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("./CareStoryBlock.module.css", import.meta.url),
  "utf8",
);
const page = readFileSync(
  new URL("../../app/care/[machine_id]/page.tsx", import.meta.url),
  "utf8",
);

test("Care story keeps the complete story in a compact four-line default view", () => {
  assert.match(block, /if \(!story\) return null/);
  assert.match(block, /<CareStoryBody story=\{story\} \/>/);
  assert.match(body, /\{story\.story\}/);
  assert.match(body, /styles\.storyCollapsed/);
  assert.match(styles, /-webkit-line-clamp:\s*4/);
  assert.doesNotMatch(body, /slice\(|substring\(|substr\(/);
});

test("short stories omit expansion while long stories toggle complete content", () => {
  assert.match(body, /scrollHeight > element\.clientHeight/);
  assert.match(body, /\{expandable && \(/);
  assert.match(body, /setExpanded\(\(value\) => !value\)/);
  assert.match(body, /expanded \? "Thu gọn" : "Xem thêm"/);
});

test("expansion is an accessible keyboard button independent from People navigation", () => {
  assert.match(body, /<button/);
  assert.match(body, /aria-expanded=\{expanded\}/);
  assert.match(body, /aria-controls=\{storyId\}/);
  assert.match(body, /<Link href=\{story\.peopleHref\}/);
  assert.match(body, /story\.peopleHref &&/);
  assert.match(body, /<\/button>[\s\S]*<Link/);
  assert.doesNotMatch(body, /`\/people\/\$\{/);
});

test("Care page uses its contextual block without the Homepage shared card", () => {
  assert.match(page, /<CareStoryBlock story=\{careStory\} \/>/);
  assert.doesNotMatch(page, /HandoverStoryCard/);
});
