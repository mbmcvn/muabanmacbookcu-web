import type { PublicMachineSummaryV1 } from "../../../lib/public-projection/contracts";
import { presentInventoryMatches } from "./inventory-match-presentation.ts";
import { matchPublicInventory, type InventoryMatchResult } from "./inventory-matcher.ts";
import {
  normalizeRecommendationSignals,
  presentRecommendation,
  resolveRecommendationProfile,
} from "./recommendation-engine.ts";
import type { ProductFamily, QuizAnswers } from "./quiz-types";

export type AuditCategory = "office" | "design" | "video" | "development" | "specialized" | "financial" | "edge";

export interface RecommendationAuditScenario {
  id: string;
  title: string;
  intent: string;
  categories: AuditCategory[];
  answers: QuizAnswers;
  expectedAudit?: {
    ramGb?: 8 | 16;
    storageGb?: 256 | 512 | 1024;
    familyPreferred?: ProductFamily;
    familyShouldRemainAmbiguous?: boolean;
    sustainedPerformance?: boolean;
    financialExpectation?: string;
    eligibleCount?: number;
    notes?: string[];
  };
  inventory?: readonly PublicMachineSummaryV1[];
}

const baseAnswers: QuizAnswers = {
  payment: "full",
  budget: "16-22",
  stretchBudget: "none",
  uses: ["office"],
  portability: "frequent",
  screen: "compact",
  fulfilment: "showroom",
};

function machine(input: Partial<PublicMachineSummaryV1> & Pick<PublicMachineSummaryV1, "code" | "slug">): PublicMachineSummaryV1 {
  return {
    schemaVersion: "public-machine-summary.v1",
    displayName: "MacBook Air M1 2020 13 inch",
    family: "Air",
    year: 2020,
    screenSizeInches: null,
    chip: "M1",
    ramGb: 8,
    ssdGb: 256,
    color: "Xám",
    price: { amount: 15_000_000, currency: "VND" },
    availability: "available",
    reservationKind: null,
    coverImage: { url: "https://fixtures.mbmc.vn/macbook.webp", alt: "MacBook fixture", width: 800, height: 600 },
    imageCount: 1,
    batteryHealthPercent: null,
    cycleCount: null,
    cosmeticGrade: null,
    conditionSummary: "Fixture phục vụ audit nội bộ.",
    warranty: { status: "unknown", durationMonths: null, activatedAt: null, expiresAt: null },
    inspection: { status: "not_available", inspectedAt: null, summary: null },
    contextualLabel: null,
    publishedAt: "2026-08-01T00:00:00Z",
    updatedAt: null,
    ...input,
  };
}

