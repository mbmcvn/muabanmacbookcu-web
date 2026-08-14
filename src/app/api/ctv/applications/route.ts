import { NextResponse } from "next/server";
import { parseCtvApplicationV1 } from "@/lib/ctv-application-contract";
import {
  ctvApplicationFingerprint,
  ctvApplicationRpc,
} from "@/lib/ctv-application-api.server";
import { notifyNewCtvApplicationBestEffort } from "@/lib/ctv-application-notification.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const parsed = parseCtvApplicationV1(body);
  const challengeId =
    typeof body.captchaChallengeId === "string" &&
    body.captchaChallengeId.length <= 36
      ? body.captchaChallengeId
      : null;
  const response =
    typeof body.captchaResponse === "string" &&
    /^[0-9]{4}$/.test(body.captchaResponse)
      ? body.captchaResponse
      : null;
  if (!parsed.ok || !challengeId || !response)
    return NextResponse.json(
      { error: parsed.ok ? "invalid_request" : parsed.reason },
      { status: 400 },
    );
  const value = parsed.value;
  const { data, error } = await ctvApplicationRpc().rpc(
    "create_ctv_application_v1",
    {
      p_submission_key: value.submissionKey,
      p_display_name: value.displayName,
      p_submitted_phone: value.submittedPhone,
      p_profile_url: value.profileUrl,
      p_answers_snapshot: value.answers,
      p_captcha_challenge_id: challengeId,
      p_captcha_response: response,
      p_client_fingerprint: ctvApplicationFingerprint(request),
    },
  );
  const row = data?.[0];
  if (error?.message.includes("payload conflict"))
    return NextResponse.json({ error: "submission_conflict" }, { status: 409 });
  if (error || !row)
    return NextResponse.json(
      { error: "application_rejected" },
      { status: 400 },
    );
  if (row.created) await notifyNewCtvApplicationBestEffort(row.application_id);
  return NextResponse.json(
    { applicationId: row.application_id },
    {
      status: row.created ? 201 : 200,
      headers: { "cache-control": "no-store" },
    },
  );
}
