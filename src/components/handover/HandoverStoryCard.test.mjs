import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const card = readFileSync(new URL("./HandoverStoryCard.tsx", import.meta.url), "utf8");
const section = readFileSync(
  new URL("../../app/(sales)/_components/home/HandoverStorySection.tsx", import.meta.url),
  "utf8",
);

test("card conditionally renders a semantic link and CTA from the supplied href", () => {
  assert.match(card, /story\.imageUrl/);
  assert.match(card, /story\.customerLabel/);
  assert.match(card, /story\.title/);
  assert.match(card, /story\.excerpt/);
  assert.match(card, /import Link from "next\/link"/);
  assert.match(card, /story\.href \?/);
  assert.match(card, /<Link className=\{styles\.link\} href=\{story\.href\}>/);
  assert.match(card, /Đọc câu chuyện →/);
  assert.doesNotMatch(card, /role="link"|cursor-pointer|\/people|canonical|saleId|machineId/);
});

test("section omits empty data and maps one through four stories without placeholders", () => {
  assert.match(section, /stories\.length === 0/);
  assert.match(section, /stories\.map/);
  assert.match(section, /key=\{story\.slug\}/);
  assert.doesNotMatch(section, /placeholder|carousel/);
});
