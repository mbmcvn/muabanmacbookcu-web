import "server-only";

import { createClient } from "@supabase/supabase-js";

export class PublicInventoryConfigurationError extends Error {
  readonly code = "PUBLIC_INVENTORY_CONFIG_MISSING";

  constructor() {
    super("Public inventory server configuration is missing.");
    this.name = "PublicInventoryConfigurationError";
  }
}

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    if (process.env.NODE_ENV === "development") {
      console.error("[public-inventory]", {
        stage: "PUBLIC_INVENTORY_CONFIG_MISSING",
        code: "configuration_missing",
      });
    }
    throw new PublicInventoryConfigurationError();
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}