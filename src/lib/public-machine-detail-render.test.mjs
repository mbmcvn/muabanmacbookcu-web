/* Hook adapters exercise both server markup and the copy interaction. */
/* eslint-disable react-hooks/rules-of-hooks */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { publicMachineId, copyPublicMachineId } from "./public-machine-id.ts";
import * as presentation from "./presentation/machine.ts";
import { copyText } from "./copy-text.ts";

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

let copyHarness;
const { MachineIdentity } = loadComponent("MachineIdentity.tsx", {
  "@/lib/copy-text": { copyText },
  "@/lib/public-machine-id": { publicMachineId, copyPublicMachineId },
  react: { ...React,
    useState: initial => copyHarness ? [copyHarness.feedback, value => { copyHarness.feedback = value; }] : React.useState(initial),
    useRef: initial => copyHarness ? copyHarness.timer : React.useRef(initial),
    useEffect: effect => { if (copyHarness) copyHarness.cleanup = effect(); },
  },
});
const { DecisionPanel } = loadComponent("DecisionPanel.tsx", {
  "@/lib/presentation": presentation,
  "@/config/contact": { phoneContact: null },
  "@/components/contact/ContactActionLink": { ContactActionLink: () => null },
  "@/components/contact/CopyMachineLink": { CopyMachineLink: () => React.createElement("button", { className: "machine-share-action" }, "Sao chép liên kết") },
  "./MachineIdentity": { MachineIdentity },
});
const { MachineCard } = loadComponent("../../../may-dang-co/_components/MachineCard.tsx", {
  "@/components/contact/CopyMachineLink": { CopyMachineLink: () => React.createElement("button", { className: "machine-card-copy" }, "Sao chép liên kết") },
  "@/lib/presentation": presentation,
  "@/lib/public-machine-id": { publicMachineId },
  "@/components/machine/MachineImage": { MachineImage: () => null },
  "@/hooks/useContactChannel": { useContactChannel: () => ({ channel: null }), withContactChannel: href => href },
  "./machine-card-presentation": await import("../app/(sales)/may-dang-co/_components/machine-card-presentation.ts"),
  "next/link": { default: function TestLink({ children, ...props }) { return React.createElement("a", props, children); } },
});
const summary = {
  code: "MBMC-FTFF", slug: "fixture", displayName: "MacBook Air M1", machineFamily: "macbook", chip: "M1", ramGb: 8,
  storage: { capacityGb: 256, type: "ssd" }, color: "Silver", price: { amount: 12000000, currency: "VND" },
  availability: "available", familyFacts: { machineFamily: "macbook", batteryHealthPercent: 94, cycleCount: 80 },
};

test("public detail places the canonical Machine ID copy tag first in the top status row", () => {
  const html = renderToStaticMarkup(React.createElement(DecisionPanel, { machine: { summary } }));
  const row = html.match(/<div class="detail-status">([\s\S]*?)<\/div>/)[1];
  assert.match(row, /^<button type="button" class="machine-id-copy"/);
  assert.ok(row.indexOf("MBMC-FTFF") < row.indexOf("machine-availability-status"));
  assert.ok(row.indexOf("machine-availability-status") < row.indexOf("machine-share-action"));
  assert.match(html, /<\/div><h1 id="machine-title">.*?<\/h1><p class="detail-configuration">/);
  assert.doesNotMatch(html, /public-machine-identity|public-machine-identity-label/);
  assert.doesNotMatch(row, />Machine ID<|>Sao chép</);
  assert.match(html, /class="public-machine-id">MBMC-FTFF<\/span>/);
  assert.match(html, /<button type="button" class="machine-id-copy" aria-label="Sao chép Machine ID MBMC-FTFF"/);
  assert.match(html, /aria-live="polite" aria-atomic="true"/);
});

