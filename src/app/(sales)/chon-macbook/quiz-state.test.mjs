import assert from "node:assert/strict";
import test from "node:test";
import { isUsageAnswerComplete, normalizeStoredAnswers, shouldShowSpecializedSoftwareField, toggleUsageAnswer } from "./quiz-state.ts";
import { getQuestionFlow } from "./quiz-questions.ts";

const base = { uses: [] };

test("unknown top-level usage is exclusive and clears child answers", () => {
  const answers = { ...base, uses: ["video", "office"], videoWorkload: "short_social" };
  assert.deepEqual(toggleUsageAnswer(answers, "unclear"), {
    uses: ["unclear"], videoWorkload: undefined, designWorkload: undefined,
    developmentWorkload: undefined, specializedWorkload: undefined, specializedSoftware: undefined,
  });
  assert.deepEqual(toggleUsageAnswer({ ...base, uses: ["unclear"] }, "personal").uses, ["personal"]);
});

test("deselecting a branch parent clears its child answer", () => {
  const answers = { ...base, uses: ["video"], videoWorkload: "long_high_quality" };
  const next = toggleUsageAnswer(answers, "video");
  assert.deepEqual(next.uses, []);
  assert.equal(next.videoWorkload, undefined);
});

test("selecting and returning to another usage preserves parent and child answers", () => {
  const answers = { ...base, uses: ["video"], videoWorkload: "short_social" };
  const next = toggleUsageAnswer(answers, "office");
  const restored = JSON.parse(JSON.stringify(next));
  assert.deepEqual(restored.uses, ["video", "office"]);
  assert.equal(restored.videoWorkload, "short_social");
});

test("usage is incomplete while a selected video branch lacks a child answer", () => {
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["video"] }), false);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["video"], videoWorkload: "short_social" }), true);
});

test("usage is incomplete while a selected design branch lacks a child answer", () => {
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["design"] }), false);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["design"], designWorkload: "light" }), true);
});

test("top-level usage remains limited to two", () => {
  const answers = { ...base, uses: ["office", "personal"] };
  assert.deepEqual(toggleUsageAnswer(answers, "development").uses, ["office", "personal"]);
});

test("old persisted unknown child values are cleared and require fresh answers", () => {
  const restored = normalizeStoredAnswers({
    ...base,
    uses: ["video", "design"],
    videoWorkload: "unknown",
    designWorkload: "unknown",
  });
  assert.equal(restored.videoWorkload, undefined);
  assert.equal(restored.designWorkload, undefined);
  assert.equal(isUsageAnswerComplete(restored), false);
});

test("generic workload screen is absent from every normal flow", () => {
  for (const uses of [["office"], ["personal"], ["design"], ["video"], ["development"], ["specialized"]]) {
    assert.equal(getQuestionFlow({ ...base, uses }).includes("workload"), false);
  }
});

test("standalone Windows question is absent from flow and progress steps", () => {
  const flow = getQuestionFlow({ ...base, payment: "full", uses: ["office"] });
  assert.equal(flow.includes("windows"), false);
  assert.deepEqual(flow, ["payment", "budget", "uses", "portability", "screen", "fulfilment"]);
});

test("office and personal do not require child answers", () => {
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["office"] }), true);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["personal"] }), true);
});

test("development requires a normalized child answer", () => {
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["development"] }), false);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["development"], developmentWorkload: "development_basic" }), true);
});

test("specialized requires a normalized child answer", () => {
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["specialized"] }), false);
  assert.equal(isUsageAnswerComplete({ ...base, uses: ["specialized"], specializedWorkload: "specialized_basic" }), true);
});

test("deselecting development and specialized clears their child state", () => {
  const development = toggleUsageAnswer({ ...base, uses: ["development"], developmentWorkload: "development_heavy" }, "development");
  const specialized = toggleUsageAnswer({ ...base, uses: ["specialized"], specializedWorkload: "specialized_heavy" }, "specialized");
  assert.equal(development.developmentWorkload, undefined);
  assert.equal(specialized.specializedWorkload, undefined);
});

test("specialized software field is contextual, optional, and cleared with its parent", () => {
  const specialized = {
    ...base,
    uses: ["specialized"],
    specializedWorkload: "specialized_basic",
    specializedSoftware: "Revit",
  };
  assert.equal(shouldShowSpecializedSoftwareField(specialized), true);
  assert.equal(shouldShowSpecializedSoftwareField({ ...base, uses: ["office"] }), false);
  assert.equal(isUsageAnswerComplete({ ...specialized, specializedSoftware: "" }), true);
  assert.equal(toggleUsageAnswer(specialized, "specialized").specializedSoftware, undefined);
});

test("old generic workload state is removed safely", () => {
  const restored = normalizeStoredAnswers({ ...base, uses: ["office"], workload: "heavy", workloadClarification: "office" });
  assert.equal("workload" in restored, false);
  assert.equal("workloadClarification" in restored, false);
});

test("old Windows compatibility state is removed safely", () => {
  const restored = normalizeStoredAnswers({
    ...base,
    uses: ["office"],
    windows: "yes",
    windowsSoftware: "Legacy app",
  });
  assert.equal("windows" in restored, false);
  assert.equal("windowsSoftware" in restored, false);
});
