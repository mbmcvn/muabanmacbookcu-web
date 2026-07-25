import assert from "node:assert/strict";
import test from "node:test";
import {
  HOMEPAGE_STORY_LIMIT,
  loadHomepageStoriesSafely,
  parseHomepageStory,
  parseHomepageStories,
} from "./homepage-story.ts";

const row = (number = 1) => ({
  schema_version: "homepage-handover-story.v1",
  slug: `story-${String(number).padStart(32, "0")}`,
  customer_label: `Khách hàng ${number}`,
  title: `Homepage title ${number}`,
  excerpt: `Homepage excerpt ${number}`,
  image_url: `https://media.mbmc.vn/handover-public/${number}.webp`,
  occurred_at: `2026-07-${String(20 + number).padStart(2, "0")}T00:00:00.000Z`,
  published_at: "2026-07-20T00:00:00.000Z",
});

test("valid public projection maps to the exact safe DTO", () => {
  assert.deepEqual(parseHomepageStory(row()), {
    schemaVersion: "homepage-handover-story.v1",
    slug: "story-00000000000000000000000000000001",
    customerLabel: "Khách hàng 1",
    title: "Homepage title 1",
    excerpt: "Homepage excerpt 1",
    imageUrl: "https://media.mbmc.vn/handover-public/1.webp",
    occurredAt: "2026-07-21T00:00:00.000Z",
    publishedAt: "2026-07-20T00:00:00.000Z",
  });
});

test("PostgreSQL microsecond timestamps are accepted and normalized", () => {
  const parsed = parseHomepageStory({
    ...row(),
    published_at: "2026-07-20T00:00:00.123456+00:00",
  });
  assert.equal(parsed?.publishedAt, "2026-07-20T00:00:00.123Z");
});

test("unsafe and malformed rows are rejected without serializing private fields", () => {
  assert.equal(parseHomepageStory({ ...row(), schema_version: "v2" }), null);
  for (const field of ["slug", "customer_label", "title", "excerpt"]) {
    assert.equal(parseHomepageStory({ ...row(), [field]: "  " }), null);
  }
  assert.equal(parseHomepageStory({ ...row(), occurred_at: "July 21, 2026" }), null);
  assert.equal(parseHomepageStory({ ...row(), published_at: "not-a-date" }), null);
  assert.equal(parseHomepageStory({ ...row(), image_url: "http://media.mbmc.vn/handover-public/a.webp" }), null);
  assert.equal(parseHomepageStory({ ...row(), customer_label: "0901 234 567" }), null);
  assert.equal(parseHomepageStory({ ...row(), image_url: "https://evil.test/a.webp" }), null);
  const parsed = parseHomepageStory({ ...row(), sale_id: "private", story: "private" });
  assert.equal("saleId" in parsed, false);
  assert.equal("story" in parsed, false);
});

test("backend ordering is preserved and the four-story bound is enforced", () => {
  const stories = parseHomepageStories([row(1), row(3), row(2), row(5), row(4)]);
  assert.equal(stories.length, HOMEPAGE_STORY_LIMIT);
  assert.deepEqual(stories.map((story) => story.title), [
    "Homepage title 1",
    "Homepage title 3",
    "Homepage title 2",
    "Homepage title 5",
  ]);
});

test("a malformed row rejects the whole public payload", () => {
  assert.deepEqual(parseHomepageStories([row(1), { ...row(2), title: "" }]), []);
});

test("query failures fail closed without exposing raw errors", async () => {
  const diagnostics = [];
  const stories = await loadHomepageStoriesSafely(
    async () => {
      throw new Error("raw database detail");
    },
    (code) => diagnostics.push(code),
  );
  assert.deepEqual(stories, []);
  assert.deepEqual(diagnostics, ["HOMEPAGE_STORIES_QUERY_FAILED"]);
  assert.doesNotMatch(JSON.stringify(diagnostics), /raw database detail/);
});

test("invalid payloads fail closed with a safe diagnostic", async () => {
  const diagnostics = [];
  const stories = await loadHomepageStoriesSafely(
    async () => [row(1), { ...row(2), excerpt: "" }],
    (code) => diagnostics.push(code),
  );
  assert.deepEqual(stories, []);
  assert.deepEqual(diagnostics, ["HOMEPAGE_STORIES_INVALID_PAYLOAD"]);
});
