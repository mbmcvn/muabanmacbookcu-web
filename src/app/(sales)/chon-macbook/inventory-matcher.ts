import type { PublicMachineSummaryV1 } from "../../../lib/public-projection/contracts";
import type { ProductFamily, RecommendationProfile } from "./quiz-types";

export const matcherProductClasses = [
  "air-13",
  "air-15",
  "pro-13",
  "pro-14",
  "pro-16",
] as const;

export type MatcherProductClass = (typeof matcherProductClasses)[number];
export type MatcherSizeClass = "13" | "14" | "15" | "16";
export type FinancialMatchStatus = "fit" | "stretch" | "conflict" | "unknown";

export interface MatcherCandidate {
  machine: PublicMachineSummaryV1;
  productClass: MatcherProductClass;
  family: ProductFamily;
  sizeClass: MatcherSizeClass;
  chipClass: {
    architecture: "apple-silicon";
    generation: string;
  };
  ramGb: number;
  ssdGb: number;
  priceVnd: number;
}

export interface MatchScoreBreakdown {
  familyPreference: number;
  sizePreference: number;
  total: number;
}

export type MatchReason = "preferred-family" | "preferred-size";

export interface RankedMachineMatch extends MatcherCandidate {
  financialStatus: FinancialMatchStatus;
  preferenceScore: number;
  scoreBreakdown: MatchScoreBreakdown;
  reasons: MatchReason[];
}

export type MatchExclusionReason =
  | "reserved"
  | "unavailable"
  | "unsupported-product-class"
  | "disallowed-family"
  | "intel"
  | "unknown-chip"
  | "insufficient-ram"
  | "insufficient-storage"
  | "invalid-price"
  | "invalid-machine-data";

export interface MatchExclusionDiagnostic {
  machine: PublicMachineSummaryV1;
  reason: MatchExclusionReason;
}

export interface InventoryMatchResult {
  eligible: RankedMachineMatch[];
  excluded: MatchExclusionDiagnostic[];
}

type CandidateNormalizationResult =
  | { ok: true; candidate: MatcherCandidate }
  | { ok: false; reason: MatchExclusionReason };

