import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicMachineDetail } from "@/models";
import {
  adaptPublicMachineCard,
  adaptPublicMachineDetail,
} from "../adapters/public-machine-adapter";
import type { PublicMachineRepository } from "./public-machine-repository";

const PUBLIC_MACHINE_FIELDS = `
  id,
  machine_id,
  model_text,
  chip,
  ram_gb,
  ssd_gb,
  color,
  charger_included,
  status,
  created_at,
  deleted_at,
  battery_health,
  battery_cycle,
  rank,
  public_condition_note,
  public_visible,
  public_slug,
  public_price,
  public_warranty_months,
  public_summary,
  public_source_summary,
  public_tag,
  suitable_for,
  not_suitable_for,
  inspection_status,
  inspected_at,
  inspection_summary,
  published_at,
  machine_images!inner (
    id,
    machine_id,
    public_url,
    image_type,
    image_stage,
    visibility,
    sort_order,
    is_cover,
    created_at
  )
`;

function repositoryFailure(operation: "list" | "getBySlug", code?: string): Error {
  console.error("[public-machine-repository] Supabase query failed", { operation, code: code ?? "unknown" });
  return new Error("Public machine inventory is temporarily unavailable.");
}

export const supabasePublicMachineRepository: PublicMachineRepository = {
  async list() {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("machines")
      .select(PUBLIC_MACHINE_FIELDS)
      .eq("public_visible", true)
      .eq("inspection_status", "passed")
      .is("deleted_at", null)
      .in("status", ["new_in_stock", "selling"])
      .gt("public_price", 0)
      .eq("machine_images.visibility", "public")
      .in("machine_images.image_stage", ["approved", "listing"])
      .not("machine_images.public_url", "is", null)
      .order("published_at", { ascending: false })
      .order("sort_order", { ascending: true, referencedTable: "machine_images" });

    if (error) throw repositoryFailure("list", error.code);
    return (data ?? []).map(adaptPublicMachineCard).filter((machine) => machine !== null);
  },

  async getBySlug(slug: string): Promise<PublicMachineDetail | null> {
    const supabase = createServerSupabaseClient();
    const { data: machine, error: machineError } = await supabase
      .from("machines")
      .select(PUBLIC_MACHINE_FIELDS)
      .eq("public_slug", slug)
      .eq("public_visible", true)
      .eq("inspection_status", "passed")
      .is("deleted_at", null)
      .in("status", ["new_in_stock", "selling"])
      .gt("public_price", 0)
      .eq("machine_images.visibility", "public")
      .in("machine_images.image_stage", ["approved", "listing"])
      .not("machine_images.public_url", "is", null)
      .order("sort_order", { ascending: true, referencedTable: "machine_images" })
      .maybeSingle();

    if (machineError) throw repositoryFailure("getBySlug", machineError.code);
    if (!machine) return null;

    const machineId = typeof machine.machine_id === "string" ? machine.machine_id : null;
    const machineUuid = typeof machine.id === "string" ? machine.id : null;
    if (!machineId || !machineUuid) return null;

    const [eventsResult, repairsResult] = await Promise.all([
      supabase
        .from("machine_events")
        .select("id,machine_id,event_type,title,note,created_at,hidden,visibility")
        .eq("machine_id", machineId)
        .eq("visibility", "public")
        .eq("hidden", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("repairs")
        .select("id,machine_id,repair_type,issue_summary,solution,public_note,completed_at,created_at")
        .eq("machine_id", machineUuid)
        .order("created_at", { ascending: false }),
    ]);

    if (eventsResult.error) throw repositoryFailure("getBySlug", eventsResult.error.code);
    if (repairsResult.error) throw repositoryFailure("getBySlug", repairsResult.error.code);
    return adaptPublicMachineDetail(machine, eventsResult.data ?? [], repairsResult.data ?? []);
  },
};
