export type MachinePolicyAnalyticsEvent =
  | "machine_policy_summary_viewed"
  | "machine_warranty_policy_clicked"
  | "machine_care_policy_clicked";

export type MachinePolicyAnalyticsPayload = Readonly<{
  publicMachineId: string;
  machineSlug: string;
  policyVersion?: string;
  hasCareWording: boolean;
}>;

export function machinePolicyAnalyticsPayload(input: {
  publicMachineId: string;
  machineSlug: string;
  policyVersion?: string;
  hasCareWording: boolean;
}): MachinePolicyAnalyticsPayload {
  return {
    publicMachineId: input.publicMachineId,
    machineSlug: input.machineSlug,
    ...(input.policyVersion ? { policyVersion: input.policyVersion } : {}),
    hasCareWording: input.hasCareWording,
  };
}

// Provider-neutral seam. The current site has no analytics provider.
export function trackMachinePolicyEvent(
  event: MachinePolicyAnalyticsEvent,
  payload: MachinePolicyAnalyticsPayload,
) {
  void event;
  void payload;
}
