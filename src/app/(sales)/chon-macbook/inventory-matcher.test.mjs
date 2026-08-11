import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { classifyCandidatePrice, matchPublicInventory, normalizeMatcherCandidate } from "./inventory-matcher.ts";
import { recommendMacBook } from "./recommendation-engine.ts";

const baseAnswers = {
  payment: "full", budget: "16-22", stretchBudget: "none", uses: ["office"],
  portability: "frequent", screen: "compact", fulfilment: "showroom",
};

function profile(overrides = {}) {
  return recommendMacBook({ ...baseAnswers, ...overrides }).profile;
}

function machine(overrides = {}) {
  return {
    schemaVersion: "public-machine-summary.v1",
    code: "MBMC-A001",
    slug: "macbook-air-a001",
    displayName: "MacBook Air M1 2020 13 inch",
    family: "Air",
    year: null,
    screenSizeInches: null,
    chip: "M1",
    ramGb: 8,
    ssdGb: 256,
    color: "Xám",
    price: { amount: 15_000_000, currency: "VND" },
    availability: "available",
    reservationKind: null,
    coverImage: { url: "https://img.mbmc.vn/a.webp", alt: "MacBook", width: null, height: null },
    imageCount: 1,
    batteryHealthPercent: null,
    cycleCount: null,
    cosmeticGrade: null,
    conditionSummary: "Tình trạng đã được mô tả.",
    warranty: { status: "unknown", durationMonths: null, activatedAt: null, expiresAt: null },
    inspection: { status: "not_available", inspectedAt: null, summary: null },
    contextualLabel: null,
    publishedAt: "2026-08-01T00:00:00Z",
    updatedAt: null,
    ...overrides,
  };
}

function oneMatch(profileValue, machineValue = machine()) {
  return matchPublicInventory(profileValue, [machineValue]);
}

test("available machine can enter matcher", () => assert.equal(oneMatch(profile()).eligible.length, 1));
test("reserved machine is excluded", () => {
  const result = oneMatch(profile(), machine({ availability: "reserved", reservationKind: "deposit" }));
  assert.equal(result.eligible.length, 0);
  assert.equal(result.excluded[0].reason, "reserved");
});

for (const [chip, generation] of [["M1", "M1"], ["Apple M1 Pro", "M1 Pro"], ["M2", "M2"], ["M5 Ultra", "M5 Ultra"]]) {
  test(`${chip} is recognized as Apple Silicon`, () => {
    const normalized = normalizeMatcherCandidate(machine({ chip }));
    assert.equal(normalized.ok, true);
    assert.equal(normalized.ok && normalized.candidate.chipClass.generation, generation);
  });
}

test("Intel is excluded", () => {
  const result = oneMatch(profile(), machine({ chip: "Intel Core i7" }));
  assert.equal(result.excluded[0].reason, "intel");
});
test("unknown chip is excluded", () => {
  const result = oneMatch(profile(), machine({ chip: "Apple custom chip" }));
  assert.equal(result.excluded[0].reason, "unknown-chip");
});

for (const [family, displayName, expected] of [
  ["Air", "MacBook Air M1 2020 13 inch", "air-13"],
  ["Air", "MacBook Air M2 2023 15 inch", "air-15"],
  ["Pro", "MacBook Pro M1 2020 13 inch", "pro-13"],
  ["Pro", "MacBook Pro M1 Pro 2021 14 inch", "pro-14"],
  ["Pro", "MacBook Pro M1 Pro 2021 16 inch", "pro-16"],
]) {
  test(`${expected} maps from canonical family and exact display size`, () => {
    const normalized = normalizeMatcherCandidate(machine({ family, displayName }));
    assert.equal(normalized.ok, true);
    assert.equal(normalized.ok && normalized.candidate.productClass, expected);
  });
}

test("Pro 15 is excluded", () => {
  assert.equal(normalizeMatcherCandidate(machine({ family: "Pro", displayName: "MacBook Pro 2019 15 inch" })).ok, false);
});
test("missing or ambiguous size is excluded", () => {
  for (const displayName of ["MacBook Air M1 2020", "MacBook Air 13 inch / 15 inch"]) {
    const result = normalizeMatcherCandidate(machine({ displayName }));
    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.reason, "unsupported-product-class");
  }
});
test("unknown family is excluded", () => {
  const result = normalizeMatcherCandidate(machine({ family: "Unknown" }));
  assert.equal(result.ok, false);
  assert.equal(!result.ok && result.reason, "unsupported-product-class");
});
test("unsupported Air size is excluded", () => {
  assert.equal(normalizeMatcherCandidate(machine({ displayName: "MacBook Air M3 2024 14 inch" })).ok, false);
});

