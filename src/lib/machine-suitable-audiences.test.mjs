import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { presentSuitableAudiences } from "../app/(sales)/may/[slug]/_components/machine-suitable-audiences-presentation.ts";

const expected = [
  [
    "general",
    "Phổ thông",
    "Làm văn phòng, Office, học tập cơ bản, lướt web, xem YouTube, Zalo và các tác vụ hằng ngày.",
  ],
  [
    "developer",
    "Lập trình",
    "IDE, trình duyệt nhiều tab, terminal, local development và các workflow lập trình phổ biến.",
  ],
  [
    "creative",
    "Sáng tạo",
    "Canva, CapCut, chỉnh ảnh/video và các project sáng tạo ở mức vừa phải; workload nặng hơn có thể cần cấu hình cao hơn.",
  ],
  [
    "heavy",
    "Tác vụ nặng",
    "Các workload kéo dài hoặc dùng nhiều tài nguyên, như dựng video nặng, project lớn và đa nhiệm nặng.",
  ],
  [
    "storage_heavy",
    "Lưu trữ nhiều",
    "Thường xuyên giữ nhiều file, media hoặc project trực tiếp trên máy và cần nhiều dung lượng lưu trữ cục bộ.",
  ],
];

test("all five canonical audiences map to approved labels and descriptions", () => {
  assert.deepEqual(
    presentSuitableAudiences(expected.map(([code]) => code)),
    expected.map(([code, label, description]) => ({
      code,
      label,
      description,
    })),
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
