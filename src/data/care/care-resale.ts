export const CARE_RESALE_REASONS = [
  ["low_usage", "Ít dùng"],
  ["needs_mismatch", "Không còn phù hợp nhu cầu"],
  ["switch_machine", "Muốn lên đời / đổi máy"],
] as const;

export type CareResaleReason = (typeof CARE_RESALE_REASONS)[number][0];

export function isCareResaleReason(value: unknown): value is CareResaleReason {
  return CARE_RESALE_REASONS.some(([reason]) => reason === value);
}
