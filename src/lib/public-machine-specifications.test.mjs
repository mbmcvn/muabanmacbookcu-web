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
    key: "MacBookAir10,1",
    label: "Test model",
    family: "MacBook Air",
    releaseYear: 2020,
    screenSizeInches: 13.3,
    chipFamily: "M1",
    specifications: {
      displaySize: "13,3 inch",
      displayType: "Retina",
      ports: ["2 × Thunderbolt / USB 4", "3,5 mm"],
      touchId: true,
    },
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

test("canonical known key resolves the reviewed Apple specification entry", () => {
  const model = resolveModelSpecifications("macbook-air-13-m2-2022");
  assert.equal(model?.displaySize, "13,6 inch");
  assert.equal(model?.displayResolution, "2560 × 1664 pixel, 224 ppi");
});

test("null and unknown keys resolve no model specifications", () => {
  assert.equal(resolveModelSpecifications(null), null);
  assert.equal(resolveModelSpecifications("unknown-model"), null);
});

test("RAM SSD and color do not participate in exact model resolution", () => {
  const first = buildPublicMachineSpecifications({
    exactModelIdentifier: "macbook-air-13-m2-2022",
    machine: { ram: "8 GB", storage: "256 GB", color: "Midnight" },
  });
  const second = buildPublicMachineSpecifications({
    exactModelIdentifier: "macbook-air-13-m2-2022",
    machine: { ram: "24 GB", storage: "2 TB", color: "Bạc" },
  });
  assert.deepEqual(first.model, second.model);
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
