import { NextResponse } from "next/server";
import {
  ctvApplicationFingerprint,
  ctvApplicationRpc,
} from "@/lib/ctv-application-api.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const { data, error } = await ctvApplicationRpc().rpc(
    "issue_ctv_application_captcha_v1",
    { p_client_fingerprint: ctvApplicationFingerprint(request) },
  );
  const row = data?.[0];
  if (error || !row)
    return NextResponse.json(
      { error: "captcha_unavailable" },
      { status: error?.message.includes("Rate limited") ? 429 : 503 },
    );
  return NextResponse.json(
    {
      challengeId: row.challenge_id,
      representation: row.challenge_representation,
      expiresAt: row.expires_at,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
