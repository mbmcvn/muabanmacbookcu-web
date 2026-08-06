export type FitStatementSource =
  | "model"
  | "configuration"
  | "condition"
  | "manual";

export type FitStatement = {
  id: string;
  text: string;
  source: FitStatementSource;
};

export type MachineFitRecommendation = {
  suitable: FitStatement[];
  caution: FitStatement[];
};

export type MachineFitRecommendationInput = {
  ramGb: number | null;
  ssdGb: number | null;
  manualSuitable?: readonly string[];
  manualCaution?: readonly string[];
};

const MAX_STATEMENTS_PER_GROUP = 4;

function normalizedText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function deduplicate(statements: FitStatement[]): FitStatement[] {
  const seen = new Set<string>();
  return statements.filter((statement) => {
    const key = normalizedText(statement.text)
      .toLocaleLowerCase("vi")
      .replace(/[.!?]+$/u, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function manualStatements(
  values: readonly string[] | undefined,
  group: "suitable" | "caution",
): FitStatement[] {
  return (values ?? []).flatMap((value, index) => {
    const text = normalizedText(value);
    return text
      ? [{ id: `manual-${group}-${index + 1}`, text, source: "manual" as const }]
      : [];
  });
}

export function buildMachineFitRecommendation(
  input: MachineFitRecommendationInput,
): MachineFitRecommendation {
  const configurationCautions: FitStatement[] = [];

  if (input.ramGb === 8) {
    configurationCautions.push({
      id: "configuration-ram-8gb",
      text: "Thường xuyên chạy nhiều tác vụ cần RAM lớn, dự án chuyên nghiệp dung lượng lớn hoặc máy ảo cục bộ.",
      source: "configuration",
    });
  }

  if (input.ssdGb === 256) {
    configurationCautions.push({
      id: "configuration-ssd-256gb",
      text: "Cần dung lượng lưu trữ nội bộ cao hơn 256GB.",
      source: "configuration",
    });
  }

  return {
    suitable: deduplicate(
      manualStatements(input.manualSuitable, "suitable"),
    ).slice(0, MAX_STATEMENTS_PER_GROUP),
    caution: deduplicate([
      ...configurationCautions,
      ...manualStatements(input.manualCaution, "caution"),
    ]).slice(0, MAX_STATEMENTS_PER_GROUP),
  };
}

export function hasMachineFitRecommendation(
  recommendation: MachineFitRecommendation,
): boolean {
  return recommendation.suitable.length > 0 || recommendation.caution.length > 0;
}
