import "../../data/support/test-register.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isMbmcPublicImage,
  isSafeImageSource,
  resolvePublicMachineImage,
} from "./mbmc-public-image.ts";

const variant = (name) => ({
  url: `https://img.mbmc.vn/machines/id/${name}.webp`,
  width: name === "thumb" ? 320 : name === "card" ? 640 : name === "display" ? 1280 : 2048,
  height: name === "thumb" ? 320 : name === "card" ? 640 : name === "display" ? 1280 : 2048,
  byteSize: 100,
  mimeType: "image/webp",
});
const publicImage = (variants = {}) => ({
  url: "https://img.mbmc.vn/machines/legacy.jpg",
  alt: "Machine",
  width: null,
  height: null,
  variants,
});

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

test("resolver selects every requested variant and its dimensions", () => {
  const image = publicImage({ thumb: variant("thumb"), card: variant("card"), display: variant("display"), full: variant("full") });
  for (const name of ["thumb", "card", "display", "full"]) {
    assert.deepEqual(resolvePublicMachineImage(image, name), {
      url: variant(name).url,
      width: variant(name).width,
      height: variant(name).height,
    });
  }
});

test("resolver follows every ordered fallback chain", () => {
  const cases = [
    ["thumb", { card: variant("card"), display: variant("display") }, "card"],
    ["card", { display: variant("display"), thumb: variant("thumb") }, "display"],
    ["display", { full: variant("full"), card: variant("card") }, "full"],
    ["full", { display: variant("display"), card: variant("card") }, "display"],
  ];
  for (const [requested, variants, selected] of cases) {
    assert.equal(resolvePublicMachineImage(publicImage(variants), requested)?.url, variant(selected).url);
  }
});

test("legacy and unsafe compatibility URLs resolve safely", () => {
  for (const requested of ["thumb", "card", "display", "full"]) {
    assert.equal(resolvePublicMachineImage(publicImage(), requested)?.url, publicImage().url);
  }
  assert.equal(resolvePublicMachineImage({ ...publicImage(), url: "https://img.mbmc.vn.evil.test/a.jpg" }, "card"), null);
  assert.equal(resolvePublicMachineImage({ ...publicImage(), url: "http://img.mbmc.vn/a.jpg" }, "card"), null);
});

test("machine surfaces request their semantic variants with preserved loading policy", () => {
  const card = readFileSync(new URL("../../app/(sales)/may-dang-co/_components/MachineCard.tsx", import.meta.url), "utf8");
  const gallery = readFileSync(new URL("../../app/(sales)/may/[slug]/_components/PublicMachineGallery.tsx", import.meta.url), "utf8");
  const track = readFileSync(new URL("../../app/(sales)/may/[slug]/_components/SlidingImageTrack.tsx", import.meta.url), "utf8");
  assert.match(card, /image=\{machine\.coverImage\} variant="card"/);
  assert.match(gallery, /image=\{image\} variant="thumb"/);
  assert.match(gallery, /sizes="88px"/);
  assert.match(track, /image=\{image\} variant="display"/);
  assert.match(track, /image=\{image\} variant="full"/);
  assert.match(track, /priority=\{variant === "gallery" && imageIndex === 0\}/);
  assert.match(track, /priority=\{false\}/);
});
