import type {
  PublicMachineExplanationAudienceV0,
  PublicMachineExplanationV0,
} from "@/models";

const AUDIENCE_LABELS: Record<PublicMachineExplanationAudienceV0, string> = {
  general: "Phổ thông",
  developer: "Lập trình",
  creative: "Sáng tạo",
  heavy: "Tác vụ nặng",
  storage_heavy: "Lưu trữ nhiều",
};

const DOMAIN_LABELS: Record<
  PublicMachineExplanationV0["blocks"][number]["domain"],
  string
> = {
  memory: "RAM",
  storage: "Lưu trữ",
  battery: "Pin",
  cosmetic: "Ngoại hình",
};

export type MachineExplanationPresentation = {
  audienceLabel: string;
  blocks: Array<{ domainLabel: string; text: string }>;
  notes: string[];
};

export function presentMachineExplanation(
  explanation: PublicMachineExplanationV0 | undefined,
): MachineExplanationPresentation | null {
  if (!explanation) return null;
  return {
    audienceLabel: AUDIENCE_LABELS[explanation.audience],
    blocks: explanation.blocks.map((block) => ({
      domainLabel: DOMAIN_LABELS[block.domain],
      text: block.text,
    })),
    notes:
      explanation.status === "ready_with_note" ? [...explanation.notes] : [],
  };
}
