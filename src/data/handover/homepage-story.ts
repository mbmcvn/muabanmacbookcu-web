export const HOMEPAGE_STORY_SCHEMA_VERSION =
  "homepage-handover-story.v1" as const;
export const HOMEPAGE_STORY_LIMIT = 4;

export type HomepageStoryDTO = {
  schemaVersion: typeof HOMEPAGE_STORY_SCHEMA_VERSION;
  slug: string;
  customerLabel: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  occurredAt: string | null;
  publishedAt: string;
};

type ProjectionRow = {
  schema_version?: unknown;
  slug?: unknown;
  customer_label?: unknown;
  title?: unknown;
  excerpt?: unknown;
  image_url?: unknown;
  occurred_at?: unknown;
  published_at?: unknown;
};

const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE = /(?:\+?\d[\s().-]*){9,}/;
export type HomepageStoryDiagnosticCode =
  | "HOMEPAGE_STORIES_INVALID_PAYLOAD"
  | "HOMEPAGE_STORIES_QUERY_FAILED";

function safeText(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maximum && !EMAIL.test(text) && !PHONE.test(text)
    ? text
    : null;
}

function safeSlug(value: unknown) {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  return slug && slug.length <= 160 ? slug : null;
}

function isoDate(value: unknown, nullable = false) {
  if (nullable && value === null) return null;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  ) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

export function parseHomepageStory(value: unknown): HomepageStoryDTO | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as ProjectionRow;
  const slug = safeSlug(row.slug);
  const customerLabel = safeText(row.customer_label, 80);
  const title = safeText(row.title, 100);
  const excerpt = safeText(row.excerpt, 240);
  const occurredAt = isoDate(row.occurred_at, true);
  const publishedAt = isoDate(row.published_at);
  let imageUrl: string | null = null;

  if (typeof row.image_url === "string") {
    try {
      const url = new URL(row.image_url);
      if (
        url.protocol === "https:" &&
        url.hostname === "media.mbmc.vn" &&
        url.pathname.startsWith("/handover-public/")
      ) {
        imageUrl = url.toString();
      }
    } catch {}
  }

  if (
    row.schema_version !== HOMEPAGE_STORY_SCHEMA_VERSION ||
    !slug ||
    !customerLabel ||
    !title ||
    !excerpt ||
    !imageUrl ||
    occurredAt === undefined ||
    !publishedAt
  ) {
    return null;
  }

  return {
    schemaVersion: HOMEPAGE_STORY_SCHEMA_VERSION,
    slug,
    customerLabel,
    title,
    excerpt,
    imageUrl,
    occurredAt,
    publishedAt,
  };
}

export function parseHomepageStories(value: unknown): HomepageStoryDTO[] {
  if (!Array.isArray(value)) return [];
  const rows = value.slice(0, HOMEPAGE_STORY_LIMIT).map(parseHomepageStory);
  return rows.every((story): story is HomepageStoryDTO => story !== null)
    ? rows
    : [];
}

export async function loadHomepageStoriesSafely(
  load: () => Promise<unknown>,
  report: (code: HomepageStoryDiagnosticCode) => void = () => {},
) {
  try {
    const value = await load();
    const stories = parseHomepageStories(value);
    if (!Array.isArray(value) || (value.length > 0 && stories.length === 0)) {
      report("HOMEPAGE_STORIES_INVALID_PAYLOAD");
    }
    return stories;
  } catch {
    report("HOMEPAGE_STORIES_QUERY_FAILED");
    return [];
  }
}
