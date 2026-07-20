import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicMachineRepository } from "./public-machine-repository";
import {
  projectPublicCandidates,
} from "../project-public-candidates";

const PUBLIC_CANDIDATE_FIELDS = `
  machine_id,
  status,
  deleted_at,
  model_text,
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
  machine_images (id, public_url, image_type, image_stage, visibility, sort_order, is_cover)
`;

export class PublicInventoryDatabaseError extends Error {
  constructor(readonly operation: "list" | "getBySlug", readonly databaseCode: string) {
    super("Public machine inventory is temporarily unavailable.");
    this.name = "PublicInventoryDatabaseError";
  }
}

async function loadPublicMachineCandidates(operation: "list" | "getBySlug") {
  const { data, error } = await createServerSupabaseClient()
    .from("machines")
    .select(PUBLIC_CANDIDATE_FIELDS)
    .eq("machine_publications.status", "published")
    .order("machine_id", { ascending: true });
  if (error) {
    console.error("[public-inventory]", {
      stage: "PUBLIC_INVENTORY_QUERY_FAILED",
      code: error.code ?? "unknown",
      operation,
    });
    throw new PublicInventoryDatabaseError(operation, error.code ?? "unknown");
  }
  return projectPublicCandidates(data ?? [], (diagnostic) =>
    console.error("[public-inventory]", diagnostic),
  );
}

export const supabasePublicMachineRepository: PublicMachineRepository = {
  async list() {
    return (await loadPublicMachineCandidates("list"))
      .filter((result) => result.eligible)
      .map((result) => result.summary)
      .toSorted((left, right) =>
        Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "") ||
        left.slug.localeCompare(right.slug),
      );
  },
  async getBySlug(slug) {
    for (const result of await loadPublicMachineCandidates("getBySlug")) {
      if (result.eligible && result.detail.summary.slug === slug) return result.detail;
    }
    return null;
  },
};