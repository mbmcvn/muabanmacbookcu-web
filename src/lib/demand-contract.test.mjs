import assert from "node:assert/strict";
import test from "node:test";
import {
  ACQUISITION_SNAPSHOT_SCHEMA,
  DEMAND_REQUEST_SCHEMA,
  DESIRED_MACBOOK_SPEC_SCHEMA,
  INVENTORY_CONTEXT_SCHEMA,
  REQUIREMENT_SNAPSHOT_SCHEMA,
  parseDemandRequestV1,
  parseDesiredMacBookSpecV1,
} from "./demand-contract.ts";

const context = {
  schemaVersion: INVENTORY_CONTEXT_SCHEMA,
  sourceRoute: "chon_macbook",
  capturedAt: "2026-08-14T10:00:00.000Z",
  matcherState: "empty",
};
const acquisition = {
  schemaVersion: ACQUISITION_SNAPSHOT_SCHEMA,
  source: "organic",
};
const requirement = {
  schemaVersion: REQUIREMENT_SNAPSHOT_SCHEMA,
  recommendationContractVersion: "chon-macbook.v1",
  normalizedQuizAnswers: { uses: ["office"] },
  recommendationProfile: { technical: { minimumRamGb: 8 } },
};
const desired = {
  schemaVersion: DESIRED_MACBOOK_SPEC_SCHEMA,
  family: "pro",
  chip: "M2 Pro",
  ramGb: 16,
  ssdGb: 512,
  screenSizeInches: 14,
};
const request = (overrides = {}) => ({
  schemaVersion: DEMAND_REQUEST_SCHEMA,
  submissionKey: "96b18852-4d54-4fd7-928b-2f240ce8ff0f",
  sourceRoute: "chon_macbook",
  inventoryContextSnapshot: context,
  acquisitionSnapshot: acquisition,
  ...overrides,
});

test("requirement-only, desired-only, and combined demand are valid", () => {
  assert.equal(parseDemandRequestV1(request({ requirementSnapshot: requirement })).ok, true);
  assert.equal(parseDemandRequestV1(request({ desiredSpecSnapshot: desired })).ok, true);
  assert.equal(
    parseDemandRequestV1(request({ requirementSnapshot: requirement, desiredSpecSnapshot: desired })).ok,
    true,
  );
});

test("empty demand and unknown schema versions fail closed", () => {
  assert.deepEqual(parseDemandRequestV1(request()), { ok: false, reason: "empty_demand" });
  assert.equal(parseDemandRequestV1({ ...request({ requirementSnapshot: requirement }), schemaVersion: "future" }).ok, false);
  assert.equal(parseDesiredMacBookSpecV1({ ...desired, schemaVersion: "future" }).ok, false);
});

test("desired spec uses exact canonical facts rather than inventory buckets", () => {
  assert.equal(parseDesiredMacBookSpecV1(desired).ok, true);
  assert.deepEqual(
    parseDesiredMacBookSpecV1({
      schemaVersion: DESIRED_MACBOOK_SPEC_SCHEMA,
      family: "pro",
      ram: "32-plus",
    }),
    { ok: false, reason: "unsupported_desired_spec_field" },
  );
  assert.deepEqual(
    parseDesiredMacBookSpecV1({ schemaVersion: DESIRED_MACBOOK_SPEC_SCHEMA }),
    { ok: false, reason: "empty_desired_spec" },
  );
});

test("acquisition provenance distinguishes valid, organic, and unresolved referral evidence", () => {
  const validReferral = request({
    requirementSnapshot: requirement,
    acquisitionSnapshot: {
      schemaVersion: ACQUISITION_SNAPSHOT_SCHEMA,
      source: "ctv_referral",
      referralCodeSnapshot: "XMG4",
    },
  });
  const unresolved = request({
    requirementSnapshot: requirement,
    acquisitionSnapshot: {
      schemaVersion: ACQUISITION_SNAPSHOT_SCHEMA,
      source: "unresolved_referral",
      referralEvidenceSnapshot: "ABCD",
    },
  });
  assert.equal(parseDemandRequestV1(validReferral).ok, true);
  assert.equal(parseDemandRequestV1(unresolved).ok, true);
  assert.equal(
    parseDemandRequestV1({
      ...validReferral,
      acquisitionSnapshot: { ...acquisition, referralCodeSnapshot: "XMG4" },
    }).ok,
    false,
  );
});