export const auditInventoryFixtures = {
  air13M1_8_256: machine({ code: "AUD-A13-01", slug: "audit-air-13-m1-8-256" }),
  air13M2_8_512: machine({ code: "AUD-A13-02", slug: "audit-air-13-m2-8-512", displayName: "MacBook Air M2 2022 13 inch", chip: "M2", ssdGb: 512, price: { amount: 17_000_000, currency: "VND" } }),
  air15M2_8_256: machine({ code: "AUD-A15-01", slug: "audit-air-15-m2-8-256", displayName: "MacBook Air M2 2023 15 inch", chip: "M2", price: { amount: 18_000_000, currency: "VND" } }),
  pro13M1_8_256: machine({ code: "AUD-P13-01", slug: "audit-pro-13-m1-8-256", displayName: "MacBook Pro M1 2020 13 inch", family: "Pro", price: { amount: 18_000_000, currency: "VND" } }),
  pro13M2_16_256: machine({ code: "AUD-P13-02", slug: "audit-pro-13-m2-16-256", displayName: "MacBook Pro M2 2022 13 inch", family: "Pro", chip: "M2", ramGb: 16, price: { amount: 21_000_000, currency: "VND" } }),
  pro14M1Pro_16_512: machine({ code: "AUD-P14-01", slug: "audit-pro-14-m1-pro-16-512", displayName: "MacBook Pro M1 Pro 2021 14 inch", family: "Pro", chip: "M1 Pro", ramGb: 16, ssdGb: 512, price: { amount: 27_000_000, currency: "VND" } }),
  pro16M1Pro_16_512: machine({ code: "AUD-P16-01", slug: "audit-pro-16-m1-pro-16-512", displayName: "MacBook Pro M1 Pro 2021 16 inch", family: "Pro", chip: "M1 Pro", ramGb: 16, ssdGb: 512, price: { amount: 31_000_000, currency: "VND" } }),
  reserved: machine({ code: "AUD-RESERVED", slug: "audit-reserved", availability: "reserved", reservationKind: "deposit" }),
  intel: machine({ code: "AUD-INTEL", slug: "audit-intel", displayName: "MacBook Pro 2020 13 inch", family: "Pro", chip: "Intel Core i5" }),
  storage128: machine({ code: "AUD-128", slug: "audit-128", ramGb: 16, ssdGb: 128 }),
  aboveBudget: machine({ code: "AUD-HIGH", slug: "audit-high", displayName: "MacBook Pro M2 Pro 2023 14 inch", family: "Pro", chip: "M2 Pro", ramGb: 16, ssdGb: 512, price: { amount: 40_000_000, currency: "VND" } }),
  equalA: machine({ code: "AUD-EQ-A", slug: "audit-equal-a", price: { amount: 19_000_000, currency: "VND" } }),
  equalB: machine({ code: "AUD-EQ-B", slug: "audit-equal-b", price: { amount: 19_000_000, currency: "VND" } }),
} satisfies Record<string, PublicMachineSummaryV1>;

export const deterministicAuditInventory = Object.values(auditInventoryFixtures);

function scenario(
  id: string,
  title: string,
  intent: string,
  categories: AuditCategory[],
  answerOverrides: Partial<QuizAnswers>,
  expectedAudit: RecommendationAuditScenario["expectedAudit"],
  inventory?: readonly PublicMachineSummaryV1[],
): RecommendationAuditScenario {
  return { id, title, intent, categories, answers: { ...baseAnswers, ...answerOverrides }, expectedAudit, inventory };
}

