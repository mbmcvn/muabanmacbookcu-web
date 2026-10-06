import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { blockCrossSiteDEV } = require("next/dist/server/lib/router-utils/block-cross-site-dev.js");
const compiled = ts.transpileModule(readFileSync("next.config.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = { exports: {} };
new Function("module", "exports", compiled)(loaded, loaded.exports);
const config = loaded.exports.default;

test("Next dev origin policy allows the explicit Tailscale HMR host and localhost without wildcard access", () => {
  assert.deepEqual(config.allowedDevOrigins, ["100.103.44.105"]);
  for (const origin of ["http://localhost:3000", "http://100.103.44.105:3000"]) {
    const res = { statusCode: 200, end() { assert.fail("approved development host blocked"); } };
    assert.equal(blockCrossSiteDEV({ url: "/_next/webpack-hmr", headers: { origin } }, res, config.allowedDevOrigins, "localhost"), false);
  }
  const res = { statusCode: 200, end() {} };
  assert.equal(blockCrossSiteDEV({ url: "/_next/webpack-hmr", headers: { origin: "http://unapproved.example" } }, res, config.allowedDevOrigins, "localhost"), true);
  assert.equal(res.statusCode, 403);
});

test("all public clipboard consumers use the safe helper only inside their copy actions", () => {
  const paths = [
    "src/components/contact/CopyMachineLink.tsx", "src/components/contact/CopyInventoryLink.tsx",
    "src/components/desktop/CopyReportLinkButton.tsx", "src/app/(sales)/may/[slug]/_components/MachineIdentity.tsx",
    "src/app/(sales)/chon-macbook/RecommendationView.tsx",
  ];
  for (const path of paths) {
    const source = readFileSync(path, "utf8");
    assert.doesNotMatch(source, /navigator\.clipboard/);
    assert.match(source, /import { copyText } from "@\/lib\/copy-text"/);
  }
});
