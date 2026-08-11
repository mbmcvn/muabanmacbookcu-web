import { formatCurrencyVnd, formatPublicMachineDisplayName, formatPublicMachineSpecs } from "../../../lib/presentation/machine.ts";
import type { PublicImage } from "../../../lib/public-projection/contracts";
import { formatMachineCardCondition } from "../may-dang-co/_components/machine-card-presentation.ts";
import type { InventoryMatchResult, RankedMachineMatch } from "./inventory-matcher";
import type { RecommendationProfile } from "./quiz-types";

export const INVENTORY_MATCH_LIMIT = 3;

function representativeGroupKey(match: RankedMachineMatch): string {
  const year = match.machine.year === null ? "unknown" : String(match.machine.year);
  return [match.productClass, match.chipClass.generation, match.ramGb, match.ssdGb, year].join("|");
}

export function selectRepresentativeInventoryMatches(
  rankedMatches: readonly RankedMachineMatch[],
  limit = INVENTORY_MATCH_LIMIT,
): RankedMachineMatch[] {
  if (limit <= 0) return [];
  const selected: RankedMachineMatch[] = [];
  const skipped: RankedMachineMatch[] = [];
  const seenGroups = new Set<string>();

  for (const match of rankedMatches) {
    const key = representativeGroupKey(match);
    if (seenGroups.has(key)) {
      skipped.push(match);
      continue;
    }
    seenGroups.add(key);
    selected.push(match);
    if (selected.length === limit) return selected;
  }

  for (const match of skipped) {
    selected.push(match);
    if (selected.length === limit) break;
  }
  return selected;
}

export type InventoryMatchViewState =
  | { status: "ready"; mode: "matches" | "above-budget"; matches: InventoryMatchCardView[]; hasSizeTradeoff: boolean }
  | { status: "empty" }
  | { status: "failed" };

export interface InventoryMatchCardView {
  code: string;
  slug: string;
  displayName: string;
  specs: string;
  price: string;
  image: PublicImage;
  condition: string | null;
  budgetLabel: "Vừa ngân sách" | "Có thể cân nhắc thêm" | "Cao hơn mức dự tính" | null;
  reason: string;
}

function matchReason(profile: RecommendationProfile, match: RankedMachineMatch): string {
  if (profile.family.preferred === "pro" && match.family === "air") {
    return "Vẫn đáp ứng nhu cầu; Pro sẽ hợp hơn nếu bạn thường xuyên chạy công việc nặng kéo dài.";
  }
  if (profile.family.preferred === "pro" && match.family === "pro") {
    return "Đủ RAM, lưu trữ và hợp hơn với công việc nặng kéo dài.";
  }
  if (profile.size.preferredClasses.includes(match.sizeClass)) {
    if (match.sizeClass === "15" || match.sizeClass === "16") {
      return "Đáp ứng cấu hình và đúng ưu tiên màn hình rộng.";
    }
    return "Đúng cấu hình bạn cần và gọn để mang theo thường xuyên.";
  }
  return "Đáp ứng mức RAM và lưu trữ trong gợi ý của bạn.";
}

function budgetLabel(match: RankedMachineMatch): InventoryMatchCardView["budgetLabel"] {
  if (match.financialStatus === "fit") return "Vừa ngân sách";
  if (match.financialStatus === "stretch") return "Có thể cân nhắc thêm";
  if (match.financialStatus === "conflict") return "Cao hơn mức dự tính";
  return null;
}

function toCard(profile: RecommendationProfile, match: RankedMachineMatch): InventoryMatchCardView {
  const machine = match.machine;
  return {
    code: machine.code,
    slug: machine.slug,
    displayName: formatPublicMachineDisplayName(machine.displayName),
    specs: formatPublicMachineSpecs({
      chip: machine.chip,
      ramGb: machine.ramGb,
      storageGb: machine.ssdGb,
      color: machine.color,
    }),
    price: formatCurrencyVnd(machine.price),
    image: machine.coverImage,
    condition: formatMachineCardCondition({
      batteryHealthPercent: machine.batteryHealthPercent,
      cycleCount: machine.cycleCount,
      cosmeticGrade: machine.cosmeticGrade,
    }) || null,
    budgetLabel: budgetLabel(match),
    reason: matchReason(profile, match),
  };
}

export function presentInventoryMatches(
  profile: RecommendationProfile,
  result: InventoryMatchResult,
): InventoryMatchViewState {
  const primary = result.eligible.filter((match) => match.financialStatus !== "conflict");
  if (primary.length > 0) {
    return {
      status: "ready",
      mode: "matches",
      matches: selectRepresentativeInventoryMatches(primary).map((match) => toCard(profile, match)),
      hasSizeTradeoff: profile.size.hasTradeoff,
    };
  }
  if (result.eligible.length > 0) {
    return {
      status: "ready",
      mode: "above-budget",
      matches: selectRepresentativeInventoryMatches(result.eligible, 2).map((match) => toCard(profile, match)),
      hasSizeTradeoff: profile.size.hasTradeoff,
    };
  }
  return { status: "empty" };
}

export function inventoryZaloLine(state: InventoryMatchViewState): string | null {
  if (state.status === "empty") return "Hiện chưa có máy đang có khớp đủ tiêu chí.";
  if (state.status !== "ready" || state.matches.length === 0) return null;
  const top = state.matches[0];
  return `Máy đang có khớp nhất: ${top.code} — ${top.displayName}, ${top.specs} — ${top.price}`;
}
