import { NextResponse } from "next/server";
import {
  parseDemandRequestV1,
  DEMAND_REQUEST_SCHEMA,
  ACQUISITION_SNAPSHOT_SCHEMA,
} from "@/lib/demand-contract";
import { demandClientFingerprint, demandRpc } from "@/lib/demand-api.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown, max: number) {
  return typeof value === "string" && value.length <= max ? value : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const submittedPhone = text(body.submittedPhone, 40);
  const challengeId = text(body.captchaChallengeId, 36);
  const captchaResponse = text(body.captchaResponse, 4);
  const referralEvidence =
    body.referralEvidence == null ? null : text(body.referralEvidence, 64);
  const parsed = parseDemandRequestV1({
    schemaVersion: DEMAND_REQUEST_SCHEMA,
    submissionKey: body.submissionKey,
    sourceRoute: body.sourceRoute,
    requirementSnapshot: body.requirementSnapshot,
    desiredSpecSnapshot: body.desiredSpecSnapshot,
    inventoryContextSnapshot: body.inventoryContextSnapshot,
    acquisitionSnapshot: {
      schemaVersion: ACQUISITION_SNAPSHOT_SCHEMA,
      source: "organic",
    },
  });
  if (
    !submittedPhone ||
    !challengeId ||
    !captchaResponse ||
    !parsed.ok ||
    (body.referralEvidence != null && referralEvidence == null)
  )
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const value = parsed.value;
  const { data, error } = await demandRpc().rpc(
    "create_captcha_soft_demand_v1",
    {
      p_submission_key: value.submissionKey,
      p_submitted_phone: submittedPhone,
      p_source_route: value.sourceRoute,
      p_requirement_snapshot: value.requirementSnapshot ?? null,
      p_desired_spec_snapshot: value.desiredSpecSnapshot ?? null,
      p_inventory_context_snapshot: value.inventoryContextSnapshot,
      p_referral_evidence: referralEvidence,
      p_captcha_challenge_id: challengeId,
      p_captcha_response: captchaResponse,
      p_client_fingerprint: demandClientFingerprint(request),
    },
  );
  const row = data?.[0];
  if (error?.message.includes("payload conflict"))
    return NextResponse.json({ error: "submission_conflict" }, { status: 409 });
  if (error || !row)
    return NextResponse.json({ error: "demand_rejected" }, { status: 400 });
  return NextResponse.json(
    { demandRequestId: row.demand_request_id },
    {
      status: row.created ? 201 : 200,
      headers: { "cache-control": "no-store" },
    },
  );
}
