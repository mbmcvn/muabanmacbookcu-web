import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildMachineFitRecommendation,
  hasMachineFitRecommendation,
} from "./public-machine-fit-recommendation.ts";

test("8GB configuration produces only the intended RAM caution", () => {
  const result = buildMachineFitRecommendation({ ramGb: 8, ssdGb: null });
  assert.deepEqual(result.suitable, []);
  assert.deepEqual(result.caution.map(({ id, source }) => ({ id, source })), [
    { id: "configuration-ram-8gb", source: "configuration" },
  ]);
});

test("256GB storage produces only the intended storage caution", () => {
  const result = buildMachineFitRecommendation({ ramGb: null, ssdGb: 256 });
  assert.deepEqual(result.caution.map(({ id }) => id), ["configuration-ssd-256gb"]);
});

test("missing values do not produce inferred statements", () => {
  assert.deepEqual(buildMachineFitRecommendation({ ramGb: null, ssdGb: null }), {
    suitable: [],
    caution: [],
  });
});

test("public title is not accepted and no fuzzy title matching occurs", () => {
  const input = {
    ramGb: null,
    ssdGb: null,
    displayName: "MacBook Air M1 2020",
  };
  assert.deepEqual(buildMachineFitRecommendation(input), { suitable: [], caution: [] });
});

test("duplicate manual statements are removed", () => {
  const result = buildMachineFitRecommendation({
    ramGb: null,
    ssdGb: null,
    manualSuitable: ["Làm việc hằng ngày.", "  làm việc hằng ngày  "],
  });
  assert.equal(result.suitable.length, 1);
});

test("empty recommendation output hides the section", () => {
  const result = buildMachineFitRecommendation({ ramGb: 16, ssdGb: 512 });
  assert.equal(hasMachineFitRecommendation(result), false);
  const source = readFileSync(
    new URL("../app/(sales)/may/[slug]/_components/PublicMachineFitRecommendation.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /if \(!hasMachineFitRecommendation\(recommendation\)\) return null/);
});

test("private and internal values are never included", () => {
  const result = buildMachineFitRecommendation({
    ramGb: null,
    ssdGb: null,
    internalNotes: "private repair note",
    reviewedBy: "private owner",
  });
  assert.doesNotMatch(JSON.stringify(result), /private/i);
});
