import assert from "node:assert/strict";
import test from "node:test";
import { getQuestionFlow } from "./quiz-questions.ts";
import { isUsageAnswerComplete, normalizeStoredAnswers, setComfortBudget, shouldShowSpecializedSoftwareField, toggleUsageAnswer } from "./quiz-state.ts";

const base = { uses: [] };

test("unclear usage is exclusive and clears every child", () => {
  const result = toggleUsageAnswer({ ...base, uses: ["video", "specialized"], videoWorkload: "short_social", specializedWorkload: "specialized_heavy", specializedSoftware: "Revit" }, "unclear");
  assert.deepEqual(result.uses, ["unclear"]);
  assert.equal(result.videoWorkload, undefined);
  assert.equal(result.specializedSoftware, undefined);
});

test("usage remains limited to two", () => {
  assert.deepEqual(toggleUsageAnswer({ ...base, uses: ["office", "personal"] }, "development").uses, ["office", "personal"]);
});

test("every technical parent requires a current V1 child answer", () => {
  for (const use of ["design", "video", "development", "specialized"]) {
    assert.equal(isUsageAnswerComplete({ ...base, uses: [use] }), false);
  }
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["design"], designWorkload: "professional_sustained" }), true);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["video"], videoWorkload: "long_rare" }), true);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["development"], developmentWorkload: "docker_regular" }), true);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["specialized"], specializedWorkload: "specialized_sustained" }), true);
});

test("office, personal, and unclear need no child answer", () => {
  for (const use of ["office", "personal", "unclear"]) assert.equal(isUsageAnswerComplete({ ...base, uses: [use] }), true);
});

test("deselecting a parent clears its child and software metadata", () => {
  const result = toggleUsageAnswer({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy", specializedSoftware: "Revit" }, "specialized");
  assert.deepEqual(result.uses, []);
  assert.equal(result.specializedWorkload, undefined);
  assert.equal(result.specializedSoftware, undefined);
});

test("old ambiguous workload enums are cleared instead of guessed", () => {
  const result = normalizeStoredAnswers({ ...base, uses: ["video", "development"], videoWorkload: "long_high_quality", developmentWorkload: "development_heavy" });
  assert.equal(result.videoWorkload, undefined);
  assert.equal(result.developmentWorkload, undefined);
  assert.equal(isUsageAnswerComplete(result), false);
});

test("orphan child and software state is removed", () => {
  const result = normalizeStoredAnswers({ ...base, uses: ["office"], specializedWorkload: "specialized_heavy", specializedSoftware: "Revit", videoWorkload: "short_social" });
  assert.equal(result.specializedWorkload, undefined);
  assert.equal(result.specializedSoftware, undefined);
  assert.equal(result.videoWorkload, undefined);
});

test("payment normalization preserves only applicable financial context", () => {
  const installment = normalizeStoredAnswers({ ...base, payment: "installment", budget: "22-30", deposit: "medium", monthlyPayment: "low" });
  assert.equal(installment.budget, undefined);
  assert.equal(installment.deposit, "medium");
  const both = normalizeStoredAnswers({ ...base, payment: "both", budget: "22-30", deposit: "medium", monthlyPayment: "low" });
  assert.equal(both.budget, "22-30");
  assert.equal(both.deposit, "medium");
});

test("province is removed unless province fulfilment remains selected", () => {
  assert.equal(normalizeStoredAnswers({ ...base, fulfilment: "showroom", province: "Đà Nẵng" }).province, undefined);
  assert.equal(normalizeStoredAnswers({ ...base, fulfilment: "province", province: "Đà Nẵng" }).province, "Đà Nẵng");
});

test("specialized software field is contextual and optional", () => {
  assert.equal(shouldShowSpecializedSoftwareField({ ...base, uses: ["specialized"] }), true);
  assert.equal(shouldShowSpecializedSoftwareField({ ...base, uses: ["office"] }), false);
});

test("question flow keeps cash and installment paths distinct", () => {
  assert.deepEqual(getQuestionFlow({ ...base, payment: "full" }), ["payment", "budget", "uses", "portability", "screen", "fulfilment"]);
  assert.deepEqual(getQuestionFlow({ ...base, payment: "both" }), ["payment", "budget", "uses", "portability", "screen", "fulfilment"]);
  assert.deepEqual(getQuestionFlow({ ...base, payment: "installment" }), ["payment", "deposit", "monthly-payment", "uses", "portability", "screen", "fulfilment"]);
});

test("concrete comfort and stretch state restores together", () => {
  const restored = normalizeStoredAnswers({ ...base, payment: "full", budget: "16-22", stretchBudget: "plus-3" });
  assert.equal(restored.budget, "16-22");
  assert.equal(restored.stretchBudget, "plus-3");
});

test("unknown comfort budget clears stretch state", () => {
  const restored = normalizeStoredAnswers({ ...base, payment: "full", budget: "unknown", stretchBudget: "plus-5" });
  assert.equal(restored.budget, "unknown");
  assert.equal(restored.stretchBudget, undefined);
});

test("changing the comfort budget clears the previous stretch answer", () => {
  const changed = setComfortBudget({ ...base, payment: "full", budget: "16-22", stretchBudget: "plus-5" }, "22-30");
  assert.equal(changed.budget, "22-30");
  assert.equal(changed.stretchBudget, undefined);
});

test("invalid persisted stretch state is cleared", () => {
  const restored = normalizeStoredAnswers({ ...base, payment: "full", budget: "16-22", stretchBudget: "22-30" });
  assert.equal(restored.stretchBudget, undefined);
});
