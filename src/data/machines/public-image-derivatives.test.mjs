import "../support/test-register.mjs";
import assert from "node:assert/strict";
import test from "node:test";
import {
  parsePublicImageDerivatives,
  publicDetailBySlug,
} from "./project-public-candidates.ts";

const derivative = (name, overrides = {}) => ({
  url: `https://img.mbmc.vn/machines/machine/image/version/${name}.webp`,
  width: 640,
  height: 640,
  byte_size: 1234,
  mime_type: "image/webp",
  ...overrides,
});

function candidate(imageOverrides = {}) {
  const revision = 1;
  return {
    machine_id: "MBMC-IMAGE",
    status: "new_in_stock",
    deleted_at: null,
    model_text: "MacBook Air M2",
    chip: "M2",
    ram_gb: 8,
    ssd_gb: 256,
    color: "Midnight",
    retail_price_expected: 15000000,
    rank: "A",
    sales: [],
    machine_publications: { status: "published", slug: "mbmc-image", revision: 1, approved_by: "staff", approved_at: "2026-01-01T00:00:00Z", approved_editorial_revision: revision, published_by: "staff", published_at: "2026-01-01T00:00:00Z", published_editorial_revision: revision },
    machine_editorials: { revision, public_condition_summary: "Tốt", included_items: {}, reviewed_by: "staff", reviewed_at: "2026-01-01T00:00:00Z" },
    machine_images: [{ id: "image-id", public_url: "https://img.mbmc.vn/machines/legacy.jpg", image_type: "cover", image_stage: "listing", visibility: "public", sort_order: 0, is_cover: true, ...imageOverrides }],
  };
}

test("parser exposes only valid fixed derivatives", () => {
  const parsed = parsePublicImageDerivatives({
    thumb: derivative("thumb", { width: 320, height: 320 }),
    card: derivative("card"),
    display: derivative("display", { width: 1280, height: 1280, byte_size: undefined, mime_type: undefined }),
    original: derivative("original"),
  });
  assert.deepEqual(Object.keys(parsed), ["thumb", "card", "display"]);
  assert.equal(parsed.thumb.width, 320);
  assert.equal(parsed.display.byteSize, null);
  assert.equal(parsed.display.mimeType, null);
});

test("parser ignores unsafe URLs, invalid dimensions, and invalid optional metadata", () => {
  for (const overrides of [
    { url: "http://img.mbmc.vn/a.webp" },
    { url: "https://example.com/a.webp" },
    { url: "https://img.mbmc.vn.evil.test/a.webp" },
    { width: 0 },
    { height: -1 },
    { byte_size: 0 },
    { mime_type: "image/jpeg" },
  ]) assert.deepEqual(parsePublicImageDerivatives({ thumb: derivative("thumb", overrides) }), {});
  assert.deepEqual(parsePublicImageDerivatives(null), {});
});

test("one malformed variant does not remove valid siblings", () => {
  const parsed = parsePublicImageDerivatives({ thumb: derivative("thumb", { width: 0 }), card: derivative("card") });
  assert.deepEqual(Object.keys(parsed), ["card"]);
});

test("ready projection exposes sanitized variants without processing internals", () => {
  const row = candidate({
    processing_status: "ready",
    derivatives: { card: derivative("card"), source: { object_key: "private/source.jpg" } },
    object_key: "private/source.jpg",
    processing_error: "secret",
  });
  const detail = publicDetailBySlug([row], "mbmc-image");
  assert.equal(detail.gallery[0].variants.card.url, derivative("card").url);
  const serialized = JSON.stringify(detail);
  for (const forbidden of ["processing_status", "object_key", "processing_error", "private/source.jpg", `"source":`]) assert.equal(serialized.includes(forbidden), false);
});

test("legacy projection retains URL and omits variants", () => {
  const detail = publicDetailBySlug([candidate({ processing_status: "legacy", derivatives: null })], "mbmc-image");
  assert.equal(detail.gallery[0].url, "https://img.mbmc.vn/machines/legacy.jpg");
  assert.equal("variants" in detail.gallery[0], false);
});
