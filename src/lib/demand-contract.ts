export const DEMAND_REQUEST_SCHEMA = "mbmc.demand-request.v1" as const;
export const DESIRED_MACBOOK_SPEC_SCHEMA =
  "mbmc.desired-macbook-spec.v1" as const;
export const REQUIREMENT_SNAPSHOT_SCHEMA =
  "mbmc.requirement-derived.v1" as const;
export const INVENTORY_CONTEXT_SCHEMA = "mbmc.inventory-context.v1" as const;
export const ACQUISITION_SNAPSHOT_SCHEMA =
  "mbmc.demand-acquisition.v1" as const;

export type DemandSourceRoute = "chon_macbook" | "may_dang_co";
export type DesiredMacBookFamily = "air" | "pro";

export type DesiredMacBookSpecV1 = Readonly<{
  schemaVersion: typeof DESIRED_MACBOOK_SPEC_SCHEMA;
  family?: DesiredMacBookFamily;
  chip?: string;
  ramGb?: number;
  ssdGb?: number;
  screenSizeInches?: number;
  budget?: Readonly<{ minVnd?: number; maxVnd?: number }>;
  freeText?: string;
}>;

export type RequirementSnapshotV1 = Readonly<{
  schemaVersion: typeof REQUIREMENT_SNAPSHOT_SCHEMA;
  recommendationContractVersion: string;
  normalizedQuizAnswers: Readonly<object>;
  recommendationProfile: Readonly<object>;
}>;

export type InventoryContextSnapshotV1 = Readonly<{
  schemaVersion: typeof INVENTORY_CONTEXT_SCHEMA;
  sourceRoute: DemandSourceRoute;
  capturedAt: string;
  matcherState?: "empty" | "above-budget";
  searchText?: string;
  inventoryUrlState?: Readonly<object>;
  resultCount?: number;
}>;

export type AcquisitionSnapshotV1 = Readonly<{
  schemaVersion: typeof ACQUISITION_SNAPSHOT_SCHEMA;
  source: "organic" | "ctv_referral" | "unresolved_referral";
  referralCodeSnapshot?: string;
  referralEvidenceSnapshot?: string;
}>;

export type DemandRequestV1 = Readonly<{
  schemaVersion: typeof DEMAND_REQUEST_SCHEMA;
  submissionKey: string;
  sourceRoute: DemandSourceRoute;
  requirementSnapshot?: RequirementSnapshotV1;
  desiredSpecSnapshot?: DesiredMacBookSpecV1;
  inventoryContextSnapshot: InventoryContextSnapshotV1;
  acquisitionSnapshot: AcquisitionSnapshotV1;
}>;

