import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const source = fs.readFileSync(
  new URL("./ctv-application-contract.ts", import.meta.url),
  "utf8",
);
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const compiled = { exports: {} };
vm.runInNewContext(js, { module: compiled, exports: compiled.exports, URL });
const {
  parseCtvApplicationV1,
  CTV_QUESTION_IDS,
  CTV_APPLICATION_SCHEMA,
  CTV_ANSWERS_SCHEMA,
} = compiled.exports;
const valid = () => ({
  schemaVersion: CTV_APPLICATION_SCHEMA,
  submissionKey: "11111111-1111-4111-8111-111111111111",
  displayName: "Nguyễn A",
  submittedPhone: "0912345678",
  profileUrl: "https://facebook.com/a",
  answers: {
    schemaVersion: CTV_ANSWERS_SCHEMA,
    ...Object.fromEntries(
      CTV_QUESTION_IDS.map((id) => [id, "Câu trả lời rõ ràng"]),
    ),
  },
});
test("complete application succeeds", () =>
  assert.equal(parseCtvApplicationV1(valid()).ok, true));
test("missing name, unsafe URL, missing answer, and excessive answer fail", () => {
  assert.equal(
    parseCtvApplicationV1({ ...valid(), displayName: "" }).ok,
    false,
  );
  assert.equal(
    parseCtvApplicationV1({ ...valid(), profileUrl: "javascript:alert(1)" }).ok,
    false,
  );
  const missing = valid();
  missing.answers.challenge = "";
  assert.equal(parseCtvApplicationV1(missing).ok, false);
  const long = valid();
  long.answers.ctv_value = "x".repeat(4001);
  assert.equal(parseCtvApplicationV1(long).ok, false);
});
test("exploration workflow uses a new tab and session draft", () => {
  const form = fs.readFileSync(
    new URL("../components/ctv/CtvApplicationForm.tsx", import.meta.url),
    "utf8",
  );
  assert.match(form, /target="_blank"/);
  assert.match(form, /noopener noreferrer/);
  assert.match(form, /sessionStorage/);
  assert.match(form, /experience=ctv-join/);
});
