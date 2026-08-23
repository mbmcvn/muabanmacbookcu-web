import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { publicMachineMetadataDescription } from "./public-machine-metadata.ts";

const conditionSummary =
  "Ngoại hình đẹp, có dấu hiệu sử dụng nhẹ và hoạt động ổn định.";

function machine(expertSummary) {
  return {
    expertSummary,
    summary: { conditionSummary },
  };
}

test("condition summary is the canonical non-empty metadata description", () => {
  assert.equal(
    publicMachineMetadataDescription(machine(null)),
    conditionSummary,
  );
  assert.ok(publicMachineMetadataDescription(machine(null)).trim().length > 0);
});

test("changing only expertSummary cannot change metadata", () => {
  assert.equal(
    publicMachineMetadataDescription(machine("Legacy editorial copy")),
    publicMachineMetadataDescription(machine("Different legacy copy")),
  );
});

test("V2 metadata input needs only the current summary", () => {
  assert.equal(
    publicMachineMetadataDescription({ summary: { conditionSummary } }),
    conditionSummary,
  );
});

test("detail metadata uses the canonical helper and never reads expertSummary", () => {
  const page = readFileSync(
    new URL("../app/(sales)/may/[slug]/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(page, /publicMachineMetadataDescription\(machine\)/);
  assert.doesNotMatch(page, /machine\.expertSummary/);
});
