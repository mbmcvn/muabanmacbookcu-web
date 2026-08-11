import type { Budget, MainUse, QuizAnswers } from "./quiz-types";

const MAIN_USES = ["office", "design", "video", "development", "specialized", "personal", "unclear"] as const;
const VIDEO_WORKLOADS = ["short_social", "long_rare", "long_regular", "sustained_daily"] as const;
const DESIGN_WORKLOADS = ["light", "photoshop_standard", "professional", "professional_sustained"] as const;
const DEVELOPMENT_WORKLOADS = ["development_basic", "docker_rare", "docker_regular", "development_sustained"] as const;
const SPECIALIZED_WORKLOADS = ["specialized_basic", "specialized_heavy", "specialized_sustained"] as const;

function oneOf<T extends string>(value: unknown, values: readonly T[]): T | undefined {
  return typeof value === "string" && values.includes(value as T) ? value as T : undefined;
}

export function normalizeStoredAnswers(value: QuizAnswers): QuizAnswers {
  const uses = Array.isArray(value.uses)
    ? value.uses.filter((use): use is MainUse => MAIN_USES.includes(use as MainUse)).slice(0, 2)
    : [];
  const normalizedUses: MainUse[] = uses.includes("unclear") ? ["unclear"] : uses;
  const payment = oneOf(value.payment, ["full", "installment", "both"]);
  const budget = payment === "installment" ? undefined : oneOf(value.budget, ["under-12", "12-16", "16-22", "22-30", "over-30", "unknown"]);
  const stretchBudget = payment !== "installment" && budget && budget !== "unknown"
    ? oneOf(value.stretchBudget, ["none", "plus-3", "plus-5"])
    : undefined;
  const installmentAllowed = payment === "installment" || payment === "both";
  return {
    uses: normalizedUses,
    payment,
    budget,
    stretchBudget,
    deposit: installmentAllowed ? oneOf(value.deposit, ["low", "medium", "high", "unknown"]) : undefined,
    monthlyPayment: installmentAllowed ? oneOf(value.monthlyPayment, ["low", "medium", "high", "unknown"]) : undefined,
    videoWorkload: normalizedUses.includes("video") ? oneOf(value.videoWorkload, VIDEO_WORKLOADS) : undefined,
    designWorkload: normalizedUses.includes("design") ? oneOf(value.designWorkload, DESIGN_WORKLOADS) : undefined,
    developmentWorkload: normalizedUses.includes("development") ? oneOf(value.developmentWorkload, DEVELOPMENT_WORKLOADS) : undefined,
    specializedWorkload: normalizedUses.includes("specialized") ? oneOf(value.specializedWorkload, SPECIALIZED_WORKLOADS) : undefined,
    specializedSoftware: normalizedUses.includes("specialized") && typeof value.specializedSoftware === "string" ? value.specializedSoftware : undefined,
    portability: oneOf(value.portability, ["frequent", "stationary"]),
    screen: oneOf(value.screen, ["compact", "large"]),
    fulfilment: oneOf(value.fulfilment, ["showroom", "hanoi-delivery", "province", "unknown"]),
    province: value.fulfilment === "province" && typeof value.province === "string" ? value.province : undefined,
  };
}

export function toggleUsageAnswer(answers: QuizAnswers, selected: MainUse): QuizAnswers {
  if (selected === "unclear") {
    return normalizeStoredAnswers({ ...answers, uses: answers.uses.includes("unclear") ? [] : ["unclear"] });
  }
  const withoutUnclear = answers.uses.filter((use) => use !== "unclear");
  if (withoutUnclear.includes(selected)) {
    return normalizeStoredAnswers({ ...answers, uses: withoutUnclear.filter((use) => use !== selected) });
  }
  if (withoutUnclear.length >= 2) return { ...answers, uses: withoutUnclear };
  return normalizeStoredAnswers({ ...answers, uses: [...withoutUnclear, selected] });
}

export function setComfortBudget(answers: QuizAnswers, budget: Budget): QuizAnswers {
  return { ...answers, budget, stretchBudget: undefined };
}

export function shouldShowSpecializedSoftwareField(answers: QuizAnswers): boolean {
  return answers.uses.includes("specialized");
}

export function isUsageAnswerComplete(answers: QuizAnswers): boolean {
  if (answers.uses.length < 1 || answers.uses.length > 2) return false;
  if (answers.uses.includes("video") && !oneOf(answers.videoWorkload, VIDEO_WORKLOADS)) return false;
  if (answers.uses.includes("design") && !oneOf(answers.designWorkload, DESIGN_WORKLOADS)) return false;
  if (answers.uses.includes("development") && !oneOf(answers.developmentWorkload, DEVELOPMENT_WORKLOADS)) return false;
  if (answers.uses.includes("specialized") && !oneOf(answers.specializedWorkload, SPECIALIZED_WORKLOADS)) return false;
  return true;
}
