import assert from "node:assert/strict";
import test from "node:test";
import { parsePeopleDetail } from "./people-story.ts";

const row = {
  schema_version: "people-handover-story.v1",
  slug: "story-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  customer_label: "Khách hàng Minh",
  title: "Một chiếc máy cho chặng đường mới",
  story: "Câu chuyện bàn giao.",
  image_url: "https://media.mbmc.vn/handover-public/current.webp",
  occurred_at: "2026-07-25T00:00:00Z",
  published_at: "2026-07-25T01:00:00Z",
};

test("People detail accepts a story at the 5,000-character limit", () => {
  const story = "a".repeat(5000);

  assert.deepEqual(parsePeopleDetail({ ...row, story }), {
    schemaVersion: "people-handover-story.v1",
    slug: row.slug,
    customerLabel: row.customer_label,
    title: row.title,
    story,
    imageUrl: row.image_url,
    occurredAt: "2026-07-25T00:00:00.000Z",
    publishedAt: "2026-07-25T01:00:00.000Z",
  });
});

test("People detail rejects a story above the 5,000-character limit", () => {
  assert.equal(parsePeopleDetail({ ...row, story: "a".repeat(5001) }), null);
});

test("People detail preserves the existing validation for other fields", () => {
  assert.equal(parsePeopleDetail({ ...row, slug: "not-canonical" }), null);
  assert.equal(parsePeopleDetail({ ...row, customer_label: "customer@example.com" }), null);
  assert.equal(parsePeopleDetail({ ...row, image_url: "https://example.com/image.webp" }), null);
  assert.equal(parsePeopleDetail({ ...row, published_at: "not-a-date" }), null);
});
