import type { Recommendation } from "./quiz-types";

export interface ResultCtaCopy {
  primary: string;
  secondary?: string;
  primaryDestination: "inventory" | "zalo";
}

export function getResultCtaCopy(result: Recommendation): ResultCtaCopy {
  if (result.profile.verification.required) {
    return { primary: "Nhờ MBMC kiểm tra trước", primaryDestination: "zalo" };
  }
  return {
    primary: "Xem máy phù hợp đang có",
    secondary: "Nhờ MBMC xác nhận lựa chọn",
    primaryDestination: "inventory",
  };
}

export function getRecommendationTitle(result: Recommendation): string {
  return result.presentation.title;
}

export function getRecommendationOptionTitles(result: Recommendation) {
  const upgradeModel = result.presentation.upgrade?.model;
  return {
    bestFit: "GỢI Ý ĐỂ BẮT ĐẦU",
    alternative: "PHƯƠNG ÁN CŨNG PHÙ HỢP",
    upgrade: result.profile.size.hasTradeoff
      ? "MỘT CÁCH CÂN BẰNG KHÁC"
      : upgradeModel === "air-15" || upgradeModel === "pro-16"
        ? "NẾU BẠN MUỐN MÀN HÌNH RỘNG HƠN"
        : "NẾU BẠN MUỐN MÁY GỌN HƠN",
  };
}
