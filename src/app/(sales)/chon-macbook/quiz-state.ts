import type { MainUse, QuizAnswers } from "./quiz-types";

export function normalizeStoredAnswers(value: QuizAnswers): QuizAnswers {
  const current = { ...value } as QuizAnswers & {
    workload?: unknown;
    workloadClarification?: unknown;
    windows?: unknown;
    windowsSoftware?: unknown;
  };
  delete current.workload;
  delete current.workloadClarification;
  delete current.windows;
  delete current.windowsSoftware;
  return {
    ...current,
    videoWorkload: value.videoWorkload === "short_social" || value.videoWorkload === "long_high_quality"
      ? value.videoWorkload
      : undefined,
    designWorkload: value.designWorkload === "light" || value.designWorkload === "professional"
      ? value.designWorkload
      : undefined,
    developmentWorkload: value.developmentWorkload === "development_basic" || value.developmentWorkload === "development_heavy"
      ? value.developmentWorkload
      : undefined,
    specializedWorkload: value.specializedWorkload === "specialized_basic" || value.specializedWorkload === "specialized_heavy"
      ? value.specializedWorkload
      : undefined,
  };
}

export function toggleUsageAnswer(answers: QuizAnswers, selected: MainUse): QuizAnswers {
  if (selected === "unclear") {
    return {
      ...answers,
      uses: answers.uses.includes("unclear") ? [] : ["unclear"],
      videoWorkload: undefined,
      designWorkload: undefined,
      developmentWorkload: undefined,
      specializedWorkload: undefined,
      specializedSoftware: undefined,
    };
  }

  const withoutUnclear = answers.uses.filter((use) => use !== "unclear");
  if (withoutUnclear.includes(selected)) {
    return {
      ...answers,
      uses: withoutUnclear.filter((use) => use !== selected),
      videoWorkload: selected === "video" ? undefined : answers.videoWorkload,
      designWorkload: selected === "design" ? undefined : answers.designWorkload,
      developmentWorkload: selected === "development" ? undefined : answers.developmentWorkload,
      specializedWorkload: selected === "specialized" ? undefined : answers.specializedWorkload,
      specializedSoftware: selected === "specialized" ? undefined : answers.specializedSoftware,
    };
  }
  if (withoutUnclear.length >= 2) return { ...answers, uses: withoutUnclear };
  return { ...answers, uses: [...withoutUnclear, selected] };
}

export function shouldShowSpecializedSoftwareField(answers: QuizAnswers): boolean {
  return answers.uses.includes("specialized");
}

export function isUsageAnswerComplete(answers: QuizAnswers): boolean {
  if (answers.uses.length < 1 || answers.uses.length > 2) return false;
  if (answers.uses.includes("video") && answers.videoWorkload !== "short_social" && answers.videoWorkload !== "long_high_quality") return false;
  if (answers.uses.includes("design") && answers.designWorkload !== "light" && answers.designWorkload !== "professional") return false;
  if (answers.uses.includes("development") && answers.developmentWorkload !== "development_basic" && answers.developmentWorkload !== "development_heavy") return false;
  if (answers.uses.includes("specialized") && answers.specializedWorkload !== "specialized_basic" && answers.specializedWorkload !== "specialized_heavy") return false;
  return true;
}
