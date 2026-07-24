import type { Recommendation } from "./quiz-types";

export interface ResultCtaCopy {
  primary: string;
  secondary?: string;
  primaryDestination: "inventory" | "zalo";
}

export function getResultCtaCopy(result: Recommendation): ResultCtaCopy {
  if (result.needsVerification) {
    return { primary: "Nhờ MBMC kiểm tra trước", primaryDestination: "zalo" };
  }
  if (result.budgetConflict) {
    return {
      primary: "Xem máy gần nhu cầu nhất",
      secondary: "Nhờ MBMC cân lại cấu hình",
      primaryDestination: "inventory",
    };
  }
  return {
    primary: "Xem máy phù hợp đang có",
    secondary: "Nhờ MBMC xác nhận lựa chọn",
    primaryDestination: "inventory",
  };
}

export function getUpgradeOptionTitle(result: Recommendation): string {
  if (result.upgrade.label.includes("MacBook Air 15 inch")) return "NẾU MUỐN MÀN HÌNH RỘNG";
  if (result.upgrade.label.includes("MacBook Pro")) return "NÂNG CẤP HIỆU NĂNG";
  if (result.storageGuidance !== "256GB là đủ" && result.upgrade.configuration !== result.bestFit.configuration) {
    return "THÊM DUNG LƯỢNG";
  }
  return "PHƯƠNG ÁN KHÁC";
}

export function getRecommendationTitle(result: Recommendation): string {
  return result.productFamilyFit === "air_or_pro"
    ? "MacBook 13 inch"
    : `${result.family} ${result.size}`;
}

export function getRecommendationOptionTitles(result: Recommendation) {
  if (result.productFamilyFit === "air_or_pro") {
    return {
      bestFit: "PHƯƠNG ÁN MỎNG, TỐI GIẢN",
      cheaper: "PHƯƠNG ÁN CÓ QUẠT / TOUCH BAR",
      upgrade: "PHƯƠNG ÁN KHÁC",
    };
  }
  return {
    bestFit: "PHÙ HỢP NHẤT",
    cheaper: "TIẾT KIỆM HƠN",
    upgrade: getUpgradeOptionTitle(result),
  };
}
