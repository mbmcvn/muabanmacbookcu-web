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
vm.runInNewContext(js, { module: compiled, exports: compiled.exports });
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
test("profile discovery hint accepts bounded free-form text and only trims it", () => {
  for (const profileUrl of [
    "https://facebook.com/a",
    "facebook.com/a",
    "nguyen.a",
    "@nguyen.a",
    "Nguyễn A",
    "javascript:alert(1)",
  ]) {
    const result = parseCtvApplicationV1({
      ...valid(),
      profileUrl: `  ${profileUrl}  `,
    });
    assert.equal(result.ok, true);
    assert.equal(result.value.profileUrl, profileUrl);
  }
});
test("missing name, missing or excessive profile hint, and invalid answers fail", () => {
  assert.equal(
    parseCtvApplicationV1({ ...valid(), displayName: "" }).ok,
    false,
  );
  assert.equal(
    parseCtvApplicationV1({ ...valid(), profileUrl: "  " }).ok,
    false,
  );
  assert.equal(
    parseCtvApplicationV1({ ...valid(), profileUrl: "x".repeat(501) }).ok,
    false,
  );
  const missing = valid();
  missing.answers.challenge = "";
  assert.equal(parseCtvApplicationV1(missing).ok, false);
  const long = valid();
  long.answers.ctv_value = "x".repeat(4001);
  assert.equal(parseCtvApplicationV1(long).ok, false);
});
test("public form presents the profile field as a free-form discovery hint", () => {
  const form = fs.readFileSync(
    new URL("../components/ctv/CtvApplicationForm.tsx", import.meta.url),
    "utf8",
  );
  assert.match(form, /placeholder="Link, tên hoặc username"/);
  assert.doesNotMatch(form, /type="url"|inputMode="url"/);
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
