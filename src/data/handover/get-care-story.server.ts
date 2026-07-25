import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseCareStory, type CareStoryDTO } from "./care-story";
import type { CareAccessContext } from "@/data/care/care-session";

export async function getCareStory(
  machineCode: string,
  access: CareAccessContext,
): Promise<CareStoryDTO | null> {
  if (access.machineCode !== machineCode.trim().toUpperCase()) return null;
  try {
    const { data, error } = await createServerSupabaseClient().rpc(
      "get_public_care_handover_story",
      { p_machine_code: machineCode },
    );
    if (error) throw error;
    return Array.isArray(data) && data.length === 1
      ? parseCareStory(data[0])
      : null;
  } catch {
    console.error("[care-handover]", { code: "CARE_STORY_QUERY_FAILED" });
    return null;
  }
}
