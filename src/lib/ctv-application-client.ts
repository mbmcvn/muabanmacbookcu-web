import type { CtvApplicationV1 } from "@/lib/ctv-application-contract";

export type CtvCaptcha = Readonly<{
  challengeId: string;
  representation: string;
  expiresAt: string;
}>;

export async function issueCtvCaptcha(): Promise<CtvCaptcha> {
  const response = await fetch("/api/ctv/applications/captcha", {
    method: "POST",
  });
  if (!response.ok) throw new Error("captcha_unavailable");
  return response.json();
}

export async function submitCtvApplication(
  input: CtvApplicationV1 & {
    captchaChallengeId: string;
    captchaResponse: string;
  },
) {
  const response = await fetch("/api/ctv/applications", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok)
    throw new Error(
      (await response.json().catch(() => null))?.error ??
        "application_rejected",
    );
  return response.json() as Promise<{ applicationId: string }>;
}
