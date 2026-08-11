import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { inventoryZaloLine, INVENTORY_MATCH_LIMIT, presentInventoryMatches } from "./inventory-match-presentation.ts";
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
  return {
    machine: {
      schemaVersion: "public-machine-summary.v1",
      code,
      slug: `slug-${code.toLowerCase()}`,
      displayName: family === "pro" ? `MacBook Pro M1 2020 ${sizeClass} inch` : `MacBook Air M1 2020 ${sizeClass} inch`,
      family: family === "pro" ? "Pro" : "Air",
      year: null,
      screenSizeInches: null,
      chip: "M1",
      ramGb: 16,
      ssdGb: 256,
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
    chipClass: { architecture: "apple-silicon", generation: "M1" },
    ramGb: 16,
    ssdGb: 256,
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
test("fit uses natural Vietnamese budget copy", () => assert.equal(present([ranked("FIT")]).matches[0].budgetLabel, "Vừa ngân sách"));
test("stretch uses natural Vietnamese budget copy", () => assert.equal(present([ranked("MORE", "stretch")]).matches[0].budgetLabel, "Có thể cân nhắc thêm"));
test("unknown omits budget commentary", () => assert.equal(present([ranked("UNKNOWN", "unknown")]).matches[0].budgetLabel, null));
test("conflict does not displace fit or stretch matches", () => {
  const state = present([ranked("HIGH", "conflict"), ranked("FIT", "fit"), ranked("MORE", "stretch")]);
  assert.deepEqual(state.matches.map((match) => match.code), ["FIT", "MORE"]);
});
test("only-conflict inventory becomes an honest secondary state", () => {
  const state = present([ranked("HIGH-A", "conflict"), ranked("HIGH-B", "conflict"), ranked("HIGH-C", "conflict")]);
  assert.equal(state.mode, "above-budget");
  assert.equal(state.matches.length, 2);
  assert.ok(state.matches.every((match) => match.budgetLabel === "Cao hơn mức dự tính"));
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
