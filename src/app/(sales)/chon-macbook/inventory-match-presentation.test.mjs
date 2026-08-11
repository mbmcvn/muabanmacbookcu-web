import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inventoryZaloLine, INVENTORY_MATCH_LIMIT, presentInventoryMatches, selectRepresentativeInventoryMatches } from "./inventory-match-presentation.ts";
import { recommendMacBook } from "./recommendation-engine.ts";

const answers = {
  payment: "full", budget: "16-22", stretchBudget: "none", uses: ["office"],
  portability: "frequent", screen: "compact", fulfilment: "showroom",
};

function profile(overrides = {}) {
  const base = recommendMacBook({ ...answers, ...overrides }).profile;
  return base;
}

function ranked(code, financialStatus = "fit", overrides = {}) {
  const family = overrides.family ?? "air";
  const sizeClass = overrides.sizeClass ?? "13";
  const generation = overrides.generation ?? "M1";
  const ramGb = overrides.ramGb ?? 16;
  const ssdGb = overrides.ssdGb ?? 256;
  const year = overrides.year ?? null;
  return {
    machine: {
      schemaVersion: "public-machine-summary.v1",
      code,
      slug: `slug-${code.toLowerCase()}`,
      displayName: family === "pro" ? `MacBook Pro M1 2020 ${sizeClass} inch` : `MacBook Air M1 2020 ${sizeClass} inch`,
      family: family === "pro" ? "Pro" : "Air",
      year,
      screenSizeInches: null,
      chip: generation,
      ramGb,
      ssdGb,
      color: "Xám",
      price: { amount: 20_000_000, currency: "VND" },
      availability: "available",
      reservationKind: null,
      coverImage: { url: "https://img.mbmc.vn/a.webp", alt: "MacBook", width: null, height: null },
      imageCount: 1,
      batteryHealthPercent: null,
      cycleCount: null,
      cosmeticGrade: null,
      conditionSummary: "Máy đẹp",
      warranty: { status: "unknown", durationMonths: null, activatedAt: null, expiresAt: null },
      inspection: { status: "not_available", inspectedAt: null, summary: null },
      contextualLabel: null,
      publishedAt: "2026-08-01T00:00:00Z",
      updatedAt: null,
      ...overrides.machine,
    },
    productClass: `${family}-${sizeClass}`,
    family,
    sizeClass,
    chipClass: { architecture: "apple-silicon", generation },
    ramGb,
    ssdGb,
    priceVnd: 20_000_000,
    financialStatus,
    preferenceScore: overrides.preferenceScore ?? 0,
    scoreBreakdown: { familyPreference: 0, sizePreference: 0, total: overrides.preferenceScore ?? 0 },
    reasons: [],
  };
}

function present(eligible, profileValue = profile()) {
  return presentInventoryMatches(profileValue, { eligible, excluded: [] });
}