test("8GB passes an 8GB requirement", () => assert.equal(oneMatch(profile()).eligible.length, 1));
test("8GB fails a 16GB requirement", () => {
  const result = oneMatch(profile({ uses: ["design"], designWorkload: "professional" }));
  assert.equal(result.eligible.length, 0);
  assert.equal(result.excluded[0].reason, "insufficient-ram");
});
test("16GB passes a 16GB requirement", () => {
  const result = oneMatch(profile({ uses: ["design"], designWorkload: "professional" }), machine({ ramGb: 16 }));
  assert.equal(result.eligible.length, 1);
});
test("default 256GB storage floor excludes 128GB", () => {
  const result = oneMatch(profile(), machine({ ssdGb: 128 }));
  assert.equal(result.eligible.length, 0);
  assert.equal(result.excluded[0].reason, "insufficient-storage");
});
test("default 256GB storage floor accepts 256GB", () => {
  assert.equal(oneMatch(profile(), machine({ ssdGb: 256 })).eligible.length, 1);
});
test("default 256GB storage floor accepts 512GB", () => {
  assert.equal(oneMatch(profile(), machine({ ssdGb: 512 })).eligible.length, 1);
});
test("explicit 512GB storage minimum excludes 256GB", () => {
  const base = profile();
  const result = oneMatch({ ...base, technical: { ...base.technical, minimumStorageGb: 512 } }, machine({ ssdGb: 256 }));
  assert.equal(result.excluded[0].reason, "insufficient-storage");
});
test("explicit 512GB storage minimum accepts 512GB", () => {
  const base = profile();
  const result = oneMatch({ ...base, technical: { ...base.technical, minimumStorageGb: 512 } }, machine({ ssdGb: 512 }));
  assert.equal(result.eligible.length, 1);
});
test("16GB requirement does not automatically require 512GB", () => {
  const result = oneMatch(profile({ uses: ["design"], designWorkload: "professional" }), machine({ ramGb: 16, ssdGb: 256 }));
  assert.equal(result.eligible.length, 1);
});
test("zero eligible result remains zero without weakening the storage floor", () => {
  const result = matchPublicInventory(profile(), [
    machine({ code: "MBMC-128-A", slug: "air-128-a", ssdGb: 128 }),
    machine({ code: "MBMC-128-B", slug: "air-128-b", ssdGb: 128 }),
  ]);
  assert.deepEqual(result.eligible, []);
  assert.deepEqual(result.excluded.map((item) => item.reason), ["insufficient-storage", "insufficient-storage"]);
});
test("invalid numeric machine data fails closed", () => {
  for (const invalid of [{ ramGb: null }, { ssdGb: 0 }, { price: { amount: -1, currency: "VND" } }]) {
    assert.equal(normalizeMatcherCandidate(machine(invalid)).ok, false);
  }
});

test("Pro preference does not exclude Air", () => {
  const result = oneMatch(profile({ uses: ["video"], videoWorkload: "sustained_daily" }), machine({ ramGb: 16 }));
  assert.equal(result.eligible.length, 1);
});
test("preferred family receives a higher score", () => {
  const result = matchPublicInventory(profile({ uses: ["video"], videoWorkload: "sustained_daily" }), [
    machine({ code: "MBMC-AIR", slug: "air", ramGb: 16 }),
    machine({ code: "MBMC-PRO", slug: "pro", family: "Pro", displayName: "MacBook Pro M1 2020 13 inch", ramGb: 16 }),
  ]);
  assert.equal(result.eligible[0].productClass, "pro-13");
  assert.equal(result.eligible[0].scoreBreakdown.familyPreference, 2);
  assert.equal(result.eligible[1].scoreBreakdown.familyPreference, 0);
});
test("allowed family restriction is respected", () => {
  const base = profile();
  const result = oneMatch({ ...base, family: { allowed: ["pro"] } });
  assert.equal(result.excluded[0].reason, "disallowed-family");
});

