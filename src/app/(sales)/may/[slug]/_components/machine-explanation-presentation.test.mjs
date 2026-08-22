import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { presentMachineExplanation } from "./machine-explanation-presentation.ts";

function explanation(overrides = {}) {
  return {
    audience: "general",
    status: "ready",
    blocks: [
      { domain: "memory", stance: "benefit", text: "Nguyên văn thứ nhất." },
      { domain: "storage", stance: "guidance", text: "Nguyên văn thứ hai." },
      { domain: "battery", stance: "caution", text: "Nguyên văn thứ ba." },
      { domain: "cosmetic", stance: "limitation", text: "Nguyên văn thứ tư." },
    ],
    notes: [],
    ...overrides,
  };
}

test("all audiences map to customer-facing Vietnamese labels", () => {
  const mappings = [
    ["general", "Phổ thông"],
    ["developer", "Lập trình"],
    ["creative", "Sáng tạo"],
    ["heavy", "Tác vụ nặng"],
    ["storage_heavy", "Lưu trữ nhiều"],
  ];
  for (const [audience, label] of mappings) {
    assert.equal(
      presentMachineExplanation(explanation({ audience }))?.audienceLabel,
      label,
    );
  }
});

test("domain labels and approved block text retain exact supplied order", () => {
  const presented = presentMachineExplanation(explanation());
  assert.deepEqual(presented?.blocks, [
    { domainLabel: "RAM", text: "Nguyên văn thứ nhất." },
    { domainLabel: "Lưu trữ", text: "Nguyên văn thứ hai." },
    { domainLabel: "Pin", text: "Nguyên văn thứ ba." },
    { domainLabel: "Ngoại hình", text: "Nguyên văn thứ tư." },
  ]);
});

test("ready omits notes while ready_with_note preserves supplied note order", () => {
  assert.deepEqual(
    presentMachineExplanation(explanation({ status: "ready", notes: ["Ẩn."] }))
      ?.notes,
    [],
  );
  assert.deepEqual(
    presentMachineExplanation(
      explanation({ status: "ready_with_note", notes: ["Một.", "Hai."] }),
    )?.notes,
    ["Một.", "Hai."],
  );
});

test("undefined explanation produces no presentation or wrapper", () => {
  assert.equal(presentMachineExplanation(undefined), null);
  const component = readFileSync(
    new URL("./MachineExplanation.tsx", import.meta.url),
    "utf8",
  );
  assert.match(component, /if \(!presentation\) return null;/);
});

test("visible presentation contains no private metadata or raw codes", () => {
  const serialized = JSON.stringify(presentMachineExplanation(explanation()));
  for (const forbidden of [
    "snapshot",
    "engine",
    "hash",
    "sourceKey",
    "reasonCode",
    "approvedBy",
    "general",
    "developer",
    "creative",
    "heavy",
    "storage_heavy",
    "benefit",
    "guidance",
    "caution",
    "limitation",
    "disclosure",
  ]) {
    assert.doesNotMatch(serialized, new RegExp(forbidden, "i"));
  }
});

test("renderer is between fit recommendation and verification with existing dossier intact", () => {
  const dossier = readFileSync(
    new URL("./DecisionDossier.tsx", import.meta.url),
    "utf8",
  );
  const fit = dossier.indexOf("<PublicMachineFitRecommendation");
  const explanationIndex = dossier.indexOf("<MachineExplanation");
  const verification = dossier.indexOf("<MachineVerification");
  assert.ok(
    fit >= 0 && fit < explanationIndex && explanationIndex < verification,
  );
  for (const existing of [
    "<DecisionSummary",
    "<VerifiedPublicInformation",
    "<PublicInformationLimitations",
    "<ExpertSummary",
    "<MachineEvidenceGrid",
    "<PublicSpecifications",
    "<PassportDossier",
  ]) {
    assert.match(dossier, new RegExp(existing.replace("<", "<")));
  }
});

test("renderer uses semantic structure and mobile-safe wrapping", () => {
  const component = readFileSync(
    new URL("./MachineExplanation.tsx", import.meta.url),
    "utf8",
  );
  const css = readFileSync(
    new URL("../../../../globals.css", import.meta.url),
    "utf8",
  );
  assert.match(component, /<section/);
  assert.match(component, /<h2/);
  assert.match(component, /<ol/);
  assert.match(component, /<aside/);
  assert.match(
    css,
    /\.machine-explanation__blocks p[^}]*overflow-wrap: anywhere/s,
  );
  assert.match(
    css,
    /@media \(max-width: 639px\)[\s\S]*\.machine-explanation__blocks li[^}]*grid-template-columns: minmax\(0, 1fr\)/,
  );
});
