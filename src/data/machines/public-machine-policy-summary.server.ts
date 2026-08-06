import type { PublicPolicySummary } from "@/models";

type UnknownRow = Record<string, unknown>;
type PolicyRpcClient = {
  rpc(
    name: "get_public_machine_policy_summary",
    args: { p_machine_id: string },
  ): PromiseLike<{ data: unknown; error: { code?: string } | null }>;
};

function nonBlank(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safePolicyUrl(value: unknown): string | null {
  const candidate = nonBlank(value);
  if (!candidate) return null;
  if (candidate.startsWith("/") && !candidate.startsWith("//"))
    return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function mapPublicMachinePolicySummary(
  value: unknown,
): PublicPolicySummary | null {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const row = value as UnknownRow;
  const publicIdentifier = nonBlank(row.machine_public_identifier);
  const policyVersion = nonBlank(row.policy_version);
  const title = nonBlank(row.summary_title);
  const careWording = nonBlank(row.care_availability_wording);
  const warrantyPolicyUrl = safePolicyUrl(row.warranty_policy_url);
  const carePolicyUrl = safePolicyUrl(row.mbmc_care_policy_url);
  const machineIdWording = nonBlank(row.machine_id_persistence_wording);
  const warrantyItems = Array.isArray(row.warranty_summary_items)
    ? row.warranty_summary_items.map(nonBlank)
    : [];

  if (
    !publicIdentifier ||
    !policyVersion ||
    !title ||
    !careWording ||
    !warrantyPolicyUrl ||
    !carePolicyUrl ||
    !machineIdWording ||
    !warrantyItems.length ||
    warrantyItems.some((item) => item === null)
  )
    return null;

  return {
    policyVersion,
    title,
    warrantyItems: warrantyItems as string[],
    careWording,
    warrantyPolicyUrl,
    carePolicyUrl,
    machineIdWording,
  };
}

export async function loadPublicMachinePolicySummary(
  client: PolicyRpcClient,
  machineId: string,
): Promise<PublicPolicySummary | null> {
  try {
    const { data, error } = await client.rpc(
      "get_public_machine_policy_summary",
      {
        p_machine_id: machineId,
      },
    );
    if (error) {
      console.error(
        "[public-machine-policy]",
        JSON.stringify({
          stage: "POLICY_SUMMARY_RPC_FAILED",
          code: error.code ?? "unknown",
        }),
      );
      return null;
    }
    if (!Array.isArray(data) || data.length !== 1) return null;
    return mapPublicMachinePolicySummary(data[0]);
  } catch {
    console.error(
      "[public-machine-policy]",
      JSON.stringify({
        stage: "POLICY_SUMMARY_RPC_FAILED",
        code: "unexpected",
      }),
    );
    return null;
  }
}
