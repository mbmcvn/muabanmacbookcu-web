import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { recommendationAuditScenarios, runRecommendationAuditHarness } from "./scenario-simulator.ts";

const audits = new Map(runRecommendationAuditHarness().map((audit) => [audit.scenario.id, audit]));
const audit = (id) => audits.get(id);

test("all 20 required baseline and edge scenarios exist", () => {
  assert.equal(recommendationAuditScenarios.length, 20);
  assert.deepEqual(recommendationAuditScenarios.map((item) => item.id), [
    "S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10",
    "S11", "S12", "S13", "S14", "S15", "E01", "E02", "E03", "E04", "E05",
  ]);
});

for (const [id, ram, storage] of [
  ["S01", 8, 256], ["S04", 8, 256], ["S05", 16, 256], ["S07", 8, 256],
  ["S08", 16, 256], ["S09", 16, 256], ["S12", 16, 256], ["S13", 16, 256], ["S15", 16, 256],
]) {
  test(`${id} locks semantic RAM/storage truth`, () => {
    assert.equal(audit(id).resolvedTruth.minimumRamGb, ram);
    assert.equal(audit(id).resolvedTruth.effectiveStorageFloor, storage);
  });
}

test("S03 preserves the size trade-off", () => assert.equal(audit("S03").resolvedTruth.sizeTradeoff, true));
test("one-off heavy work does not become sustained or force Pro", () => {
  assert.equal(audit("S05").resolvedTruth.sustainedPerformance, false);
  assert.equal(audit("S05").resolvedTruth.preferredFamily, null);
});
test("sustained design video and development prefer Pro while Air remains allowed", () => {
  for (const id of ["S06", "S09", "S13"]) {
    assert.equal(audit(id).resolvedTruth.sustainedPerformance, true);
    assert.equal(audit(id).resolvedTruth.preferredFamily, "pro");
    assert.ok(audit(id).resolvedTruth.allowedFamilies.includes("air"));
  }
});
test("S14 preserves named software and requests verification without compatibility invention", () => {
  assert.equal(audit("S14").resolvedTruth.verification.softwareName, "Revit");
  assert.equal(audit("S14").resolvedTruth.verification.required, true);
  assert.doesNotMatch(audit("S14").customerPresentation.summary, /tương thích|chạy được/i);
});
test("S15 budget conflict never weakens 16GB technical truth", () => {
  assert.equal(audit("S15").resolvedTruth.minimumRamGb, 16);
  assert.ok(audit("S15").inventoryAudit.ranked.every((match) => match.ramGb >= 16));
  assert.equal(audit("S15").inventoryAudit.ranked[0].priceVnd, 21_000_000);
  assert.doesNotMatch(audit("S15").flags.join(" "), /tie-break/);
});
test("E01 accepts larger SSD without rewriting 256GB recommendation truth", () => {
  assert.equal(audit("E01").resolvedTruth.effectiveStorageFloor, 256);
  assert.deepEqual(audit("E01").inventoryAudit.ranked.map((match) => match.ssdGb), [512, 1024]);
  assert.doesNotMatch(audit("E01").customerPresentation.summary, /(?:cần|tối thiểu)[^.]*512/i);
  assert.deepEqual(audit("E01").flags, []);
});
test("E02 treats a price below the comfort minimum as fit", () => assert.equal(audit("E02").inventoryAudit.ranked[0].financialStatus, "fit"));
test("E03 retains above-budget technical matches as conflict", () => {
  assert.equal(audit("E03").inventoryAudit.ranked.length, 1);
  assert.equal(audit("E03").inventoryAudit.ranked[0].financialStatus, "conflict");
  assert.equal(audit("E03").inventoryAudit.presentation.mode, "above-budget");
});
test("E04 remains zero and exposes fail-closed exclusion reasons", () => {
  assert.equal(audit("E04").inventoryAudit.ranked.length, 0);
  assert.deepEqual(audit("E04").inventoryAudit.exclusions, { reserved: 1, intel: 1, "insufficient-storage": 1, "insufficient-ram": 1 });
});
test("E05 exposes stable code tie-breaking", () => {
  assert.deepEqual(audit("E05").inventoryAudit.ranked.map((match) => match.code), ["AUD-EQ-A", "AUD-EQ-B"]);
  assert.ok(audit("E05").flags.includes("code-slug-tie-break-decides-top-result"));
});
test("audit output exposes scoring and tie-break detail only in the internal harness", () => {
  const top = audit("S01").inventoryAudit.ranked[0];
  assert.deepEqual(Object.keys(top.scoreBreakdown ?? {}), []);
  assert.equal(typeof top.familyPreferenceScore, "number");
  assert.equal(typeof top.sizePreferenceScore, "number");
  assert.equal(typeof top.totalPreferenceScore, "number");
  assert.deepEqual(Object.keys(top.tieBreakValues), ["priceVnd", "code", "slug"]);
});
test("harness reuses every production pipeline stage and defines no policy weights", async () => {
  const source = await readFile(new URL("./scenario-simulator.ts", import.meta.url), "utf8");
  for (const entryPoint of ["normalizeRecommendationSignals", "resolveRecommendationProfile", "presentRecommendation", "matchPublicInventory", "presentInventoryMatches"]) assert.match(source, new RegExp(`${entryPoint}\\(`));
  assert.doesNotMatch(source, /weightsEditor|margin|acquisition|stockAge|supabase/i);
});
