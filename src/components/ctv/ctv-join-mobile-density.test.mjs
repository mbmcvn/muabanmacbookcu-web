import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync(
  new URL("../../app/(sales)/ctv/ctv.css", import.meta.url),
  "utf8",
);
const form = readFileSync(
  new URL("./CtvApplicationForm.tsx", import.meta.url),
  "utf8",
);
const mobile = styles.slice(styles.indexOf("@media (max-width: 39.99rem)"));

test("CTV join mobile layout uses a compact but touchable rhythm", () => {
  assert.match(mobile, /margin-bottom:\s*1\.75rem/);
  assert.match(mobile, /\.ctv-application-form\s*\{[\s\S]*?gap:\s*1rem/);
  assert.match(
    mobile,
    /\.ctv-application-form fieldset,[\s\S]*?padding:\s*1\.25rem/,
  );
  assert.match(
    mobile,
    /\.ctv-application-form fieldset\s*\{[\s\S]*?gap:\s*1\.05rem/,
  );
  assert.match(
    mobile,
    /\.ctv-application-form label\s*\{[\s\S]*?gap:\s*0\.5rem/,
  );
  assert.match(
    mobile,
    /\.ctv-application-form input\s*\{[\s\S]*?min-height:\s*3rem/,
  );
  assert.match(mobile, /\.ctv-question\s*\{[\s\S]*?gap:\s*0\.625rem/);
  assert.match(
    mobile,
    /\.ctv-question textarea\s*\{[\s\S]*?\n\s*height:\s*8\.25rem/,
  );
});

test("Question 2 callout is compact and keeps exploration behavior", () => {
  assert.match(
    mobile,
    /\.ctv-exploration-task\s*\{[\s\S]*?gap:\s*0\.5rem;[\s\S]*?padding:\s*1rem/,
  );
  assert.match(form, /Mở trong tab mới\. Trải nghiệm xong, quay lại đây\./);
  assert.match(form, /experience=ctv-join/);
  assert.match(form, /target="_blank"/);
  assert.match(form, /sessionStorage/);
  assert.match(form, /submitCtvApplication/);
});

test("density overrides stay inside the mobile breakpoint", () => {
  const desktop = styles.slice(
    0,
    styles.indexOf("@media (max-width: 39.99rem)"),
  );
  assert.match(desktop, /\.ctv-application-form\s*\{[\s\S]*?gap:\s*1\.5rem/);
  assert.match(desktop, /padding:\s*1\.35rem/);
  assert.doesNotMatch(desktop, /height:\s*8\.25rem/);
});
