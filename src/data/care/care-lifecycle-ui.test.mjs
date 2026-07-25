import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../../app/care/[machine_id]/page.tsx", import.meta.url), "utf8");
const activation = readFileSync(new URL("../../app/care/[machine_id]/ActivationForm.tsx", import.meta.url), "utf8");
const route = readFileSync(new URL("../../app/care/[machine_id]/activate/route.ts", import.meta.url), "utf8");

test("first-time activation is resolved before returning-owner unlock", () => {
  assert.ok(
    page.indexOf("resolvePublicCareState(machineCode)") <
      page.indexOf("readCurrentCareAccess(machineCode)"),
  );
  assert.match(page, /lifecycle\.state === "activation_required"[\s\S]*<ActivationForm/);
});

test("activation form contains name, phone, machine ID, and dedicated CTA", () => {
  assert.match(activation, /Kích hoạt hồ sơ Care/);
  assert.match(activation, /name="customer_name"/);
  assert.match(activation, /name="phone"/);
  assert.match(activation, /Machine ID/);
  assert.match(activation, /Kích hoạt MBMC Care/);
  assert.doesNotMatch(activation, /Mở hồ sơ Care/);
});

test("successful activation issues the normal signed Care session", () => {
  assert.match(route, /createCareSession\(result\.access\)/);
  assert.match(route, /CARE_SESSION_COOKIE/);
  assert.match(route, /response\.cookies\.set/);
});
