import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import * as presentation from "./presentation/machine.ts";

const require = createRequire(import.meta.url);
const componentDir = new URL("../app/(sales)/may/[slug]/_components/", import.meta.url);
function loadComponent(file, dependencies) {
  const source = readFileSync(new URL(file, componentDir), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
    fileName: file,
  });
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (id) => id in dependencies ? dependencies[id] : require(id), loadedModule, loadedModule.exports,
  );
  return loadedModule.exports;
}

const passport = loadComponent("PassportDossier.tsx", {
  "@/lib/presentation": presentation,
  "./MachineDetailIcon": { MachineDetailIcon: () => null },
});
const supporting = Object.fromEntries([
  "PublicSpecifications", "MachineSuitableAudiences", "MachineEvidenceGrid",
  "DecisionSummary", "DetailedImages", "MachineVerification",
].map((name) => [name, () => React.createElement("div", { "data-section": name })]));
const { DecisionDossier } = loadComponent("DecisionDossier.tsx", {
  "./PassportDossier": passport,
  "./PublicSpecifications": supporting,
  "./MachineSuitableAudiences": supporting,
  "./MachineEvidence": supporting,
  "./DecisionSummary": supporting,
  "./ConditionAndImages": supporting,
  "./MachineVerification": supporting,
});

for (const [availability, reservationKind] of [
  ["available", null], ["reserved", "hold"], ["reserved", "deposit"], ["sold", null], ["unavailable", null],
]) {
  test(`Passport renders canonical identity and ${availability}/${reservationKind} status without confirmation noise`, () => {
    const machine = {
      summary: { displayName: "MacBook Air M1", reservationKind },
      passport: { code: "MBMC-123", publicStatus: availability, firstPublishedAt: "2026-10-01T00:00:00Z" },
      verifications: [], suitableAudiences: [],
    };
    const html = renderToStaticMarkup(React.createElement(DecisionDossier, { machine }));
    assert.equal((html.match(/Hồ sơ nhận diện công khai/g) ?? []).length, 1);
    for (const text of ["MBMC Passport", "MBMC-123", presentation.formatPublicMachineDisplayName(machine.summary.displayName),
      presentation.formatMachineAvailability(availability, reservationKind),
      presentation.formatPublicDate(machine.passport.firstPublishedAt)]) assert.ok(html.includes(text), text);
    for (const text of ["Đã xác minh trong hồ sơ công khai", "Thông tin cần xác nhận thêm",
      "chưa có kết quả kiểm định", "chưa có thông tin bảo hành đã được xác định",
      "chưa có dữ liệu xác minh nguồn gốc", "chưa có kết luận về tình trạng sửa chữa"])
      assert.equal(html.includes(text), false, text);
    for (const name of Object.keys(supporting)) assert.ok(html.includes(`data-section="${name}"`));
  });
}
