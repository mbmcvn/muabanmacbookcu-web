import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { presentSuitableAudiences } from "../app/(sales)/may/[slug]/_components/machine-suitable-audiences-presentation.ts";

const expected = [
  ["general", "Phổ thông – Văn phòng", 3],
  ["developer", "Lập trình – Developer", 3],
  ["creative", "Sáng tạo – Nội dung", 3],
  ["heavy", "Tác vụ nặng", 3],
  ["storage_heavy", "Lưu trữ nhiều", 3],
];

test("all five canonical audiences have complete card presentation metadata", () => {
  const cards = presentSuitableAudiences(expected.map(([code]) => code));
  assert.equal(cards.length, 5);
  assert.deepEqual(
    cards.map(({ code, title, checklist }) => [code, title, checklist.length]),
    expected,
  );
  for (const card of cards) {
    assert.ok(card.intro.length > 0);
    assert.ok(card.footer.length > 0);
    assert.match(card.imageSrc, /^\/images\/suitability\/.+\.png$/);
    assert.ok(card.imageAlt.length > 0);
  }
  assert.equal(new Set(cards.map(({ imageSrc }) => imageSrc)).size, 5);
});

test("suitability cards render their mapped illustration through Next Image", () => {
  const component = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/MachineSuitableAudiences.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(component, /import Image from "next\/image"/);
  assert.match(component, /src=\{audience\.imageSrc\}/);
  assert.match(component, /alt=\{audience\.imageAlt\}/);
  const imageMarkup = component.match(/<Image[\s\S]*?\/>/)?.[0] ?? "";
  assert.doesNotMatch(imageMarkup, /\sfill(?:=|\s)/);
  assert.doesNotMatch(
    component,
    /SuitableAudienceIcon|suitable-audience-card__icon/,
  );
});

test("one, three, and five audiences render once in supplied order", () => {
  for (const codes of [
    ["creative"],
    ["general", "creative", "storage_heavy"],
    expected.map(([code]) => code),
  ]) {
    assert.deepEqual(
      presentSuitableAudiences(codes).map(({ code }) => code),
      codes,
    );
  }
});

test("absent and empty suitable audiences produce no presentation", () => {
  assert.deepEqual(presentSuitableAudiences(undefined), []);
  assert.deepEqual(presentSuitableAudiences([]), []);
  const component = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/MachineSuitableAudiences.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(component, /if \(presentation\.length === 0\) return null/);
});

test("audience presentation has no hardware, legacy prose, or explanation input", () => {
  const source = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/MachineSuitableAudiences.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const presenter = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/machine-suitable-audiences-presentation.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /Phù hợp với nhu cầu nào\?/);
  assert.doesNotMatch(
    source + presenter,
    /ramGb|ssdGb|suitableFor|notSuitableFor|machineExplanation|Không phù hợp/,
  );
});

test("every rendered audience uses the same neutral fit badge", () => {
  const component = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/MachineSuitableAudiences.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    component,
    /presentation\.map[\s\S]*?suitable-audience-card__badge">Phù hợp<\/span>/,
  );
  assert.doesNotMatch(component, /Rất phù hợp/);
});

test("suitability section keeps its heading, supporting copy, and shared responsive DOM", () => {
  const component = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/MachineSuitableAudiences.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(component, /Phù hợp với nhu cầu nào\?/);
  assert.match(component, /Dựa trên cấu hình của máy và các tác vụ phổ biến/);
  assert.equal((component.match(/suitable-audience-grid/g) ?? []).length, 1);
});

test("suitability grid follows the existing one, two, and three column breakpoints", () => {
  const css = readFileSync(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  assert.match(
    css,
    /\.suitable-audience-grid \{[^}]*grid-template-columns: minmax\(0, 1fr\)/,
  );
  assert.match(
    css,
    /@media \(min-width: 40rem\) \{[\s\S]*?\.suitable-audience-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
  );
  assert.match(
    css,
    /@media \(min-width: 56rem\) \{[\s\S]*?\.suitable-audience-grid \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/,
  );
  assert.doesNotMatch(css, /\.suitable-audience-card__visual \{[^}]*(?:height|min-height|overflow):/);
  assert.match(css, /\.suitable-audience-card__visual img \{[^}]*width: 100%[^}]*height: auto/);
  assert.match(css, /\.suitable-audience-card__visual img \{[^}]*object-fit: contain/);
  assert.doesNotMatch(css, /\.suitable-audience-card__visual img \{[^}]*object-fit: cover/);
  assert.doesNotMatch(css, /\.suitable-audience-card \{[^}]*overflow: hidden/);
  assert.doesNotMatch(css, /@media[^{]*\{[\s\S]*?\.suitable-audience-card__visual \{[^}]*height:/);
});

test("conditional dossier navigation keeps the existing suitability anchor", () => {
  const view = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/PublicMachineDetailView.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const dossier = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/DecisionDossier.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    view,
    /hasSuitableAudiences \? \([\s\S]*?href="#danh-gia-phu-hop"/,
  );
  assert.match(dossier, /id="danh-gia-phu-hop"/);
});

test("visible Decision Dossier omits legacy prose and detailed explanation", () => {
  const dossier = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/DecisionDossier.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(dossier, /<MachineSuitableAudiences/);
  assert.doesNotMatch(
    dossier,
    /PublicMachineFitRecommendation|MachineExplanation|ExpertSummary|suitableFor|notSuitableFor|expertSummary/,
  );
  assert.ok(
    dossier.indexOf("<DecisionSummary") <
      dossier.indexOf("<MachineSuitableAudiences"),
  );
  assert.ok(
    dossier.indexOf("<MachineSuitableAudiences") <
      dossier.indexOf("<MachineVerification"),
  );
});
test("active detail presentation has no legacy recommendation predicate", () => {
  const presentation = readFileSync(
    new URL(
      "../app/(sales)/may/[slug]/_components/decision-dossier-presentation.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.doesNotMatch(presentation, /suitableFor|notSuitableFor/);
});
test("RAM, SSD, legacy prose, and Machine Explanation cannot change the audience list", () => {
  const baseline = {
    suitableAudiences: ["general", "developer"],
    ramGb: 8,
    ssdGb: 256,
    suitableFor: ["legacy suitable"],
    notSuitableFor: ["legacy unsuitable"],
    machineExplanation: { blocks: [{ text: "legacy block" }] },
  };
  const changed = {
    ...baseline,
    ramGb: 64,
    ssdGb: 4096,
    suitableFor: ["changed"],
    notSuitableFor: [],
    machineExplanation: { blocks: [{ text: "changed block" }] },
  };
  assert.deepEqual(
    presentSuitableAudiences(changed.suitableAudiences),
    presentSuitableAudiences(baseline.suitableAudiences),
  );
});
