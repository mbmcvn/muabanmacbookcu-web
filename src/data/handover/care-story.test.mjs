import assert from "node:assert/strict";
import test from "node:test";
import { parseCareStory } from "./care-story.ts";

const row = {
  schema_version: "care-handover-story.v1",
  customer_label: "Khách hàng Minh",
  title: "Một chiếc máy cho chặng đường mới",
  story: "Câu chuyện bàn giao thuộc đúng vòng sở hữu hiện tại.",
  image_url: "https://media.mbmc.vn/handover-public/current.webp",
  handover_date: "2026-07-25T00:00:00Z",
  people_href: "/people/story-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

test("Care DTO parses its exact public contract", () => {
  assert.deepEqual(parseCareStory(row), {
    schemaVersion: "care-handover-story.v1",
    customerLabel: row.customer_label,
    title: row.title,
    story: row.story,
    imageUrl: row.image_url,
    handoverDate: "2026-07-25T00:00:00.000Z",
    peopleHref: row.people_href,
  });
});

test("Care DTO accepts a story at the 5,000-character limit", () => {
  const story = "a".repeat(5000);
  assert.equal(parseCareStory({ ...row, story })?.story, story);
});

test("Care DTO rejects a story above the 5,000-character limit", () => {
  assert.equal(parseCareStory({ ...row, story: "a".repeat(5001) }), null);
});

test("null Care story parses as null", () => {
  assert.equal(parseCareStory(null), null);
});

test("invalid image, private fields, or constructed People routes fail closed", () => {
  assert.equal(parseCareStory({ ...row, image_url: "https://example.com/image.webp" }), null);
  assert.equal(parseCareStory({ ...row, people_href: "/people/not-canonical" }), null);
});

test("nullable backend People destination is accepted", () => {
  assert.equal(parseCareStory({ ...row, people_href: null })?.peopleHref, null);
});
