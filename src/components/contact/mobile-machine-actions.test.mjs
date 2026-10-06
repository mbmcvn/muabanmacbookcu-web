import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const card=readFileSync("src/app/(sales)/may-dang-co/_components/MachineCard.tsx","utf8");
const copy=readFileSync("src/components/contact/CopyMachineLink.tsx","utf8");
const css=readFileSync("src/app/globals.css","utf8");
test("mobile machine copy is outside the navigation anchor and follows ID/CTA in the footer",()=>{
 assert.ok(card.indexOf('className="machine-code"') < card.indexOf('className="machine-card-cta"'));
 assert.match(card, /<\/Link>\s*<CopyMachineLink slug={machine.slug} machineId={machineId} compact/);
 assert.match(copy, /copyMachineShareUrl\(\s*canonicalMachineUrl\(slug\),\s*referralCode,/);
 assert.match(copy, /shareReferralCode: referralCode/);
 assert.doesNotMatch(copy, /router\.|window.location|href=/);
 assert.match(copy, /type="button"/);
 assert.match(copy, /Sao chép liên kết máy/);
 assert.match(copy, /compact \? 1200 : 2200/);
 assert.match(copy, /feedback === "copied" \? <path/);
 assert.match(copy, /aria-live="polite"/);
});
test("mobile copy target is rightmost and isolated from desktop layout",()=>{
 assert.match(css, /\.machine-card-copy \{ display: none; \}/);
 assert.match(css, /@media \(max-width: 39\.99rem\) \{\s*\.machine-card-footer \{ min-height: 44px; padding-right: 48px;/);
 assert.match(css, /\.machine-card-copy \{ position: absolute; right: \.85rem; bottom: \.85rem;[^}]*width: 44px; height: 44px;/);
 assert.match(css, /\.machine-code \{[^}]*min-width: 0;[^}]*overflow-wrap: anywhere;/);
});
test("mobile captions hide visually while gallery labels, selection and ordering remain",()=>{
 assert.match(css, /@media \(max-width: 39\.99rem\) \{[^]*?\.public-detail-page \.detail-thumbnails button > span \{ display: none;/);
 const gallery=readFileSync("src/app/(sales)/may/[slug]/_components/PublicMachineGallery.tsx","utf8");
 assert.match(gallery, /images.map\(\(image, imageIndex\)/);
 assert.match(gallery, /aria-label={`Xem ảnh/);
 assert.match(gallery, /aria-pressed={imageIndex === index}/);
 assert.match(gallery, /onClick={\(\) => select\(imageIndex\)}/);
 assert.match(gallery, /<span>{image.alt}<\/span>/);
});
