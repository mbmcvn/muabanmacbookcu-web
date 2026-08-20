export const CARE_STORY_SCHEMA_VERSION = "care-handover-story.v1" as const;

export type CareStoryDTO = {
  schemaVersion: typeof CARE_STORY_SCHEMA_VERSION;
  customerLabel: string;
  title: string;
  story: string;
  imageUrl: string;
  handoverDate: string;
  peopleHref: string | null;
};

type Row = Record<string, unknown>;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE = /(?:\+?\d[\s().-]*){9,}/;
const PEOPLE_HREF = /^\/people\/story-[0-9a-f]{32}$/;

function text(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean && clean.length <= maximum && !EMAIL.test(clean) && !PHONE.test(clean)
    ? clean
    : null;
}

function date(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

function image(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "media.mbmc.vn" &&
      url.pathname.startsWith("/handover-public/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function parseCareStory(value: unknown): CareStoryDTO | null {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Row;
  const customerLabel = text(row.customer_label, 80);
  const title = text(row.title, 120);
  const story = text(row.story, 5000);
  const imageUrl = image(row.image_url);
  const handoverDate = date(row.handover_date);
  const peopleHref = row.people_href === null
    ? null
    : typeof row.people_href === "string" && PEOPLE_HREF.test(row.people_href)
      ? row.people_href
      : undefined;

  return row.schema_version === CARE_STORY_SCHEMA_VERSION &&
    customerLabel && title && story && imageUrl && handoverDate &&
    peopleHref !== undefined
    ? {
        schemaVersion: CARE_STORY_SCHEMA_VERSION,
        customerLabel,
        title,
        story,
        imageUrl,
        handoverDate,
        peopleHref,
      }
    : null;
}