export const recommendationAuditScenarios: readonly RecommendationAuditScenario[] = [
  scenario("S01", "Office light / compact / normal budget", "Typical light customer.", ["office"], {}, { ramGb: 8, storageGb: 256, familyShouldRemainAmbiguous: true, sustainedPerformance: false }),
  scenario("S02", "Office light / wants large screen", "Screen preference must not imply Pro.", ["office"], { portability: "stationary", screen: "large" }, { ramGb: 8, storageGb: 256, familyShouldRemainAmbiguous: true }),
  scenario("S03", "High portability + large screen", "Preserve the explicit size trade-off.", ["office", "edge"], { portability: "frequent", screen: "large" }, { ramGb: 8, storageGb: 256, notes: ["size.hasTradeoff should remain true"] }),
  scenario("S04", "Design light", "Basic Canva/Figma/image work.", ["design"], { uses: ["design"], designWorkload: "light" }, { ramGb: 8, storageGb: 256, familyShouldRemainAmbiguous: true }),
  scenario("S05", "Heavy Photoshop, not sustained", "Separate professional load from sustained load.", ["design"], { uses: ["design"], designWorkload: "professional" }, { ramGb: 16, storageGb: 256, familyShouldRemainAmbiguous: true, sustainedPerformance: false }),
  scenario("S06", "Heavy Photoshop sustained", "Audit Pro preference without excluding Air.", ["design"], { uses: ["design"], designWorkload: "professional_sustained" }, { ramGb: 16, storageGb: 256, familyPreferred: "pro", sustainedPerformance: true }),
  scenario("S07", "4K video rarely", "4K alone must not force RAM or family.", ["video"], { uses: ["video"], videoWorkload: "long_rare" }, { ramGb: 8, storageGb: 256, familyShouldRemainAmbiguous: true, sustainedPerformance: false }),
  scenario("S08", "4K video weekly", "Weekly video raises RAM without inventing storage or Pro.", ["video"], { uses: ["video"], videoWorkload: "long_regular" }, { ramGb: 16, storageGb: 256, familyShouldRemainAmbiguous: true, sustainedPerformance: false }),
  scenario("S09", "Video sustained/daily", "Sustained video should prefer Pro.", ["video"], { uses: ["video"], videoWorkload: "sustained_daily" }, { ramGb: 16, storageGb: 256, familyPreferred: "pro", sustainedPerformance: true }),
  scenario("S10", "Development basic", "Basic development remains light baseline.", ["development"], { uses: ["development"], developmentWorkload: "development_basic" }, { ramGb: 8, storageGb: 256, familyShouldRemainAmbiguous: true }),
  scenario("S11", "Docker/VM rarely", "Occasional virtualization must not force Pro.", ["development"], { uses: ["development"], developmentWorkload: "docker_rare" }, { ramGb: 8, storageGb: 256, familyShouldRemainAmbiguous: true }),
  scenario("S12", "Development heavy weekly", "Weekly services raise RAM without false SSD upgrade.", ["development"], { uses: ["development"], developmentWorkload: "docker_regular" }, { ramGb: 16, storageGb: 256, familyShouldRemainAmbiguous: true, sustainedPerformance: false }),
  scenario("S13", "Development sustained/daily", "Sustained development should prefer Pro.", ["development"], { uses: ["development"], developmentWorkload: "development_sustained" }, { ramGb: 16, storageGb: 256, familyPreferred: "pro", sustainedPerformance: true }),
  scenario("S14", "Specialized heavy + named software", "Preserve Revit for verification without compatibility invention.", ["specialized"], { uses: ["specialized"], specializedWorkload: "specialized_heavy", specializedSoftware: "Revit" }, { ramGb: 16, storageGb: 256, familyShouldRemainAmbiguous: true, notes: ["verification required; software name preserved"] }),
  scenario("S15", "16GB technical requirement + low budget", "Budget cannot weaken technical truth.", ["financial"], { budget: "under-12", uses: ["design"], designWorkload: "professional" }, { ramGb: 16, storageGb: 256, financialExpectation: "eligible machines may be conflict" }),
  scenario("E01", "256 profile vs 512/1TB inventory", "Larger SSD remains eligible without rewriting truth.", ["edge"], {}, { ramGb: 8, storageGb: 256 }, [
    auditInventoryFixtures.air13M2_8_512,
    machine({ code: "AUD-1TB", slug: "audit-air-1tb", ssdGb: 1024, price: { amount: 20_000_000, currency: "VND" } }),
  ]),
  scenario("E02", "Machine below comfort-band minimum", "Comfort lower bound is not minimum spend.", ["financial", "edge"], { budget: "16-22" }, { financialExpectation: "fit below comfort minimum" }, [machine({ code: "AUD-CHEAP", slug: "audit-cheap", price: { amount: 10_000_000, currency: "VND" } })]),
  scenario("E03", "Only above-budget technical matches", "Keep technical validity and expose financial conflict.", ["financial", "edge"], { budget: "under-12" }, { financialExpectation: "all conflict" }, [auditInventoryFixtures.aboveBudget]),
  scenario("E04", "Zero eligible inventory", "No fallback to reserved, Intel, under-RAM or 128GB.", ["edge"], { uses: ["design"], designWorkload: "professional" }, { ramGb: 16, storageGb: 256, eligibleCount: 0 }, [auditInventoryFixtures.reserved, auditInventoryFixtures.intel, auditInventoryFixtures.storage128, auditInventoryFixtures.air13M1_8_256]),
  scenario("E05", "Equal matcher scores", "Expose deterministic code/slug tie-break.", ["edge"], {}, { notes: ["tie-break should decide top result"] }, [auditInventoryFixtures.equalB, auditInventoryFixtures.equalA]),
];