type ValidationResult<T> =
  Readonly<{ ok: true; value: T }> | Readonly<{ ok: false; reason: string }>;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonBlank(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function positiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function nonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

export function parseDesiredMacBookSpecV1(
  value: unknown,
): ValidationResult<DesiredMacBookSpecV1> {
  if (!record(value) || value.schemaVersion !== DESIRED_MACBOOK_SPEC_SCHEMA) {
    return { ok: false, reason: "invalid_desired_spec_schema" };
  }
  const allowedKeys = new Set([
    "schemaVersion",
    "family",
    "chip",
    "ramGb",
    "ssdGb",
    "screenSizeInches",
    "budget",
    "freeText",
  ]);
  if (Object.keys(value).some((key) => !allowedKeys.has(key))) {
    return { ok: false, reason: "unsupported_desired_spec_field" };
  }
  if (
    value.family !== undefined &&
    value.family !== "air" &&
    value.family !== "pro"
  ) {
    return { ok: false, reason: "invalid_family" };
  }
  if (value.chip !== undefined && !nonBlank(value.chip, 80)) {
    return { ok: false, reason: "invalid_chip" };
  }
  for (const key of ["ramGb", "ssdGb", "screenSizeInches"] as const) {
    if (value[key] !== undefined && !positiveInteger(value[key])) {
      return { ok: false, reason: `invalid_${key}` };
    }
  }
  if (value.budget !== undefined) {
    if (!record(value.budget)) {
      return { ok: false, reason: "invalid_budget" };
    }
    const { minVnd, maxVnd } = value.budget;
    if (
      (minVnd !== undefined && !nonNegativeInteger(minVnd)) ||
      (maxVnd !== undefined && !nonNegativeInteger(maxVnd)) ||
      (minVnd !== undefined && maxVnd !== undefined && minVnd > maxVnd)
    ) {
      return { ok: false, reason: "invalid_budget" };
    }
  }
  if (value.freeText !== undefined && !nonBlank(value.freeText, 2_000)) {
    return { ok: false, reason: "invalid_free_text" };
  }
  const budget = record(value.budget)
    ? value.budget.minVnd !== undefined || value.budget.maxVnd !== undefined
    : false;
  const meaningful =
    value.family !== undefined ||
    value.chip !== undefined ||
    value.ramGb !== undefined ||
    value.ssdGb !== undefined ||
    value.screenSizeInches !== undefined ||
    budget ||
    value.freeText !== undefined;
  return meaningful
    ? { ok: true, value: value as DesiredMacBookSpecV1 }
    : { ok: false, reason: "empty_desired_spec" };
}

export function parseDemandRequestV1(
  value: unknown,
): ValidationResult<DemandRequestV1> {
  if (!record(value) || value.schemaVersion !== DEMAND_REQUEST_SCHEMA) {
    return { ok: false, reason: "invalid_demand_schema" };
  }
  if (!nonBlank(value.submissionKey, 128)) {
    return { ok: false, reason: "invalid_submission_key" };
  }
  if (
    value.sourceRoute !== "chon_macbook" &&
    value.sourceRoute !== "may_dang_co"
  ) {
    return { ok: false, reason: "invalid_source_route" };
  }
  const requirement = value.requirementSnapshot;
  if (
    requirement !== undefined &&
    (!record(requirement) ||
      requirement.schemaVersion !== REQUIREMENT_SNAPSHOT_SCHEMA ||
      !nonBlank(requirement.recommendationContractVersion, 100) ||
      !record(requirement.normalizedQuizAnswers) ||
      !record(requirement.recommendationProfile))
  ) {
    return { ok: false, reason: "invalid_requirement_snapshot" };
  }
  if (value.desiredSpecSnapshot !== undefined) {
    const desired = parseDesiredMacBookSpecV1(value.desiredSpecSnapshot);
    if (!desired.ok) return desired;
  }
  if (requirement === undefined && value.desiredSpecSnapshot === undefined) {
    return { ok: false, reason: "empty_demand" };
  }
  const inventory = value.inventoryContextSnapshot;
  if (
    !record(inventory) ||
    inventory.schemaVersion !== INVENTORY_CONTEXT_SCHEMA ||
    inventory.sourceRoute !== value.sourceRoute ||
    !nonBlank(inventory.capturedAt, 100) ||
    Number.isNaN(Date.parse(inventory.capturedAt))
  ) {
    return { ok: false, reason: "invalid_inventory_context" };
  }
  const acquisition = value.acquisitionSnapshot;
  if (
    !record(acquisition) ||
    acquisition.schemaVersion !== ACQUISITION_SNAPSHOT_SCHEMA ||
    !["organic", "ctv_referral", "unresolved_referral"].includes(
      String(acquisition.source),
    )
  ) {
    return { ok: false, reason: "invalid_acquisition_snapshot" };
  }
  if (
    (acquisition.source === "organic" &&
      (acquisition.referralCodeSnapshot !== undefined ||
        acquisition.referralEvidenceSnapshot !== undefined)) ||
    (acquisition.source === "ctv_referral" &&
      (typeof acquisition.referralCodeSnapshot !== "string" ||
        !/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/.test(
          acquisition.referralCodeSnapshot,
        ) ||
        acquisition.referralEvidenceSnapshot !== undefined)) ||
    (acquisition.source === "unresolved_referral" &&
      (!nonBlank(acquisition.referralEvidenceSnapshot, 64) ||
        acquisition.referralCodeSnapshot !== undefined))
  ) {
    return { ok: false, reason: "invalid_acquisition_snapshot" };
  }
  return { ok: true, value: value as DemandRequestV1 };
}
