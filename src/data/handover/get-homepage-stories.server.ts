import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  HOMEPAGE_STORY_LIMIT,
  loadHomepageStoriesSafely,
} from "./homepage-story";

export function getHomepageStories() {
  return loadHomepageStoriesSafely(
    async () => {
      const { data, error } = await createServerSupabaseClient().rpc(
        "get_public_homepage_handover_stories",
        { p_limit: HOMEPAGE_STORY_LIMIT },
      );
      if (error) throw error;
      return data;
    },
    (code) => {
      console.error("[homepage-handover]", {
        code,
      });
    },
  );
}