test("preferred size receives a higher score", () => {
  const result = matchPublicInventory(profile(), [
    machine({ code: "MBMC-15", slug: "air-15", displayName: "MacBook Air M2 2023 15 inch" }),
    machine({ code: "MBMC-13", slug: "air-13" }),
  ]);
  assert.equal(result.eligible[0].sizeClass, "13");
  assert.equal(result.eligible[0].scoreBreakdown.sizePreference, 1);
});
test("non-preferred supported size remains eligible", () => {
  assert.equal(oneMatch(profile(), machine({ displayName: "MacBook Air M2 2023 15 inch" })).eligible.length, 1);
});
test("size trade-off preserves compact and large candidates", () => {
  const result = matchPublicInventory(profile({ portability: "frequent", screen: "large" }), [
    machine({ code: "MBMC-13", slug: "air-13" }),
    machine({ code: "MBMC-15", slug: "air-15", displayName: "MacBook Air M2 2023 15 inch" }),
  ]);
  assert.deepEqual(result.eligible.map((item) => item.sizeClass).toSorted(), ["13", "15"]);
});

test("price below comfort minimum is fit", () => assert.equal(classifyCandidatePrice(profile(), 10_000_000), "fit"));
test("price within comfort ceiling is fit", () => assert.equal(classifyCandidatePrice(profile(), 20_000_000), "fit"));
test("price above comfort and inside stretch is stretch", () => assert.equal(classifyCandidatePrice(profile({ stretchBudget: "plus-3" }), 24_000_000), "stretch"));
test("price above stretch is conflict", () => assert.equal(classifyCandidatePrice(profile({ stretchBudget: "plus-3" }), 26_000_000), "conflict"));
test("no stretch and above comfort is conflict", () => assert.equal(classifyCandidatePrice(profile(), 23_000_000), "conflict"));
test("unknown budget produces unknown", () => assert.equal(classifyCandidatePrice(profile({ budget: "unknown", stretchBudget: undefined }), 15_000_000), "unknown"));
test("installment-only produces unknown", () => assert.equal(classifyCandidatePrice(profile({ payment: "installment", budget: undefined, deposit: "high", monthlyPayment: "medium" }), 15_000_000), "unknown"));
test("over-30 has no invented upper ceiling and lower prices still fit", () => {
  const value = profile({ budget: "over-30", stretchBudget: "plus-5" });
  assert.equal(classifyCandidatePrice(value, 20_000_000), "fit");
  assert.equal(classifyCandidatePrice(value, 100_000_000), "fit");
});
test("payment mode both uses cash comfort and stretch", () => {
  assert.equal(classifyCandidatePrice(profile({ payment: "both", stretchBudget: "plus-3" }), 24_000_000), "stretch");
});

