import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  parsePeopleDetail,
  parsePeopleSummaries,
  type PeopleStoryDetailDTO,
} from "./people-story";

export async function getPeopleStories() {
  try {
    const { data, error } = await createServerSupabaseClient().rpc(
      "get_public_people_handover_stories",
    );
    if (error) throw error;
    return parsePeopleSummaries(data);
  } catch {
    console.error("[people-handover]", { code: "PEOPLE_STORIES_QUERY_FAILED" });
    return [];
  }
}

export async function getPeopleStoryBySlug(
  slug: string,
): Promise<PeopleStoryDetailDTO | null> {
  if (!/^story-[0-9a-f]{32}$/.test(slug)) return null;
  try {
    const { data, error } = await createServerSupabaseClient().rpc(
      "get_public_people_handover_story",
      { p_slug: slug },
    );
    if (error) throw error;
    return Array.isArray(data) && data.length === 1
      ? parsePeopleDetail(data[0])
      : null;
  } catch {
    console.error("[people-handover]", { code: "PEOPLE_STORY_QUERY_FAILED" });
    return null;
  }
}
