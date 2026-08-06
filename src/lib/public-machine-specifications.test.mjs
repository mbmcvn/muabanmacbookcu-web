import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildPublicMachineSpecifications,
  resolveModelSpecifications,
} from "./public-machine-specifications.ts";
import {
  buildSpecificationGroups,
  buildSpecificationSummary,
} from "../app/(sales)/may/[slug]/_components/technical-specifications-presentation.ts";

const catalog = {
  "MacBookAir10,1": {
    displaySize: "13,3 inch",
    displayType: "Retina",
    ports: ["2 × Thunderbolt / USB 4", "3,5 mm"],
    touchId: true,
  },
};

test("empty values and empty groups are omitted", () => {
  const specifications = buildPublicMachineSpecifications({
    machine: { chip: " M1 ", ram: "", color: null },
  });
  assert.deepEqual(buildSpecificationSummary(specifications), [
    { label: "Chip", value: "M1" },
  ]);
  assert.deepEqual(
    buildSpecificationGroups(specifications).map((group) => group.title),
    ["Hiệu năng"],
  );
});

test("the whole section has no groups when no specifications exist", () => {
  const specifications = buildPublicMachineSpecifications({ machine: {} });
  assert.deepEqual(buildSpecificationGroups(specifications), []);
  assert.deepEqual(buildSpecificationSummary(specifications), []);
});

test("machine facts and exact model specifications merge into groups", () => {
  const specifications = buildPublicMachineSpecifications({
    machine: { chip: "M1", ram: "16 GB", color: "Bạc" },
    exactModelIdentifier: "MacBookAir10,1",
    catalog,
  });
  assert.equal(specifications.model?.displayType, "Retina");
  assert.deepEqual(
    buildSpecificationGroups(specifications).map((group) => group.title),
    ["Hiệu năng", "Màn hình", "Kết nối", "Thiết kế và tiện ích"],
  );
});

test("exact model mapping never falls back to a similar public title", () => {
  assert.equal(resolveModelSpecifications("MacBookAir10,1", catalog)?.displayType, "Retina");
  assert.equal(resolveModelSpecifications("MacBook Air M1 2020 13 inch", catalog), null);
  assert.equal(resolveModelSpecifications("macbookair10,1", catalog), null);
});

test("accordion exposes button semantics and accessible state", () => {
  const source = readFileSync(
    new URL("../app/(sales)/may/[slug]/_components/PublicSpecifications.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<button[^>]+type="button"[^>]+aria-expanded=\{isOpen\}/);
  assert.match(source, /aria-controls=\{panelId\}/);
  assert.match(source, /hidden=\{!isOpen\}/);
});
