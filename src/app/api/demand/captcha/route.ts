import { NextResponse } from "next/server";
import { demandClientFingerprint, demandRpc } from "@/lib/demand-api.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { data, error } = await demandRpc().rpc("issue_demand_captcha_v1", {
    p_client_fingerprint: demandClientFingerprint(request),
  });
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