test("financial conflict never weakens technical requirements", () => {
  const result = oneMatch(profile({ budget: "under-12", uses: ["design"], designWorkload: "professional" }), machine({ ramGb: 8, price: { amount: 10_000_000, currency: "VND" } }));
  assert.equal(result.eligible.length, 0);
  assert.equal(result.excluded[0].reason, "insufficient-ram");
});
test("zero technically eligible candidates remains zero", () => {
  const result = oneMatch(profile({ uses: ["design"], designWorkload: "professional" }), machine({ ramGb: 8 }));
  assert.deepEqual(result.eligible, []);
});
test("ranking orders financial class before preference score", () => {
  const preferredConflict = machine({ code: "MBMC-PRO", slug: "pro", family: "Pro", displayName: "MacBook Pro M1 2020 13 inch", ramGb: 16, price: { amount: 30_000_000, currency: "VND" } });
  const airFit = machine({ code: "MBMC-AIR", slug: "air", ramGb: 16, price: { amount: 20_000_000, currency: "VND" } });
  const result = matchPublicInventory(profile({ uses: ["video"], videoWorkload: "sustained_daily" }), [preferredConflict, airFit]);
  assert.equal(result.eligible[0].machine.code, "MBMC-AIR");
});
test("same financial class and preference score ranks lower asking price first", () => {
  const result = matchPublicInventory(profile(), [
    machine({ code: "MBMC-CHEAP-CODE-LATE", slug: "cheap", price: { amount: 15_000_000, currency: "VND" } }),
    machine({ code: "MBMC-EXPENSIVE-CODE-EARLY", slug: "expensive", price: { amount: 20_000_000, currency: "VND" } }),
  ]);
  assert.deepEqual(result.eligible.map((item) => item.machine.code), ["MBMC-CHEAP-CODE-LATE", "MBMC-EXPENSIVE-CODE-EARLY"]);
});
test("higher preference score still ranks before a cheaper machine", () => {
  const result = matchPublicInventory(profile(), [
    machine({ code: "MBMC-CHEAP", slug: "cheap", displayName: "MacBook Air M2 2023 15 inch", price: { amount: 15_000_000, currency: "VND" } }),
    machine({ code: "MBMC-PREFERRED", slug: "preferred", price: { amount: 20_000_000, currency: "VND" } }),
  ]);
  assert.deepEqual(result.eligible.map((item) => item.machine.code), ["MBMC-PREFERRED", "MBMC-CHEAP"]);
});
test("financial class remains ahead of price tie-breaking", () => {
  const result = matchPublicInventory(profile({ stretchBudget: "plus-3" }), [
    machine({ code: "MBMC-STRETCH", slug: "stretch", price: { amount: 23_000_000, currency: "VND" } }),
    machine({ code: "MBMC-FIT", slug: "fit", price: { amount: 22_000_000, currency: "VND" } }),
  ]);
  assert.deepEqual(result.eligible.map((item) => item.financialStatus), ["fit", "stretch"]);
});
test("same class score and price use machine code as deterministic tie-breaker", () => {
  const result = matchPublicInventory(profile(), [machine({ code: "MBMC-B", slug: "b" }), machine({ code: "MBMC-A", slug: "a" })]);
  assert.deepEqual(result.eligible.map((item) => item.machine.code), ["MBMC-A", "MBMC-B"]);
});
test("same class score price and code use slug as final deterministic tie-breaker", () => {
  const result = matchPublicInventory(profile(), [machine({ code: "MBMC-SAME", slug: "z-slug" }), machine({ code: "MBMC-SAME", slug: "a-slug" })]);
  assert.deepEqual(result.eligible.map((item) => item.machine.slug), ["a-slug", "z-slug"]);
});
test("larger SSD receives no overspec penalty and lower asking price still wins", () => {
  const result = matchPublicInventory(profile(), [
    machine({ code: "MBMC-512", slug: "ssd-512", ssdGb: 512, price: { amount: 20_000_000, currency: "VND" } }),
    machine({ code: "MBMC-1TB", slug: "ssd-1tb", ssdGb: 1024, price: { amount: 19_000_000, currency: "VND" } }),
  ]);
  assert.deepEqual(result.eligible.map((item) => item.ssdGb), [1024, 512]);
});
test("unknown-budget ranking uses preference score then price then code", () => {
  const unknownProfile = profile({ budget: "unknown", stretchBudget: undefined });
  const result = matchPublicInventory(unknownProfile, [
    machine({ code: "MBMC-SCORE-LOW", slug: "score-low", displayName: "MacBook Air M2 2023 15 inch", price: { amount: 10_000_000, currency: "VND" } }),
    machine({ code: "MBMC-B", slug: "b", price: { amount: 18_000_000, currency: "VND" } }),
    machine({ code: "MBMC-C", slug: "c", price: { amount: 15_000_000, currency: "VND" } }),
    machine({ code: "MBMC-A", slug: "a", price: { amount: 15_000_000, currency: "VND" } }),
  ]);
  assert.deepEqual(result.eligible.map((item) => item.machine.code), ["MBMC-A", "MBMC-C", "MBMC-B", "MBMC-SCORE-LOW"]);
  assert.ok(result.eligible.every((item) => item.financialStatus === "unknown"));
});

test("matcher has no commercial or raw operational dependency", async () => {
  const source = await readFile(new URL("./inventory-matcher.ts", import.meta.url), "utf8");
  assert.equal(/margin|acquisition|stock.age|from\(["']machines|\bsales\b|payments|machine_publications|machine_editorials/i.test(source), false);
  assert.match(source, /PublicMachineSummaryV1/);
  assert.equal(/supabase/i.test(source), false);
});

test("server integration reuses the existing public inventory loader", async () => {
  const source = await readFile(new URL("./inventory-matcher.server.ts", import.meta.url), "utf8");
  assert.match(source, /getAvailableMachines/);
  assert.match(source, /matchPublicInventory\(profile, publicMachines\)/);
  assert.equal(/supabase|from\(["']machines|\bsales\b|payments|machine_publications/i.test(source), false);
});
