import "server-only";
import { createHash } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export function ctvApplicationFingerprint(request: Request) {
  const address =
    request.headers.get("cf-connecting-ip")?.trim() ??
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return createHash("sha256")
    .update(
      `${process.env.DEMAND_RATE_LIMIT_SECRET ?? "local"}:ctv-application:${address}`,
    )
    .digest("hex");
}

export function ctvApplicationRpc() {
  return createServerSupabaseClient();
}
