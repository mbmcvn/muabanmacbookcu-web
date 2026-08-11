import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildZaloSummary, normalizeRecommendationSignals, recommendMacBook, resolveRecommendationProfile } from "./recommendation-engine.ts";

const base = {
  payment: "full", budget: "16-22", uses: ["office"],
  portability: "frequent", screen: "compact", fulfilment: "showroom",
};

function profile(overrides = {}) {
  return recommendMacBook({ ...base, ...overrides }).profile;
}

test("office resolves to 8/256 with Air and Pro valid", () => {
  const result = profile();
  assert.equal(result.technical.minimumRamGb, 8);
  assert.equal(result.technical.defaultStorageGb, 256);
  assert.equal(result.technical.minimumStorageGb, undefined);
  assert.deepEqual(result.family.allowed, ["air", "pro"]);
  assert.equal(result.family.preferred, undefined);
  assert.equal(result.confidence.overall, "high");
});

test("personal resolves to the high-confidence light baseline", () => {
  const result = profile({ uses: ["personal"] });
  assert.equal(result.technical.minimumRamGb, 8);
  assert.equal(result.confidence.overall, "high");
  assert.equal(result.family.preferred, undefined);
});

test("unclear usage avoids false precision", () => {
  const result = profile({ uses: ["unclear"] });
  assert.equal(result.technical.minimumRamGb, 8);
  assert.equal(result.confidence.overall, "low");
  assert.equal(result.family.preferred, undefined);
});

test("light design remains 8/256", () => {
  const result = profile({ uses: ["design"], designWorkload: "light" });
  assert.equal(result.technical.minimumRamGb, 8);
  assert.equal(result.technical.minimumStorageGb, undefined);
});

test("ordinary Photoshop remains 8/256", () => {
  assert.equal(profile({ uses: ["design"], designWorkload: "photoshop_standard" }).technical.minimumRamGb, 8);
});

