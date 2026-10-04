import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { canonicalPublicImages, publicCandidatePrivacyValid, publicUrlIsValid } from "@/data/machines/project-public-candidates";
import { filterPublicMachineImages, selectPublicMachineCover } from "@/lib/public-projection/kernel.server";

export type CareMachinePresentation = {
  displayName: string | null;
  image: { url: string; alt: string } | null;
};

// Care identity eligibility is independent of inventory publication/availability.
// This accepts one exact already-resolved public code, never a serial or search.
export function projectCareMachinePresentation(code: string, value: unknown): CareMachinePresentation | null {
  if (!/^MBMC-[A-Z0-9-]{1,35}$/.test(code) || !value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (row.machine_id !== code || !["new_in_stock", "sold"].includes(String(row.status)) || row.deleted_at !== null) return null;
  const displayName = typeof row.model_text === "string" && row.model_text.trim() && publicCandidatePrivacyValid({ model_text: row.model_text })
    ? row.model_text.trim() : null;
  const cover = selectPublicMachineCover(filterPublicMachineImages(canonicalPublicImages(row.machine_images)));
  const url = cover?.variants?.card?.url ?? cover?.url;
  return {
    displayName,
    image: cover && publicUrlIsValid(cover.url) && url && publicUrlIsValid(url)
      ? { url, alt: displayName ? `Ảnh đại diện ${displayName}` : "Ảnh đại diện máy MBMC" } : null,
  };
}

export async function getCareMachinePresentation(code: string): Promise<CareMachinePresentation | null> {
  if (!/^MBMC-[A-Z0-9-]{1,35}$/.test(code)) return null;
  try {
    const { data, error } = await createServerSupabaseClient()
      .from("machines")
      .select("machine_id,status,deleted_at,model_text,machine_images(id,public_url,image_type,image_stage,visibility,sort_order,is_cover,processing_status,derivatives)")
      .eq("machine_id", code)
      .in("status", ["new_in_stock", "sold"])
      .is("deleted_at", null)
      .limit(2);
    if (error || !Array.isArray(data) || data.length !== 1) return null;
    return projectCareMachinePresentation(code, data[0]);
  } catch {
    // Optional presentation failure must not hide Care warranty or report history.
    return null;
  }
}
