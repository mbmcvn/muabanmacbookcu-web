import assert from "node:assert/strict";
import test from "node:test";
import {
  mapHomepageStoryToCard,
  mapPeopleStoryToCard,
} from "./HandoverStoryCardModel.ts";

const common = {
  slug: "story-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  customerLabel: "Khách hàng A",
  title: "Title",
  excerpt: "Excerpt",
  publishedAt: "2026-07-25T00:00:00.000Z",
};

test("Homepage mapper uses only the safe nullable People destination", () => {
  const story = {
    ...common,
    schemaVersion: "homepage-handover-story.v2",
    imageUrl: "https://media.mbmc.vn/handover-public/a.webp",
    peopleHref: null,
    occurredAt: null,
  };
  assert.equal(mapHomepageStoryToCard(story).href, null);
  assert.notEqual(mapHomepageStoryToCard(story).href, `/people/${story.slug}`);
  assert.equal(
    mapHomepageStoryToCard({
      ...story,
      peopleHref: "/people/story-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    }).href,
    "/people/story-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  );
});

test("People mapper links every eligible summary to its canonical detail route", () => {
  assert.equal(
    mapPeopleStoryToCard({
      ...common,
      schemaVersion: "people-handover-story.v1",
      occurredAt: "2026-07-25T00:00:00.000Z",
      coverImage: "https://media.mbmc.vn/handover-public/a.webp",
    }).href,
    "/people/story-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  );
});
