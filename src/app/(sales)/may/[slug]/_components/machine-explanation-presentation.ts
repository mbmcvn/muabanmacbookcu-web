import type { PublicMachineExplanationV0 } from "@/models";
import { MACHINE_EXPLANATION_AUDIENCES } from "../../../../../lib/machine-explanation-audiences.ts";

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
  audienceDescription: string;
  blocks: Array<{ domainLabel: string; text: string }>;
  notes: string[];
};

export function presentMachineExplanation(
  explanation: PublicMachineExplanationV0 | undefined,
): MachineExplanationPresentation | null {
  if (!explanation) return null;
  const audience = MACHINE_EXPLANATION_AUDIENCES[explanation.audience];
  return {
    audienceLabel: audience.label,
    audienceDescription: audience.description,
    blocks: explanation.blocks.map((block) => ({
      domainLabel: DOMAIN_LABELS[block.domain],
      text: block.text,
    })),
    notes:
      explanation.status === "ready_with_note" ? [...explanation.notes] : [],
  };
}
