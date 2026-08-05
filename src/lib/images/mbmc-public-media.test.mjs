import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isMbmcPublicMediaUrl } from "./mbmc-public-media.ts";

test("only the exact HTTPS MBMC public media hostname bypasses optimization", () => {
  assert.equal(isMbmcPublicMediaUrl("https://media.mbmc.vn/handover-public/a.webp"), true);
  assert.equal(isMbmcPublicMediaUrl("https://example.com/a.webp"), false);
  assert.equal(isMbmcPublicMediaUrl("https://media.mbmc.vn.evil.test/a.webp"), false);
  assert.equal(isMbmcPublicMediaUrl("https://cdn.media.mbmc.vn/a.webp"), false);
  assert.equal(isMbmcPublicMediaUrl("http://media.mbmc.vn/a.webp"), false);
  assert.equal(isMbmcPublicMediaUrl("not a URL"), false);
});

test("shared public handover boundary delivers exact-host images directly and handles failure", () => {
  const component = readFileSync(
    new URL("../../components/handover/PublicHandoverImage.tsx", import.meta.url),
    "utf8",
  );

  assert.match(component, /unoptimized=\{isMbmcPublicMediaUrl\(src\)\}/);
  assert.match(component, /onError=\{\(\) => setFailedSrc\(src\)\}/);
  assert.match(component, /failedSrc === src/);
  assert.doesNotMatch(component, /img\.mbmc\.vn/);
});

test("all public Care and handover image surfaces use the shared boundary", () => {
  const files = [
    "../../components/handover/CareStoryBlock.tsx",
    "../../components/handover/HandoverStoryCard.tsx",
    "../../app/(sales)/people/[slug]/page.tsx",
  ];

  for (const file of files) {
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(source, /PublicHandoverImage/);
    assert.doesNotMatch(source, /from "next\/image"/);
  }
});