function exclusionSummary(result: InventoryMatchResult): Partial<Record<string, number>> {
  return result.excluded.reduce<Partial<Record<string, number>>>((summary, item) => {
    summary[item.reason] = (summary[item.reason] ?? 0) + 1;
    return summary;
  }, {});
}

export function runRecommendationAuditScenario(scenarioValue: RecommendationAuditScenario) {
  const signals = normalizeRecommendationSignals(scenarioValue.answers);
  const profile = resolveRecommendationProfile(scenarioValue.answers, signals);
  const presentation = presentRecommendation(profile);
  const inventory = scenarioValue.inventory ?? deterministicAuditInventory;
  const matcher = matchPublicInventory(profile, inventory);
  const inventoryPresentation = presentInventoryMatches(profile, matcher);
  const effectiveStorageFloor = profile.technical.minimumStorageGb ?? profile.technical.defaultStorageGb;
  const ranked = matcher.eligible.map((match, index) => ({
    rank: index + 1,
    code: match.machine.code,
    productClass: match.productClass,
    ramGb: match.ramGb,
    ssdGb: match.ssdGb,
    priceVnd: match.priceVnd,
    financialStatus: match.financialStatus,
    familyPreferenceScore: match.scoreBreakdown.familyPreference,
    sizePreferenceScore: match.scoreBreakdown.sizePreference,
    totalPreferenceScore: match.preferenceScore,
    tieBreakValues: { priceVnd: match.priceVnd, code: match.machine.code, slug: match.machine.slug },
  }));
  const flags: string[] = [];
  if (effectiveStorageFloor < 512 && /(?:cần|tối thiểu)[^\n.]*512/i.test(`${presentation.explanation}\n${presentation.reasons.join("\n")}`)) flags.push("storage-512-presented-as-required");
  if (!profile.family.preferred && !/Air.*Pro|Pro.*Air/i.test(`${presentation.title} ${presentation.explanation}`)) flags.push("family-ambiguity-not-visible");
  if (matcher.eligible.length > 0 && !matcher.eligible.some((match) => profile.size.preferredClasses.includes(match.sizeClass))) flags.push("no-preferred-size-match");
  if (ranked.some((item, index) => item.financialStatus === "fit" && ranked.slice(0, index).some((earlier) => earlier.financialStatus === "conflict"))) flags.push("conflict-ranked-before-fit");
  if (scenarioValue.expectedAudit?.eligibleCount !== 0 && matcher.eligible.length === 0) flags.push("unexpected-zero-matches");
  if (ranked.length > 1
    && ranked[0].financialStatus === ranked[1].financialStatus
    && ranked[0].totalPreferenceScore === ranked[1].totalPreferenceScore
    && ranked[0].priceVnd === ranked[1].priceVnd) flags.push("code-slug-tie-break-decides-top-result");

  return {
    scenario: { id: scenarioValue.id, title: scenarioValue.title, intent: scenarioValue.intent, categories: scenarioValue.categories, expectedAudit: scenarioValue.expectedAudit },
    input: scenarioValue.answers,
    normalizedSignals: signals,
    resolvedTruth: {
      minimumRamGb: profile.technical.minimumRamGb,
      effectiveStorageFloor,
      sustainedPerformance: profile.technical.sustainedPerformance,
      allowedFamilies: profile.family.allowed,
      preferredFamily: profile.family.preferred ?? null,
      preferredSizeClasses: profile.size.preferredClasses,
      sizeTradeoff: profile.size.hasTradeoff,
      verification: profile.verification,
      confidence: profile.confidence,
      financial: profile.financial,
    },
    customerPresentation: {
      title: presentation.title,
      summary: presentation.explanation,
      reasoning: presentation.reasons,
      options: [presentation.bestFit, presentation.alternative, presentation.upgrade].filter(Boolean),
    },
    inventoryAudit: { fixtureCount: inventory.length, ranked, exclusions: exclusionSummary(matcher), presentation: inventoryPresentation },
    flags,
  };
}

export function runRecommendationAuditHarness() {
  return recommendationAuditScenarios.map(runRecommendationAuditScenario);
}
