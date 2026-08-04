import "../../data/support/test-register.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isMbmcPublicImage, isSafeImageSource } from "./mbmc-public-image.ts";

test("recognizes only the normalized MBMC public image hostname", () => {
  assert.equal(isMbmcPublicImage("https://img.mbmc.vn/machines/a.webp"), true);
  assert.equal(isMbmcPublicImage("https://IMG.MBMC.VN/machines/a.webp"), true);
  assert.equal(isMbmcPublicImage("https://img.mbmc.vn.evil.test/a.webp"), false);
  assert.equal(isMbmcPublicImage("https://media.mbmc.vn/a.webp"), false);
});

test("rejects missing and malformed image URLs without guessing", () => {
  for (const value of [undefined, null, "", "not a url", "/machines/a.webp"]) assert.equal(isMbmcPublicImage(value), false);
});

test("safe source validation supports local, web, and client preview images", () => {
  assert.equal(isSafeImageSource("/images/fallback.webp"), true);
  assert.equal(isSafeImageSource("https://img.mbmc.vn/machines/a.webp"), true);
  assert.equal(isSafeImageSource("blob:https://mbmc.vn/id"), true);
  assert.equal(isSafeImageSource("javascript:alert(1)"), false);
  assert.equal(isSafeImageSource("broken"), false);
});

test("shared MachineImage bypasses optimization only for the MBMC host and provides failure UI", () => {
  const component = readFileSync(new URL("../../components/machine/MachineImage.tsx", import.meta.url), "utf8");
  assert.match(component, /unoptimized=\{isMbmcPublicImage\(src\)\}/);
  assert.match(component, /onError=\{\(\) => setFailedSrc\(src\)\}/);
  assert.match(component, /machine-image-fallback/);
});

test("machine hero and thumbnails use the shared boundary with preserved loading policy", () => {
  const gallery = readFileSync(new URL("../../app/(sales)/may/[slug]/_components/PublicMachineGallery.tsx", import.meta.url), "utf8");
  const track = readFileSync(new URL("../../app/(sales)/may/[slug]/_components/SlidingImageTrack.tsx", import.meta.url), "utf8");
  assert.match(gallery, /MachineImage as Image/);
  assert.match(gallery, /sizes="88px"/);
  assert.match(track, /MachineImage as Image/);
  assert.match(track, /priority=\{variant === "gallery" && imageIndex === 0\}/);
  assert.match(track, /priority=\{false\}/);
});
