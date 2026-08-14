import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildQuizRequirementSnapshot,
  getQuizDemandPresentation,
} from "./demand-capture-presentation.ts";

const ready = (mode) => ({
  status: "ready",
  mode,
  matches: [],
  hasSizeTradeoff: false,
});

test("matches exposes a low-hierarchy Demand alternative", () => {
  assert.deepEqual(getQuizDemandPresentation(ready("matches")), {
    hierarchy: "alternative",
    title: "Chưa thấy đúng chiếc bạn muốn?",
    description: "MBMC có thể tìm thêm theo nhu cầu vừa chọn.",
    action: "Gửi yêu cầu tìm máy",
  });
});

test("empty keeps Demand as the prominent fallback", () => {
  const presentation = getQuizDemandPresentation({ status: "empty" });
  assert.equal(presentation?.hierarchy, "prominent");
  assert.equal(presentation?.matcherState, "empty");
});

test("above-budget exposes its contextual Demand alternative", () => {
  const presentation = getQuizDemandPresentation(ready("above-budget"));
  assert.equal(presentation?.action, "Tìm máy đúng ngân sách hơn");
  assert.equal(presentation?.matcherState, "above-budget");
  assert.equal(presentation?.hierarchy, "alternative");
});

test("loading and failed inventory do not imply unmet Demand", () => {
  assert.equal(getQuizDemandPresentation(null), null);
  assert.equal(getQuizDemandPresentation({ status: "failed" }), null);
});

test("Demand reuses the derived quiz answers and RecommendationProfile", () => {
  const answers = { uses: ["office"] };
  const profile = { technical: { minimumRamGb: 8 } };
  const snapshot = buildQuizRequirementSnapshot(answers, profile);
  assert.equal(snapshot.normalizedQuizAnswers, answers);
  assert.equal(snapshot.recommendationProfile, profile);
  assert.equal(snapshot.recommendationContractVersion, "chon-macbook.v1");
});

test("capture asks for no repeated quiz facts and preserves referral evidence", async () => {
  const [view, form] = await Promise.all([
    readFile(new URL("./RecommendationView.tsx", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../../../components/demand/DemandCaptureForm.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  assert.match(view, /referralEvidence=\{referralEvidence\}/);
  assert.match(view, /requirementSnapshot=\{requirementSnapshot\}/);
  assert.doesNotMatch(form, /QuizAnswers|RecommendationProfile|quiz question/i);
});

test("public hierarchy places Demand after primary actions and keeps the submission contract", async () => {
  const [view, form] = await Promise.all([
    readFile(new URL("./RecommendationView.tsx", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../../../components/demand/DemandCaptureForm.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  assert.ok(
    view.indexOf('className="result-actions"') <
      view.indexOf("{demandPresentation && ("),
  );
  assert.match(
    form,
    /submissionKey[\s\S]*submittedPhone: phone[\s\S]*sourceRoute[\s\S]*requirementSnapshot[\s\S]*desiredSpecSnapshot[\s\S]*inventoryContextSnapshot[\s\S]*referralEvidence/,
  );
  assert.doesNotMatch(form, /CAPTCHA/);
  assert.match(form, /maskDemandPhone\(phone\)/);
  assert.match(form, /\sHủy\s/);
});
