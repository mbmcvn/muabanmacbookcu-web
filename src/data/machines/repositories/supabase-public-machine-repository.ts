import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicMachineRepository } from "./public-machine-repository";
import { projectPublicCandidates } from "../project-public-candidates";
import { loadPublicMachinePolicySummary } from "../public-machine-policy-summary.server";

const PUBLIC_CANDIDATE_FIELDS = `
  id,
  machine_id,
  status,
  deleted_at,
  model_text,
  model_spec_key,
  chip,
  ram_gb,
  ssd_gb,
  color,
  retail_price_expected,
  battery_health,
  battery_cycle,
  rank,
  machine_publications!inner (status, slug, revision, approved_by, approved_at, approved_editorial_revision, published_by, first_published_at, published_at, published_editorial_revision, updated_at),
  machine_editorials (revision, public_condition_summary, expert_summary, suitable_for, not_suitable_for, contextual_label, included_items, policy_applicability, reviewed_by, reviewed_at),
  machine_images (id, public_url, image_type, image_stage, visibility, sort_order, is_cover, processing_status, derivatives),
  machine_verifications (verification_code, verified, verified_at, public)
`;

type PublicAvailabilityRow = {
  machine_public_identifier: string;
  availability: string;
  reservation_kind: string | null;
  state_valid: boolean;
};

export class PublicInventoryDatabaseError extends Error {
  constructor(
    readonly operation: "list" | "getBySlug",
    readonly databaseCode: string,
  ) {
    super("Public machine inventory is temporarily unavailable.");
    this.name = "PublicInventoryDatabaseError";
  }
}

async function loadPublicMachineCandidates(operation: "list" | "getBySlug") {
  const client = createServerSupabaseClient();
  const [candidateResult, availabilityResult] = await Promise.all([
    client
      .from("machines")
      .select(PUBLIC_CANDIDATE_FIELDS)
      .eq("machine_publications.status", "published")
      .order("machine_id", { ascending: true }),
    client.rpc("get_public_machine_availability_v1"),
  ]);
  const error = candidateResult.error ?? availabilityResult.error;
  if (error) {
    console.error(
      "[public-inventory]",
      JSON.stringify({
        stage: "PUBLIC_INVENTORY_QUERY_FAILED",
        code: error.code ?? "unknown",
        operation,
        message: "Public inventory query failed.",
      }),
    );
    throw new PublicInventoryDatabaseError(operation, error.code ?? "unknown");
  }
  const availabilityByCode = new Map(
    ((availabilityResult.data ?? []) as PublicAvailabilityRow[]).map((row) => [
      row.machine_public_identifier,
      {
        availability: row.availability,
        reservation_kind: row.reservation_kind,
        state_valid: row.state_valid,
      },
    ]),
  );
  const rows = (candidateResult.data ?? []).map((row) => ({
    ...row,
    public_availability: availabilityByCode.get(row.machine_id) ?? null,
  }));
  return {
    client,
    rows,
    projections: projectPublicCandidates(rows, (diagnostic) =>
      console.error("[public-inventory]", JSON.stringify(diagnostic)),
    ),
  };
}

export const supabasePublicMachineRepository: PublicMachineRepository = {
  async list() {
    return (await loadPublicMachineCandidates("list")).projections
      .filter((result) => result.eligible)
      .map((result) => result.summary)
      .toSorted(
        (left, right) =>
          Date.parse(right.publishedAt ?? "") -
            Date.parse(left.publishedAt ?? "") ||
          left.slug.localeCompare(right.slug),
      );
  },
  async getBySlug(slug) {
    const { client, rows, projections } =
      await loadPublicMachineCandidates("getBySlug");
    for (const result of projections) {
      if (result.eligible && result.detail.summary.slug === slug) {
        const row = rows.find(
          (candidate) => candidate.machine_id === result.detail.summary.code,
        );
        const machineId = typeof row?.id === "string" ? row.id : null;
        if (!machineId) return result.detail;
        const policySummary = await loadPublicMachinePolicySummary(
          client,
          machineId,
        );
        return policySummary
          ? { ...result.detail, policySummary }
          : result.detail;
      }
    }
    return null;
  },
};