const SIZE_PATTERN = /\b(13|14|15|16)(?:[\s-]*(?:inch|in|"))\b/gi;
const APPLE_SILICON_PATTERN = /^(?:Apple\s+)?M([1-9]\d*)(?:\s+(Pro|Max|Ultra))?$/i;

function positiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function normalizeProductClass(machine: PublicMachineSummaryV1): {
  productClass: MatcherProductClass;
  family: ProductFamily;
  sizeClass: MatcherSizeClass;
} | null {
  const family = machine.family === "Air" ? "air" : machine.family === "Pro" ? "pro" : null;
  if (!family) return null;
  const sizes = [...machine.displayName.matchAll(SIZE_PATTERN)].map((match) => match[1] as MatcherSizeClass);
  if (sizes.length !== 1) return null;
  const sizeClass = sizes[0];
  const productClass = `${family}-${sizeClass}`;
  if (!matcherProductClasses.includes(productClass as MatcherProductClass)) return null;
  return { productClass: productClass as MatcherProductClass, family, sizeClass };
}

function normalizeAppleSilicon(chip: string | null): { generation: string } | "intel" | null {
  const value = chip?.trim() ?? "";
  if (/\bIntel\b/i.test(value)) return "intel";
  const match = value.match(APPLE_SILICON_PATTERN);
  if (!match) return null;
  const variant = match[2] ? ` ${match[2][0].toUpperCase()}${match[2].slice(1).toLowerCase()}` : "";
  return { generation: `M${match[1]}${variant}` };
}

export function normalizeMatcherCandidate(machine: PublicMachineSummaryV1): CandidateNormalizationResult {
  const product = normalizeProductClass(machine);
  if (!product) return { ok: false, reason: "unsupported-product-class" };
  const chip = normalizeAppleSilicon(machine.chip);
  if (chip === "intel") return { ok: false, reason: "intel" };
  if (!chip) return { ok: false, reason: "unknown-chip" };
  if (!positiveSafeInteger(machine.ramGb) || !positiveSafeInteger(machine.ssdGb)) {
    return { ok: false, reason: "invalid-machine-data" };
  }
  if (!positiveSafeInteger(machine.price.amount)) return { ok: false, reason: "invalid-price" };
  return {
    ok: true,
    candidate: {
      machine,
      ...product,
      chipClass: { architecture: "apple-silicon", generation: chip.generation },
      ramGb: machine.ramGb,
      ssdGb: machine.ssdGb,
      priceVnd: machine.price.amount,
    },
  };
}

function scoreCandidate(profile: RecommendationProfile, candidate: MatcherCandidate): MatchScoreBreakdown {
  const familyPreference = profile.family.preferred === candidate.family ? 2 : 0;
  const sizePreference = profile.size.preferredClasses.includes(candidate.sizeClass) ? 1 : 0;
  return { familyPreference, sizePreference, total: familyPreference + sizePreference };
}

export function classifyCandidatePrice(profile: RecommendationProfile, priceVnd: number): FinancialMatchStatus {
  if (profile.financial.paymentMode === "installment") return "unknown";
  if (profile.financial.paymentMode !== "full" && profile.financial.paymentMode !== "both") return "unknown";
  const comfort = profile.financial.comfortRange;
  if (!comfort) return "unknown";
  if (comfort.max === undefined) return "fit";
  const comfortMaxVnd = comfort.max * 1_000_000;
  if (priceVnd <= comfortMaxVnd) return "fit";
  if (profile.financial.stretchMax === undefined) return "conflict";
  return priceVnd <= profile.financial.stretchMax * 1_000_000 ? "stretch" : "conflict";
}

const FINANCIAL_ORDER: Record<FinancialMatchStatus, number> = {
  fit: 0,
  stretch: 1,
  conflict: 2,
  unknown: 3,
};

function compareMatches(left: RankedMachineMatch, right: RankedMachineMatch): number {
  return FINANCIAL_ORDER[left.financialStatus] - FINANCIAL_ORDER[right.financialStatus]
    || right.preferenceScore - left.preferenceScore
    || left.priceVnd - right.priceVnd
    || left.machine.code.localeCompare(right.machine.code)
    || left.machine.slug.localeCompare(right.machine.slug);
}

export function matchPublicInventory(
  profile: RecommendationProfile,
  machines: readonly PublicMachineSummaryV1[],
): InventoryMatchResult {
  const eligible: RankedMachineMatch[] = [];
  const excluded: MatchExclusionDiagnostic[] = [];
  const effectiveStorageFloor = profile.technical.minimumStorageGb ?? profile.technical.defaultStorageGb;
  for (const machine of machines) {
    const normalized = normalizeMatcherCandidate(machine);
    if (!normalized.ok) {
      excluded.push({ machine, reason: normalized.reason });
      continue;
    }
    const candidate = normalized.candidate;
    if (machine.availability === "reserved") {
      excluded.push({ machine, reason: "reserved" });
      continue;
    }
    if (machine.availability !== "available") {
      excluded.push({ machine, reason: "unavailable" });
      continue;
    }
    if (!profile.family.allowed.includes(candidate.family)) {
      excluded.push({ machine, reason: "disallowed-family" });
      continue;
    }
    if (candidate.ramGb < profile.technical.minimumRamGb) {
      excluded.push({ machine, reason: "insufficient-ram" });
      continue;
    }
    if (candidate.ssdGb < effectiveStorageFloor) {
      excluded.push({ machine, reason: "insufficient-storage" });
      continue;
    }
    const scoreBreakdown = scoreCandidate(profile, candidate);
    const reasons: MatchReason[] = [];
    if (scoreBreakdown.familyPreference) reasons.push("preferred-family");
    if (scoreBreakdown.sizePreference) reasons.push("preferred-size");
    eligible.push({
      ...candidate,
      financialStatus: classifyCandidatePrice(profile, candidate.priceVnd),
      preferenceScore: scoreBreakdown.total,
      scoreBreakdown,
      reasons,
    });
  }
  return { eligible: eligible.toSorted(compareMatches), excluded };
}
