export type MachineSpecificFacts = {
  chip?: string | null;
  cpu?: string | null;
  gpu?: string | null;
  ram?: string | null;
  storage?: string | null;
  color?: string | null;
  keyboardLayout?: string | null;
  currentOs?: string | null;
};

export type ModelSpecifications = {
  displaySize?: string | null;
  displayType?: string | null;
  displayResolution?: string | null;
  ports?: string[] | null;
  wifi?: string | null;
  bluetooth?: string | null;
  camera?: string | null;
  touchId?: boolean | null;
  weight?: string | null;
  compatibleCharger?: string | null;
};

export type PublicMachineSpecifications = {
  machine: MachineSpecificFacts;
  model: ModelSpecifications | null;
};

export type ModelSpecificationCatalog = Readonly<
  Record<string, Readonly<ModelSpecifications>>
>;

// No stable exact model identifier is currently projected. Keep this catalog
// empty until records can resolve a reviewed entry by exact key.
export const MODEL_SPECIFICATION_CATALOG: ModelSpecificationCatalog = {};

function clean(value: string | null | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanList(value: string[] | null | undefined): string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.map(clean).filter((item): item is string => item !== null);
  return items.length ? items : null;
}

export function normalizeMachineSpecificFacts(
  facts: MachineSpecificFacts,
): MachineSpecificFacts {
  return {
    chip: clean(facts.chip),
    cpu: clean(facts.cpu),
    gpu: clean(facts.gpu),
    ram: clean(facts.ram),
    storage: clean(facts.storage),
    color: clean(facts.color),
    keyboardLayout: clean(facts.keyboardLayout),
    currentOs: clean(facts.currentOs),
  };
}

export function normalizeModelSpecifications(
  specifications: ModelSpecifications,
): ModelSpecifications {
  return {
    displaySize: clean(specifications.displaySize),
    displayType: clean(specifications.displayType),
    displayResolution: clean(specifications.displayResolution),
    ports: cleanList(specifications.ports),
    wifi: clean(specifications.wifi),
    bluetooth: clean(specifications.bluetooth),
    camera: clean(specifications.camera),
    touchId:
      typeof specifications.touchId === "boolean"
        ? specifications.touchId
        : null,
    weight: clean(specifications.weight),
    compatibleCharger: clean(specifications.compatibleCharger),
  };
}

export function resolveModelSpecifications(
  exactModelIdentifier: string | null | undefined,
  catalog: ModelSpecificationCatalog = MODEL_SPECIFICATION_CATALOG,
): ModelSpecifications | null {
  const identifier = clean(exactModelIdentifier);
  if (!identifier || !Object.prototype.hasOwnProperty.call(catalog, identifier)) {
    return null;
  }
  return normalizeModelSpecifications(catalog[identifier]);
}

export function buildPublicMachineSpecifications(input: {
  machine: MachineSpecificFacts;
  exactModelIdentifier?: string | null;
  catalog?: ModelSpecificationCatalog;
}): PublicMachineSpecifications {
  return {
    machine: normalizeMachineSpecificFacts(input.machine),
    model: resolveModelSpecifications(
      input.exactModelIdentifier,
      input.catalog ?? MODEL_SPECIFICATION_CATALOG,
    ),
  };
}
