import type {
  DemandSourceRoute,
  DesiredMacBookSpecV1,
  InventoryContextSnapshotV1,
  RequirementSnapshotV1,
} from "./demand-contract";

export type CaptchaChallenge = {
  challengeId: string;
  representation: string;
  expiresAt: string;
};
export type CaptchaDemandInput = {
  submissionKey: string;
  submittedPhone: string;
  sourceRoute: DemandSourceRoute;
  requirementSnapshot?: RequirementSnapshotV1;
  desiredSpecSnapshot?: DesiredMacBookSpecV1;
  inventoryContextSnapshot: InventoryContextSnapshotV1;
  referralEvidence?: string | null;
  captchaChallengeId: string;
  captchaResponse: string;
};

export async function issueDemandCaptcha(): Promise<CaptchaChallenge> {
  const response = await fetch("/api/demand/captcha", { method: "POST" });
  if (!response.ok) throw new Error("captcha_unavailable");
  return response.json() as Promise<CaptchaChallenge>;
}

export async function submitCaptchaDemand(
  input: CaptchaDemandInput,
): Promise<{ demandRequestId: string }> {
  const response = await fetch("/api/demand", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok)
    throw new Error(
      response.status === 429 ? "rate_limited" : "demand_rejected",
    );
  return response.json() as Promise<{ demandRequestId: string }>;
}