test("top matches preserve matcher order", () => {
  const state = present([ranked("B"), ranked("A"), ranked("C")]);
  assert.deepEqual(state.matches.map((match) => match.code), ["B", "A", "C"]);
});
test("excluded and reserved machines are never presented", () => {
  const state = presentInventoryMatches(profile(), { eligible: [ranked("VISIBLE")], excluded: [{ machine: ranked("HIDDEN").machine, reason: "reserved" }] });
  assert.deepEqual(state.matches.map((match) => match.code), ["VISIBLE"]);
  assert.doesNotMatch(JSON.stringify(state), /HIDDEN/);
});
test("at most the configured number of primary matches is presented", () => {
  const state = present(Array.from({ length: 6 }, (_, index) => ranked(`M${index}`)));
  assert.equal(INVENTORY_MATCH_LIMIT, 3);
  assert.equal(state.matches.length, 3);
});
test("production-like duplicate Air M1 units yield distinct visible representatives", () => {
  const eligible = [
    ranked("J3VB", "fit", { year: 2020, machine: { price: { amount: 9_850_000, currency: "VND" } } }),
    ranked("RT3X", "fit", { year: 2020, machine: { color: "Vàng", price: { amount: 10_600_000, currency: "VND" } } }),
    ranked("KYDD", "fit", { year: 2020, machine: { color: "Bạc", price: { amount: 10_800_000, currency: "VND" } } }),
    ranked("HBV9", "fit", { family: "pro", year: 2020, machine: { price: { amount: 12_800_000, currency: "VND" } } }),
    ranked("NMYJ", "fit", { generation: "M2", year: 2022, machine: { price: { amount: 14_600_000, currency: "VND" } } }),
  ];
  const rawOrder = eligible.map((match) => match.machine.code);
  assert.deepEqual(present(eligible).matches.map((match) => match.code), ["J3VB", "HBV9", "NMYJ"]);
  assert.deepEqual(eligible.map((match) => match.machine.code), rawOrder);
});
test("highest-ranked unit remains its group representative despite physical-unit differences", () => {
  const selected = selectRepresentativeInventoryMatches([
    ranked("FIRST", "fit", { year: 2020 }),
    ranked("COLOR", "fit", { year: 2020, machine: { color: "Bạc" } }),
    ranked("BATTERY", "fit", { year: 2020, machine: { batteryHealthPercent: 99 } }),
    ranked("M2", "fit", { generation: "M2", year: 2022 }),
  ]);
  assert.deepEqual(selected.map((match) => match.machine.code), ["FIRST", "M2", "COLOR"]);
});
test("one unique group backfills skipped units in original order", () => {
  const selected = selectRepresentativeInventoryMatches([ranked("A"), ranked("B"), ranked("C"), ranked("D")]);
  assert.deepEqual(selected.map((match) => match.machine.code), ["A", "B", "C"]);
});
test("two unique groups backfill the third slot deterministically", () => {
  const selected = selectRepresentativeInventoryMatches([
    ranked("A", "fit", { year: 2020 }),
    ranked("B", "fit", { year: 2020 }),
    ranked("M2", "fit", { generation: "M2", year: 2022 }),
  ]);
  assert.deepEqual(selected.map((match) => match.machine.code), ["A", "M2", "B"]);
});
test("distinct RAM SSD chip product class and year each create distinct groups", () => {
  const selected = selectRepresentativeInventoryMatches([
    ranked("BASE", "fit", { year: 2020 }),
    ranked("RAM", "fit", { ramGb: 24, year: 2020 }),
    ranked("SSD", "fit", { ssdGb: 512, year: 2020 }),
    ranked("CHIP", "fit", { generation: "M2", year: 2020 }),
    ranked("CLASS", "fit", { family: "pro", year: 2020 }),
    ranked("YEAR", "fit", { year: 2022 }),
  ], 6);
  assert.deepEqual(selected.map((match) => match.machine.code), ["BASE", "RAM", "SSD", "CHIP", "CLASS", "YEAR"]);
});
test("missing year has a stable fallback and does not crash", () => {
  const selected = selectRepresentativeInventoryMatches([
    ranked("UNKNOWN-A"), ranked("UNKNOWN-B"), ranked("KNOWN", "fit", { year: 2020 }),
  ]);
  assert.deepEqual(selected.map((match) => match.machine.code), ["UNKNOWN-A", "KNOWN", "UNKNOWN-B"]);
});
test("selector does not mutate matcher scores or raw order", () => {
  const eligible = [ranked("A", "fit", { preferenceScore: 3 }), ranked("B", "fit", { preferenceScore: 1 })];
  const before = structuredClone(eligible);
  selectRepresentativeInventoryMatches(eligible);
  assert.deepEqual(eligible, before);
});
test("fit uses natural Vietnamese budget copy", () => assert.equal(present([ranked("FIT")]).matches[0].budgetLabel, "Vừa ngân sách"));
test("stretch uses natural Vietnamese budget copy", () => assert.equal(present([ranked("MORE", "stretch")]).matches[0].budgetLabel, "Có thể cân nhắc thêm"));
test("unknown omits budget commentary", () => assert.equal(present([ranked("UNKNOWN", "unknown")]).matches[0].budgetLabel, null));
test("conflict does not displace fit or stretch matches", () => {
  const state = present([ranked("HIGH", "conflict"), ranked("FIT", "fit"), ranked("MORE", "stretch")]);
  assert.deepEqual(state.matches.map((match) => match.code), ["FIT", "MORE"]);
});
test("conflict cannot displace fit for diversity", () => {
  const state = present([
    ranked("FIT-A", "fit", { year: 2020 }),
    ranked("FIT-B", "fit", { year: 2020 }),
    ranked("FIT-C", "fit", { year: 2020 }),
    ranked("CONFLICT-M2", "conflict", { generation: "M2", year: 2022 }),
  ]);
  assert.deepEqual(state.matches.map((match) => match.code), ["FIT-A", "FIT-B", "FIT-C"]);
});
test("conflict cannot displace stretch for diversity", () => {
  const state = present([
    ranked("STRETCH-A", "stretch", { year: 2020 }),
    ranked("STRETCH-B", "stretch", { year: 2020 }),
    ranked("CONFLICT-M2", "conflict", { generation: "M2", year: 2022 }),
  ]);
  assert.deepEqual(state.matches.map((match) => match.code), ["STRETCH-A", "STRETCH-B"]);
});
test("only-conflict inventory becomes an honest secondary state", () => {
  const state = present([ranked("HIGH-A", "conflict"), ranked("HIGH-B", "conflict"), ranked("HIGH-C", "conflict")]);
  assert.equal(state.mode, "above-budget");
  assert.equal(state.matches.length, 2);
  assert.ok(state.matches.every((match) => match.budgetLabel === "Cao hơn mức dự tính"));
});
test("conflict-only pool is diversified within its existing two-card limit", () => {
  const state = present([
    ranked("HIGH-A", "conflict", { year: 2020 }),
    ranked("HIGH-B", "conflict", { year: 2020 }),
    ranked("HIGH-M2", "conflict", { generation: "M2", year: 2022 }),
  ]);
  assert.deepEqual(state.matches.map((match) => match.code), ["HIGH-A", "HIGH-M2"]);
});
test("zero eligible inventory stays empty", () => assert.deepEqual(present([]), { status: "empty" }));
test("Air and Pro can both be presented when both are allowed", () => {
  const state = present([ranked("AIR"), ranked("PRO", "fit", { family: "pro" })]);
  assert.deepEqual(state.matches.map((match) => match.displayName), ["MacBook Air 2020 13 inch", "MacBook Pro 2020 13 inch"]);
});
test("eligible Air remains valid customer copy when Pro is preferred", () => {
  const state = present([ranked("AIR")], profile({ uses: ["video"], videoWorkload: "sustained_daily" }));
  assert.match(state.matches[0].reason, /Vẫn đáp ứng nhu cầu/);
  assert.doesNotMatch(state.matches[0].reason, /không đủ|không phù hợp|sai/i);
});
test("size trade-off preserves multiple matcher-selected sizes", () => {
  const state = present(
    [ranked("COMPACT"), ranked("LARGE", "fit", { sizeClass: "15" })],
    profile({ portability: "frequent", screen: "large" }),
  );
  assert.equal(state.hasSizeTradeoff, true);
  assert.equal(state.matches.length, 2);
});
test("presentation DTO exposes neither score nor diagnostics", () => {
  const serialized = JSON.stringify(present([ranked("SAFE", "fit", { preferenceScore: 3 })]));
  assert.doesNotMatch(serialized, /preferenceScore|scoreBreakdown|diagnostic|excluded|productClass/);
});
test("machine detail uses the canonical public slug route", async () => {
  const source = await readFile(new URL("./InventoryMatchSection.tsx", import.meta.url), "utf8");
  assert.match(source, /href={`\/(?:may)\/\$\{match\.slug\}`}/);
});
test("more matching machines browse link renders on the canonical inventory route", async () => {
  const source = await readFile(new URL("./InventoryMatchSection.tsx", import.meta.url), "utf8");
  assert.match(source, /href="\/may-dang-co">Xem thêm máy phù hợp<\/Link>/);
});
test("Zalo summary includes only the top visible match", () => {
  const state = present([ranked("FIRST"), ranked("SECOND")]);
  const line = inventoryZaloLine(state);
  assert.match(line, /FIRST/);
  assert.doesNotMatch(line, /SECOND/);
});
test("zero-match Zalo summary is explicit", () => {
  assert.equal(inventoryZaloLine({ status: "empty" }), "Hiện chưa có máy đang có khớp đủ tiêu chí.");
});
test("inventory failure adds no misleading Zalo inventory claim", () => assert.equal(inventoryZaloLine({ status: "failed" }), null));
test("inventory failure is isolated from the recommendation result", async () => {
  const action = await readFile(new URL("./inventory-match.actions.ts", import.meta.url), "utf8");
  const view = await readFile(new URL("./RecommendationView.tsx", import.meta.url), "utf8");
  assert.match(action, /catch\s*{/);
  assert.match(action, /status:\s*"failed"/);
  assert.match(view, /buildZaloSummary\(answers, result\)/);
});
test("server boundary uses only the existing matcher entry point", async () => {
  const source = await readFile(new URL("./inventory-match.actions.ts", import.meta.url), "utf8");
  assert.match(source, /matchAvailablePublicInventory\(profile\)/);
  assert.doesNotMatch(source, /supabase|from\(["']machines|payments|publications|\bsales\b/i);
});
