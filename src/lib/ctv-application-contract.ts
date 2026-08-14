export const CTV_APPLICATION_SCHEMA = "mbmc.ctv-application.v1" as const;
export const CTV_ANSWERS_SCHEMA = "mbmc.ctv-application-answers.v1" as const;

export const CTV_QUESTION_IDS = [
  "distribution_surface",
  "mbmc_exploration",
  "unclear_customer",
  "unavailable_machine",
  "price_question",
  "ctv_value",
  "challenge",
] as const;

export type CtvQuestionId = (typeof CTV_QUESTION_IDS)[number];
export type CtvAnswersV1 = Readonly<
  { schemaVersion: typeof CTV_ANSWERS_SCHEMA } & Record<CtvQuestionId, string>
>;
export type CtvApplicationV1 = Readonly<{
  schemaVersion: typeof CTV_APPLICATION_SCHEMA;
  submissionKey: string;
  displayName: string;
  submittedPhone: string;
  profileUrl: string;
  answers: CtvAnswersV1;
}>;

type Result =
  | Readonly<{ ok: true; value: CtvApplicationV1 }>
  | Readonly<{ ok: false; reason: string }>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function safeProfileUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 500) return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseCtvApplicationV1(value: unknown): Result {
  if (!record(value) || value.schemaVersion !== CTV_APPLICATION_SCHEMA)
    return { ok: false, reason: "invalid_schema" };
  if (
    typeof value.submissionKey !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(value.submissionKey)
  )
    return { ok: false, reason: "invalid_submission_key" };
  if (
    typeof value.displayName !== "string" ||
    !value.displayName.trim() ||
    value.displayName.trim().length > 120
  )
    return { ok: false, reason: "invalid_display_name" };
  if (
    typeof value.submittedPhone !== "string" ||
    !value.submittedPhone.trim() ||
    value.submittedPhone.length > 40
  )
    return { ok: false, reason: "invalid_phone" };
  const profileUrl = safeProfileUrl(value.profileUrl);
  if (!profileUrl) return { ok: false, reason: "invalid_profile_url" };
  if (
    !record(value.answers) ||
    value.answers.schemaVersion !== CTV_ANSWERS_SCHEMA
  )
    return { ok: false, reason: "invalid_answers_schema" };
  for (const id of CTV_QUESTION_IDS) {
    const answer = value.answers[id];
    if (typeof answer !== "string" || !answer.trim())
      return { ok: false, reason: `missing_${id}` };
    if (answer.trim().length > 4_000)
      return { ok: false, reason: `excessive_${id}` };
  }
  return {
    ok: true,
    value: {
      schemaVersion: CTV_APPLICATION_SCHEMA,
      submissionKey: value.submissionKey,
      displayName: value.displayName.trim(),
      submittedPhone: value.submittedPhone.trim(),
      profileUrl,
      answers: value.answers as CtvAnswersV1,
    },
  };
}
