export const PEOPLE_STORY_SCHEMA_VERSION = "people-handover-story.v1" as const;

export type PeopleStorySummaryDTO = {
  schemaVersion: typeof PEOPLE_STORY_SCHEMA_VERSION;
  slug: string;
  customerLabel: string;
  title: string;
  excerpt: string;
  coverImage: string;
  occurredAt: string;
  publishedAt: string;
};

export type PeopleStoryDetailDTO = {
  schemaVersion: typeof PEOPLE_STORY_SCHEMA_VERSION;
  slug: string;
  customerLabel: string;
  title: string;
  story: string;
  imageUrl: string;
  occurredAt: string;
  publishedAt: string;
};

type Row = Record<string, unknown>;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE = /(?:\+?\d[\s().-]*){9,}/;
const SLUG = /^story-[0-9a-f]{32}$/;

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

function common(row: Row) {
  const slug = typeof row.slug === "string" && SLUG.test(row.slug) ? row.slug : null;
  const customerLabel = text(row.customer_label, 80);
  const title = text(row.title, 120);
  const occurredAt = date(row.occurred_at);
  const publishedAt = date(row.published_at);
  return row.schema_version === PEOPLE_STORY_SCHEMA_VERSION &&
    slug && customerLabel && title && occurredAt && publishedAt
    ? { slug, customerLabel, title, occurredAt, publishedAt }
    : null;
}

export function parsePeopleSummary(value: unknown): PeopleStorySummaryDTO | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Row;
  const base = common(row);
  const excerpt = text(row.excerpt, 240);
  const coverImage = image(row.cover_image);
  return base && excerpt && coverImage
    ? { schemaVersion: PEOPLE_STORY_SCHEMA_VERSION, ...base, excerpt, coverImage }
    : null;
}

export function parsePeopleDetail(value: unknown): PeopleStoryDetailDTO | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Row;
  const base = common(row);
  const story = text(row.story, 3000);
  const imageUrl = image(row.image_url);
  return base && story && imageUrl
    ? { schemaVersion: PEOPLE_STORY_SCHEMA_VERSION, ...base, story, imageUrl }
    : null;
}

export function parsePeopleSummaries(value: unknown) {
  if (!Array.isArray(value)) return [];
  const stories = value.map(parsePeopleSummary);
  return stories.every((story): story is PeopleStorySummaryDTO => story !== null)
    ? stories
    : [];
}