test("inventory cards show plain Machine ID and a separate link-copy control, never an ID-copy control", () => {
  const html = renderToStaticMarkup(React.createElement(MachineCard, { machine: summary }));
  assert.match(html, /class="machine-code">MBMC-FTFF<\/span>/);
  assert.doesNotMatch(html, /machine-id-copy/);
  assert.match(html, /<\/a><button class="machine-card-copy">Sao chép liên kết<\/button>/);
  assert.match(html, /<div class="machine-card-price-region"><p class="machine-price">/);
  assert.match(html, /<div class="machine-card-footer"><span class="machine-code">MBMC-FTFF<\/span><span class="machine-card-cta">/);
  assert.doesNotMatch(html, /machine-card-utility|machine-card-primary/);
  assert.match(html, /href="\/may\/fixture"/);
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /\.machine-code[^}]*display: none/);
});

test("missing, shorthand and internal IDs omit public identity text and copy action", () => {
  for (const code of [undefined, null, "", "FTFF", "12345678-1234-1234-1234-123456789abc"]) {
    assert.equal(renderToStaticMarkup(React.createElement(MachineIdentity, { code })), "");
    const card = renderToStaticMarkup(React.createElement(MachineCard, { machine: { ...summary, code } }));
    assert.doesNotMatch(card, /class="machine-code"|machine-id-copy/);
    const detail = renderToStaticMarkup(React.createElement(DecisionPanel, { machine: { summary: { ...summary, code } } }));
    assert.doesNotMatch(detail, /public-machine-identity|machine-id-copy/);
  }
});

test("copy writes exactly the canonical Machine ID and gracefully rejects invalid values or errors", async () => {
  const values = [];
  assert.equal(await copyPublicMachineId("MBMC-FTFF", async value => { values.push(value); }), true);
  assert.deepEqual(values, ["MBMC-FTFF"]);
  assert.equal(await copyPublicMachineId("FTFF", async () => assert.fail("invalid ID copied")), false);
  assert.equal(await copyPublicMachineId("MBMC-FTFF", async () => { throw new Error("private clipboard details"); }), false);
});

test("detail copy announces temporary success, handles missing clipboard, and clears its timer", async () => {
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const oldSetTimeout = globalThis.setTimeout, oldClearTimeout = globalThis.clearTimeout;
  let reset, cleared = 0;
  globalThis.setTimeout = callback => { reset = callback; return 1; };
  globalThis.clearTimeout = () => { cleared++; };
  const render = () => MachineIdentity({ code: "MBMC-FTFF" });
  try {
    copyHarness = { feedback: "idle", timer: { current: null } };
    let value;
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard: { writeText: async text => { value = text; } } } });
    await render().props.onClick();
    assert.equal(value, "MBMC-FTFF");
    assert.equal(render().props.children[2].props.children, "Đã sao chép");
    reset(); assert.equal(copyHarness.feedback, "idle");
    for (const clipboard of [undefined, { writeText: async () => { throw new Error("private clipboard details"); } }]) {
      Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard } });
      await render().props.onClick();
      const tree = render();
      assert.equal(tree.props.children[0].props.children, "MBMC-FTFF");
      assert.equal(tree.props.children[2].props.children, "Không thể sao chép");
    }
    copyHarness.cleanup(); assert.ok(cleared > 0);
  } finally {
    copyHarness = undefined;
    globalThis.setTimeout = oldSetTimeout; globalThis.clearTimeout = oldClearTimeout;
    if (oldNavigator) Object.defineProperty(globalThis, "navigator", oldNavigator); else delete globalThis.navigator;
  }
});

test("identity styling stays compact and scoped; card footer can wrap without losing CTA alignment", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.public-detail-page \.detail-status > \.machine-availability-status \{/);
  assert.doesNotMatch(css, /\.detail-status span:first-child|public-machine-identity/);
  assert.match(css, /\.machine-id-copy \{[^}]*max-width: 100%;[^}]*border: 1px solid var\(--border-strong\);[^}]*font-size: \.75rem;/);
  assert.match(css, /\.machine-card-footer \{[^}]*flex-wrap: wrap;[^}]*justify-content: space-between;/);
  assert.match(css, /\.machine-code \{[^}]*overflow-wrap: anywhere;/);
  assert.match(css, /\.machine-card-cta \{ margin-left: auto; flex-shrink: 0;/);
});
