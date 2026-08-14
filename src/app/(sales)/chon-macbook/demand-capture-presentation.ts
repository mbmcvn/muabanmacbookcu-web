import {
  REQUIREMENT_SNAPSHOT_SCHEMA,
  type RequirementSnapshotV1,
} from "../../../lib/demand-contract.ts";
import type { InventoryMatchViewState } from "./inventory-match-presentation";
import type { QuizAnswers, RecommendationProfile } from "./quiz-types";

export type QuizDemandPresentation = Readonly<{
  hierarchy: "prominent" | "alternative";
  title: string;
  description: string;
  action: string;
  matcherState?: "empty" | "above-budget";
}>;

export function getQuizDemandPresentation(
  state: InventoryMatchViewState | null,
): QuizDemandPresentation | null {
  if (!state || state.status === "failed") return null;
  if (state.status === "empty")
    return {
      hierarchy: "prominent",
      title: "Chưa có máy phù hợp đang sẵn tại MBMC.",
      description:
        "MBMC có thể ghi nhận nhu cầu này và liên hệ khi tìm được máy phù hợp.",
      action: "Báo mình khi có máy phù hợp",
      matcherState: "empty",
    };
  if (state.mode === "above-budget")
    return {
      hierarchy: "alternative",
      title: "Muốn chờ một máy vừa ngân sách hơn?",
      description:
        "Gửi nhu cầu để MBMC liên hệ khi có máy phù hợp với mức bạn muốn dành.",
      action: "Tìm máy đúng ngân sách hơn",
      matcherState: "above-budget",
    };
  return {
    hierarchy: "alternative",
    title: "Chưa thấy đúng chiếc bạn muốn?",
    description: "MBMC có thể tìm thêm theo nhu cầu vừa chọn.",
    action: "Gửi yêu cầu tìm máy",
  };
}

export function buildQuizRequirementSnapshot(
  answers: QuizAnswers,
  profile: RecommendationProfile,
): RequirementSnapshotV1 {
  return {
    schemaVersion: REQUIREMENT_SNAPSHOT_SCHEMA,
    recommendationContractVersion: "chon-macbook.v1",
    normalizedQuizAnswers: answers,
    recommendationProfile: profile,
  };
}