test("heavy Photoshop resolves to 16/256 without inferring Pro", () => {
  const result = profile({ uses: ["design"], designWorkload: "professional" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.technical.minimumStorageGb, undefined);
  assert.equal(result.technical.sustainedPerformance, false);
  assert.equal(result.family.preferred, undefined);
});

test("sustained heavy Photoshop prefers Pro but retains both allowed families", () => {
  const result = profile({ uses: ["design"], designWorkload: "professional_sustained" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.technical.sustainedPerformance, true);
  assert.equal(result.family.preferred, "pro");
  assert.deepEqual(result.family.allowed, ["air", "pro"]);
});

test("monthly 4K remains 8/256", () => {
  const result = profile({ uses: ["video"], videoWorkload: "long_rare" });
  assert.equal(result.technical.minimumRamGb, 8);
  assert.equal(result.technical.minimumStorageGb, undefined);
});

test("weekly 4K raises RAM to 16 without preferring Pro", () => {
  const result = profile({ uses: ["video"], videoWorkload: "long_regular" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.family.preferred, undefined);
});

test("daily sustained video raises RAM and prefers Pro", () => {
  const result = profile({ uses: ["video"], videoWorkload: "sustained_daily" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.technical.sustainedPerformance, true);
  assert.equal(result.family.preferred, "pro");
});

test("basic development remains 8/256 with medium confidence", () => {
  const result = profile({ uses: ["development"], developmentWorkload: "development_basic" });
  assert.equal(result.technical.minimumRamGb, 8);
  assert.equal(result.confidence.overall, "medium");
});

test("rare Docker remains acceptable at 8GB", () => {
  assert.equal(profile({ uses: ["development"], developmentWorkload: "docker_rare" }).technical.minimumRamGb, 8);
});

test("weekly Docker raises RAM to 16 without inferring Pro", () => {
  const result = profile({ uses: ["development"], developmentWorkload: "docker_regular" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.family.preferred, undefined);
});

test("daily sustained development raises RAM and prefers Pro", () => {
  const result = profile({ uses: ["development"], developmentWorkload: "development_sustained" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.technical.sustainedPerformance, true);
  assert.equal(result.family.preferred, "pro");
});

test("specialized basic is low confidence and does not infer Pro", () => {
  const result = profile({ uses: ["specialized"], specializedWorkload: "specialized_basic" });
  assert.equal(result.technical.minimumRamGb, 8);
  assert.equal(result.family.preferred, undefined);
  assert.equal(result.confidence.overall, "low");
  assert.equal(result.verification.required, true);
});

test("specialized heavy is provisional 16GB and does not infer Pro", () => {
  const result = profile({ uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.technical.sustainedPerformance, false);
  assert.equal(result.family.preferred, undefined);
});

test("sustained specialized work prefers Pro", () => {
  const result = profile({ uses: ["specialized"], specializedWorkload: "specialized_sustained" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.family.preferred, "pro");
});

test("named specialized software is preserved for verification without changing technical truth", () => {
  const withoutName = profile({ uses: ["specialized"], specializedWorkload: "specialized_basic" });
  const withName = profile({ uses: ["specialized"], specializedWorkload: "specialized_basic", specializedSoftware: "Revit" });
  assert.equal(withName.verification.required, true);
  assert.equal(withName.verification.softwareName, "Revit");
  assert.deepEqual(withName.technical, withoutName.technical);
  assert.deepEqual(withName.family, withoutName.family);
});

test("16GB never creates a storage minimum without a storage signal", () => {
  for (const answers of [
    { uses: ["design"], designWorkload: "professional" },
    { uses: ["video"], videoWorkload: "sustained_daily" },
    { uses: ["development"], developmentWorkload: "development_sustained" },
    { uses: ["specialized"], specializedWorkload: "specialized_heavy" },
  ]) {
    const result = profile(answers);
    assert.equal(result.technical.minimumRamGb, 16);
    assert.equal(result.technical.minimumStorageGb, undefined);
    assert.equal(JSON.stringify(result).includes("512"), false);
  }
});

test("portable high plus large screen retains an explicit trade-off", () => {
  const result = profile({ portability: "frequent", screen: "large" });
  assert.equal(result.size.hasTradeoff, true);
  assert.deepEqual(result.size.preferredClasses, ["13", "14", "15", "16"]);
});

test("low portability plus compact retains compact preference", () => {
  const result = profile({ portability: "stationary", screen: "compact" });
  assert.equal(result.size.hasTradeoff, false);
  assert.deepEqual(result.size.preferredClasses, ["13", "14"]);
});

test("stationary alone does not create a large-screen requirement", () => {
  const result = profile({ portability: "stationary", screen: undefined });
  assert.deepEqual(result.size.preferredClasses, ["13", "14", "15", "16"]);
});

test("low budget cannot weaken a 16GB requirement", () => {
  const result = profile({ budget: "under-12", uses: ["development"], developmentWorkload: "development_sustained" });
  assert.equal(result.technical.minimumRamGb, 16);
  assert.equal(result.family.preferred, "pro");
  assert.equal(result.financial.status, "unknown");
});

test("installment fields are preserved without fake affordability", () => {
  const result = profile({ payment: "installment", budget: undefined, deposit: "medium", monthlyPayment: "low" });
  assert.deepEqual(result.financial.installment, { deposit: "medium", monthlyPayment: "low" });
  assert.equal(result.financial.status, "unknown");
});

test("both payment mode preserves cash and optional installment context", () => {
  const result = profile({ payment: "both", budget: "16-22", deposit: "medium", monthlyPayment: "low" });
  assert.deepEqual(result.financial.comfortRange, { min: 16, max: 22 });
  assert.deepEqual(result.financial.installment, { deposit: "medium", monthlyPayment: "low" });
});

test("ambiguous compact light work presents Air 13 and Pro 13", () => {
  const result = recommendMacBook({ ...base, portability: "stationary", screen: "compact" });
  assert.equal(result.profile.family.preferred, undefined);
  assert.equal(result.presentation.bestFit.model, "air-13");
  assert.equal(result.presentation.alternative?.model, "pro-13");
});

test("reasoning is generated from the final resolved profile", () => {
  const result = recommendMacBook({ ...base, uses: ["personal", "development"], developmentWorkload: "development_sustained" });
  const copy = [result.presentation.explanation, ...result.profile.reasoning].join(" ");
  assert.equal(result.profile.technical.minimumRamGb, 16);
  assert.equal(copy.includes("8GB RAM vẫn"), false);
  assert.match(copy, /16GB RAM/);
  assert.match(copy, /MacBook Pro sẽ hợp hơn/);
});

test("Zalo summary preserves transaction and verification context", () => {
  const answers = { ...base, payment: "installment", budget: undefined, deposit: "high", monthlyPayment: "medium", uses: ["specialized"], specializedWorkload: "specialized_basic", specializedSoftware: "AutoCAD" };
  const summary = buildZaloSummary(answers, recommendMacBook(answers));
  assert.match(summary, /trả góp/);
  assert.match(summary, /AutoCAD/);
  assert.match(summary, /sơ bộ/);
});

test("signal extraction and profile resolution are deterministic", () => {
  const answers = { ...base, uses: ["video"], videoWorkload: "long_regular" };
  const signals = normalizeRecommendationSignals(answers);
  assert.deepEqual(signals, normalizeRecommendationSignals(structuredClone(answers)));
  assert.deepEqual(resolveRecommendationProfile(answers, signals), resolveRecommendationProfile(structuredClone(answers), structuredClone(signals)));
});

test("recommendation engine contains no inventory dependency", async () => {
  const source = await readFile(new URL("./recommendation-engine.ts", import.meta.url), "utf8");
  assert.equal(/inventory|supabase|stock|margin/i.test(source), false);
});

test("comfort budget with no stretch keeps the ceiling unchanged", () => {
  const result = profile({ budget: "16-22", stretchBudget: "none" });
  assert.deepEqual(result.financial.comfortRange, { min: 16, max: 22 });
  assert.equal(result.financial.stretchMax, undefined);
});

test("comfort budget plus 2–3m maps to a 3m stretch ceiling", () => {
  const financial = profile({ budget: "16-22", stretchBudget: "plus-3" }).financial;
  assert.equal(financial.stretchAmount, 3);
  assert.equal(financial.stretchMax, 25);
});

test("comfort budget plus 5m maps to a 5m stretch ceiling", () => {
  const financial = profile({ budget: "16-22", stretchBudget: "plus-5" }).financial;
  assert.equal(financial.stretchAmount, 5);
  assert.equal(financial.stretchMax, 27);
});

test("open-ended comfort band preserves stretch amount without inventing a ceiling", () => {
  const financial = profile({ budget: "over-30", stretchBudget: "plus-5" }).financial;
  assert.equal(financial.stretchAmount, 5);
  assert.equal(financial.stretchMax, undefined);
});

test("unknown budget never creates a stretch ceiling", () => {
  const result = profile({ budget: "unknown", stretchBudget: "plus-5" });
  assert.equal(result.financial.comfortRange, undefined);
  assert.equal(result.financial.stretchMax, undefined);
});

test("all customer-facing result text avoids internal vocabulary", () => {
  const cases = [
    recommendMacBook({ ...base }),
    recommendMacBook({ ...base, uses: ["video"], videoWorkload: "sustained_daily" }),
    recommendMacBook({ ...base, portability: "frequent", screen: "large" }),
    recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_basic", specializedSoftware: "Revit" }),
  ];
  const banned = /technically valid|storage demand|\bfamily\b|trade-off|sustained workload|verification required|\bconfidence\b/i;
  const textValues = (value) => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.flatMap(textValues);
    if (value && typeof value === "object") return Object.values(value).flatMap(textValues);
    return [];
  };
  for (const result of cases) {
    const visible = [...textValues(result.presentation), ...result.profile.verification.reasons].join(" ");
    assert.equal(banned.test(visible), false, visible);
  }
});

test("ambiguous Air and Pro result uses natural Vietnamese", () => {
  const result = recommendMacBook(base);
  assert.match(result.presentation.explanation, /Cả MacBook Air và Pro đều phù hợp/);
});

test("Pro preference is presented as a preference, never a mandate", () => {
  const result = recommendMacBook({ ...base, uses: ["video"], videoWorkload: "sustained_daily" });
  const visible = JSON.stringify(result.presentation);
  assert.match(visible, /MacBook Pro sẽ hợp hơn/);
  assert.equal(/cần MacBook Pro|bắt buộc.*MacBook Pro/i.test(visible), false);
});

test("named specialized software receives customer-facing check copy", () => {
  const result = recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_basic", specializedSoftware: "Revit" });
  assert.match(result.profile.verification.reasons.join(" "), /Bạn đang dùng Revit/);
  assert.match(result.profile.verification.reasons.join(" "), /MBMC cần kiểm tra thêm/);
});
test("named software uncertainty leads the summary before Air and Pro options", () => {
  const result = recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy", specializedSoftware: "Revit" });
  const summary = result.presentation.explanation;
  assert.match(summary, /^Đây là gợi ý sơ bộ\./);
  assert.match(summary, /16GB RAM và 256GB SSD/);
  assert.match(summary, /Vì bạn đang dùng Revit, MBMC cần kiểm tra thêm cách bạn sử dụng phần mềm này trước khi chốt chính xác dòng máy\./);
  assert.ok(summary.indexOf("MBMC cần kiểm tra thêm") < summary.indexOf("MacBook Air và Pro"));
  assert.equal(result.presentation.family, "MacBook Air hoặc Pro");
  assert.deepEqual(result.profile.family.allowed, ["air", "pro"]);
  assert.doesNotMatch(summary, /Revit (?:tương thích|không tương thích|chạy được|không chạy được)/i);
});
test("unnamed specialized software keeps the regular opening summary", () => {
  const result = recommendMacBook({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy" });
  assert.doesNotMatch(result.presentation.explanation, /^Đây là gợi ý sơ bộ\./);
});

test("size conflict is explained without internal terminology", () => {
  const result = recommendMacBook({ ...base, portability: "frequent", screen: "large" });
  const visible = JSON.stringify(result.presentation);
  assert.match(visible, /13\/14 inch sẽ gọn hơn/);
  assert.equal(/trade-off/i.test(visible), false);
});

test("no-storage-signal result never mentions 512GB", () => {
  const result = recommendMacBook({ ...base, uses: ["design"], designWorkload: "professional" });
  assert.equal((JSON.stringify(result.presentation) + buildZaloSummary(base, result)).includes("512GB"), false);
});
