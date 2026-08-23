import assert from "node:assert/strict";
import test from "node:test";
import { publicSuitableAudiencesV0 } from "./public-suitable-audiences-v0.ts";

test("website sync maps aliases to the five-value public vocabulary", () => {
  assert.deepEqual(publicSuitableAudiencesV0(["general"]), ["general"]);
  assert.deepEqual(publicSuitableAudiencesV0(["office"]), ["general"]);
  assert.deepEqual(publicSuitableAudiencesV0(["student"]), ["general"]);
  assert.deepEqual(publicSuitableAudiencesV0(["developer"]), ["developer"]);
  assert.deepEqual(publicSuitableAudiencesV0(["creative"]), ["creative"]);
  assert.deepEqual(publicSuitableAudiencesV0(["heavy_workload"]), ["heavy"]);
  assert.deepEqual(publicSuitableAudiencesV0(["storage_heavy"]), [
    "storage_heavy",
  ]);
});

test("website sync deduplicates and uses canonical public order", () => {
  assert.deepEqual(
    publicSuitableAudiencesV0([
      "storage_heavy",
      "student",
      "creative",
      "office",
      "developer",
      "general",
      "heavy_workload",
    ]),
    ["general", "developer", "creative", "heavy", "storage_heavy"],
  );
});

test("unknown public payload values are ignored without alias leakage", () => {
  assert.deepEqual(publicSuitableAudiencesV0(["unknown", "heavy"]), []);
});
