import assert from "node:assert/strict";
import test from "node:test";
import { buildZaloSummary, recommendMacBook } from "./recommendation-engine.ts";
import { getRecommendationTitle, getResultCtaCopy, getUpgradeOptionTitle } from "./result-cta.ts";
import { resultIllustration } from "./_lib/quiz-illustrations.ts";
import { designBranch, videoBranch } from "./quiz-branches.ts";

const base = {
  payment: "full", budget: "16-22", uses: ["office"],
  portability: "frequent", screen: "compact", fulfilment: "showroom",
};
const balancedCompact = { ...base, portability: "stationary", screen: "compact" };

test("design and video branches no longer expose unknown", () => {
  assert.equal(designBranch.choices.some((choice) => choice.value === "unknown"), false);
  assert.equal(videoBranch.choices.some((choice) => choice.value === "unknown"), false);
});

test("compact Air maps to MacBook Air 13 inch", () => {
  const result = recommendMacBook(base);
  assert.equal(result.bestFit.label, "MacBook Air 13 inch");
});

test("no storage signal recommends only 256GB", () => {
  const result = recommendMacBook({ ...base, uses: ["development"] });
  assert.equal(result.preferredStorage, "256GB");
  assert.equal(result.storageGuidance, "256GB là đủ");
});

test("no storage signal never mentions 512GB in primary output", () => {
  const result = recommendMacBook(base);
  const primaryOutput = [result.explanation, result.bestFit.configuration, result.bestFit.note, ...result.reasons, buildZaloSummary(base, result)].join(" ");
  assert.equal(primaryOutput.includes("512GB"), false);
});

test("short social video allows 8GB Air and defaults to 256GB", () => {
  const answers = { ...base, uses: ["video"], videoWorkload: "short_social" };
  const result = recommendMacBook(answers);
  assert.equal(result.minimumRam, 8);
  assert.equal(result.family, "MacBook Air");
  assert.equal(result.preferredStorage, "256GB");
});

test("long video requires 16GB but not Pro without sustained load", () => {
  const result = recommendMacBook({ ...base, uses: ["video"], videoWorkload: "long_high_quality" });
  assert.equal(result.minimumRam, 16);
  assert.equal(result.preferredStorage, "512GB");
  assert.equal(result.family, "MacBook Air");
});

test("development heavy recommends at least 16GB and the Pro family", () => {
  const result = recommendMacBook({ ...base, uses: ["development"], developmentWorkload: "development_heavy" });
  assert.equal(result.family, "MacBook Pro");
  assert.equal(result.minimumRam, 16);
});

test("lightweight image design does not independently require 16GB", () => {
  const result = recommendMacBook({ ...base, uses: ["design"], designWorkload: "light" });
  assert.equal(result.minimumRam, 8);
  assert.equal(result.preferredStorage, "256GB");
});

test("professional image design requires 16GB and creates moderate storage guidance", () => {
  const result = recommendMacBook({ ...base, uses: ["design"], designWorkload: "professional" });
  assert.equal(result.minimumRam, 16);
  assert.equal(result.storageGuidance, "512GB đáng cân nhắc");
  assert.equal(result.family, "MacBook Air");
});

test("personal use alone does not trigger 16GB, 512GB or Pro", () => {
  const result = recommendMacBook({ ...base, uses: ["personal"] });
  assert.equal(result.minimumRam, 8);
  assert.equal(result.preferredStorage, "256GB");
  assert.equal(result.family, "MacBook Air");
});

test("a heavy branch overrides a lightweight baseline without contradictory copy", () => {
  const answers = { ...base, uses: ["personal", "development"], developmentWorkload: "development_heavy" };
  const result = recommendMacBook(answers);
  const customerCopy = [result.explanation, ...result.reasons, result.bestFit.note, result.cheaper?.note, result.upgrade.note].join(" ");
  assert.equal(result.minimumRam, 16);
  assert.equal(customerCopy.includes("8GB RAM đã đủ"), false);
  assert.match(customerCopy, /16GB RAM/);
});

test("basic office use may return air_or_pro", () => {
  assert.equal(recommendMacBook(balancedCompact).productFamilyFit, "air_or_pro");
});

test("Canva and Figma use may return air_or_pro", () => {
  const result = recommendMacBook({ ...balancedCompact, uses: ["design"], designWorkload: "light" });
  assert.equal(result.productFamilyFit, "air_or_pro");
  assert.equal(result.minimumRam, 8);
});

test("CapCut, TikTok and Reel use may return air_or_pro", () => {
  const result = recommendMacBook({ ...balancedCompact, uses: ["video"], videoWorkload: "short_social" });
  assert.equal(result.productFamilyFit, "air_or_pro");
});

test("basic development may return air_or_pro with 8GB RAM", () => {
  const result = recommendMacBook({ ...balancedCompact, uses: ["development"], developmentWorkload: "development_basic" });
  assert.equal(result.minimumRam, 8);
  assert.equal(result.productFamilyFit, "air_or_pro");
});

test("development heavy branch is not counted twice toward RAM", () => {
  const result = recommendMacBook({
    ...balancedCompact,
    uses: ["development"],
    developmentWorkload: "development_heavy",
  });
  assert.equal(result.minimumRam, 16);
  assert.equal(result.reasons.filter((reason) => reason.includes("16GB RAM")).length, 1);
  assert.equal(result.requiresSustainedPerformance, true);
});

test("development and specialized basic keep 8GB valid", () => {
  assert.equal(recommendMacBook({ ...balancedCompact, uses: ["development"], developmentWorkload: "development_basic" }).minimumRam, 8);
  assert.equal(recommendMacBook({ ...balancedCompact, uses: ["specialized"], specializedWorkload: "specialized_basic" }).minimumRam, 8);
});

test("specialized heavy requires at least 16GB", () => {
  const result = recommendMacBook({ ...balancedCompact, uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.equal(result.minimumRam, 16);
  assert.equal(result.needsVerification, true);
});

test("strong portability prefers Air", () => {
  assert.equal(recommendMacBook(base).productFamilyFit, "air_preferred");
});

test("sustained-heavy rendering prefers Pro", () => {
  const result = recommendMacBook({ ...balancedCompact, uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.equal(result.productFamilyFit, "pro_preferred");
  assert.equal(result.requiresSustainedPerformance, true);
  assert.equal(result.model, "pro-13");
  assert.equal(result.size, "13 inch");
});

test("sustained-heavy plus compact preference recommends Pro 13", () => {
  const result = recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.equal(result.bestFit.label, "MacBook Pro 13 inch");
  assert.equal(result.minimumRam, 16);
  assert.equal(result.preferredStorage, "256GB");
  assert.equal(getRecommendationTitle(result), "MacBook Pro 13 inch");
});

test("sustained-heavy alone does not automatically recommend Pro 14", () => {
  const result = recommendMacBook({ ...balancedCompact, uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.notEqual(result.model, "pro-14");
});

test("sustained-heavy plus large-screen preference recommends Pro 14, not Pro 16", () => {
  const result = recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy", portability: "stationary", screen: "large" });
  assert.equal(result.model, "pro-14");
  assert.equal(result.bestFit.label, "MacBook Pro 14 inch");
  assert.notEqual(result.model, "pro-16");
});

test("Pro 14 is the meaningful upgrade from a compact-heavy Pro 13 result", () => {
  const result = recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.equal(result.upgrade.label, "MacBook Pro 14 inch");
  assert.match(result.upgrade.note, /màn hình và dư địa hiệu năng lớn hơn/);
});

test("cheaper Pro 13 preserves the resolved minimum RAM", () => {
  const result = recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.match(result.cheaper?.label ?? "", /MacBook Pro 13 inch/);
  assert.match(result.cheaper?.configuration ?? "", /16GB RAM/);
});

test("Pro 13 Zalo copy is natural and exposes the resolved compact-heavy rationale", () => {
  const answers = { ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy" };
  const summary = buildZaloSummary(answers, recommendMacBook(answers));
  assert.match(summary, /Nhóm phù hợp: MacBook Pro 13 inch/);
  assert.match(summary, /Cấu hình tối thiểu: 16GB RAM, 256GB SSD/);
  assert.match(summary, /cần giữ tải lâu nhưng vẫn ưu tiên máy nhỏ gọn/);
});

test("occasional 4K alone does not prefer Pro", () => {
  const result = recommendMacBook({ ...balancedCompact, uses: ["video"], videoWorkload: "long_high_quality" });
  assert.equal(result.minimumRam, 16);
  assert.equal(result.productFamilyFit, "air_or_pro");
});

test("air_or_pro result uses a neutral title and equal technical minima", () => {
  const result = recommendMacBook(balancedCompact);
  assert.equal(getRecommendationTitle(result), "MacBook 13 inch");
  assert.notEqual(getRecommendationTitle(result), "MacBook Air 13 inch");
  assert.match(result.bestFit.configuration, /8GB RAM · 256GB SSD/);
  assert.equal(result.cheaper?.configuration, result.bestFit.configuration);
});

test("cheaper option never violates minimum RAM", () => {
  const result = recommendMacBook({ ...base, uses: ["video"], videoWorkload: "long_high_quality" });
  assert.match(result.cheaper?.configuration ?? "", /16GB RAM/);
});

test("upgrade option differs meaningfully from best fit", () => {
  const result = recommendMacBook(base);
  assert.notEqual(result.upgrade.label, result.bestFit.label);
  assert.notEqual(result.upgrade.note, result.bestFit.note);
  assert.equal(getUpgradeOptionTitle(result), "NẾU MUỐN MÀN HÌNH RỘNG");
});

test("budget conflict preserves minimum RAM", () => {
  const result = recommendMacBook({ ...base, budget: "under-12", uses: ["development"], developmentWorkload: "development_heavy" });
  assert.equal(result.budgetConflict, true);
  assert.equal(result.minimumRam, 16);
  assert.match(result.bestFit.configuration, /16GB RAM/);
  assert.match(result.cheaper?.configuration ?? "", /16GB RAM/);
});

test("budget conflict uses conflict-specific CTA copy", () => {
  const result = recommendMacBook({ ...base, budget: "under-12", uses: ["development"], developmentWorkload: "development_heavy" });
  assert.deepEqual(getResultCtaCopy(result), {
    primary: "Xem máy gần nhu cầu nhất",
    secondary: "Nhờ MBMC cân lại cấu hình",
    primaryDestination: "inventory",
  });
});

test("software verification uses outcome-oriented primary CTA", () => {
  const result = recommendMacBook({
    ...base,
    uses: ["specialized"],
    specializedWorkload: "specialized_basic",
    specializedSoftware: "Revit",
  });
  assert.equal(getResultCtaCopy(result).primary, "Nhờ MBMC kiểm tra trước");
});

test("internal enum values never appear in customer-facing summary", () => {
  const answers = { ...base, uses: ["video", "personal"], videoWorkload: "short_social" };
  const summary = buildZaloSummary(answers, recommendMacBook(answers));
  for (const internal of ["short_social", "long_high_quality", "development", "personal", "air_or_pro", "air_preferred", "pro_preferred", ": no"]) {
    assert.equal(summary.includes(internal), false, summary);
  }
  assert.match(summary, /Nội dung ngắn bằng Canva/);
});

test("software name creates verification without changing the technical recommendation", () => {
  const withoutSoftware = recommendMacBook({
    ...balancedCompact,
    uses: ["specialized"],
    specializedWorkload: "specialized_basic",
  });
  const answers = {
    ...balancedCompact,
    uses: ["specialized"],
    specializedWorkload: "specialized_basic",
    specializedSoftware: "AutoCAD",
  };
  const withSoftware = recommendMacBook(answers);
  assert.equal(withSoftware.needsVerification, true);
  assert.equal(withSoftware.family, withoutSoftware.family);
  assert.equal(withSoftware.minimumRam, 8);
  assert.equal(withSoftware.preferredStorage, "256GB");
  assert.match(buildZaloSummary(answers, withSoftware), /Phần mềm cần kiểm tra: AutoCAD/);
});

test("legacy Windows answers no longer change recommendation status", () => {
  const clean = recommendMacBook(balancedCompact);
  const legacy = recommendMacBook({ ...balancedCompact, windows: "yes", windowsSoftware: "Legacy app" });
  assert.equal(legacy.needsVerification, clean.needsVerification);
  assert.equal(legacy.family, clean.family);
  assert.equal(legacy.minimumRam, clean.minimumRam);
});

test("new branch enum values never appear in customer-facing summaries", () => {
  const answers = { ...base, uses: ["development"], developmentWorkload: "development_heavy" };
  const summary = buildZaloSummary(answers, recommendMacBook(answers));
  assert.equal(summary.includes("development_heavy"), false);
  assert.match(summary, /Docker, máy ảo hoặc nhiều service cùng lúc/);
});

test("air_or_pro Zalo summary uses natural Vietnamese", () => {
  const result = recommendMacBook(balancedCompact);
  const summary = buildZaloSummary(balancedCompact, result);
  assert.match(summary, /Nhóm phù hợp: MacBook 13 inch/);
  assert.match(summary, /Dòng máy: Air hoặc Pro đều phù hợp/);
  assert.equal(summary.includes("air_or_pro"), false);
});

test("every decisive result category maps to its matching WebP", () => {
  assert.equal(resultIllustration({ family: "MacBook Air", size: "13 inch" }), "/images/chon-macbook/result-states/air-13.webp");
  assert.equal(resultIllustration({ family: "MacBook Air", size: "15 inch" }), "/images/chon-macbook/result-states/air-15.webp");
  assert.equal(resultIllustration({ family: "MacBook Pro", size: "13 inch" }), "/images/chon-macbook/result-states/pro-14.webp");
  assert.equal(resultIllustration({ family: "MacBook Pro", size: "14 inch" }), "/images/chon-macbook/result-states/pro-14.webp");
  assert.equal(resultIllustration({ family: "MacBook Pro", size: "16 inch" }), "/images/chon-macbook/result-states/pro-16.webp");
});

test("customer-facing configuration copy always uses uppercase GB", () => {
  const result = recommendMacBook({ ...base, uses: ["video"], videoWorkload: "long_high_quality" });
  const copy = JSON.stringify(result);
  assert.equal(/\d+gb\b/.test(copy), false);
  assert.match(copy, /16GB RAM/);
  assert.match(copy, /512GB SSD/);
});
