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

export type ModelSpecKey = "macbook-air-13-m2-2022";

export type ModelSpecCatalogEntry = {
  key: ModelSpecKey;
  label: string;
  family: "MacBook Air" | "MacBook Pro";
  releaseYear: number;
  screenSizeInches: number;
  chipFamily: string;
  specifications: Readonly<ModelSpecifications>;
};

export type PublicMachineSpecifications = {
  machine: MachineSpecificFacts;
  model: ModelSpecifications | null;
};

export type ModelSpecificationCatalog = Readonly<Record<string, Readonly<ModelSpecCatalogEntry>>>;

export const MODEL_SPECIFICATION_CATALOG: ModelSpecificationCatalog = {
  "macbook-air-13-m2-2022": {
    key: "macbook-air-13-m2-2022",
    label: "MacBook Air 13 inch M2 (2022)",
    family: "MacBook Air",
    releaseYear: 2022,
    screenSizeInches: 13.6,
    chipFamily: "Apple M2",
    specifications: {
      displaySize: "13,6 inch",
      displayType: "Liquid Retina (LED nền, IPS)",
      displayResolution: "2560 × 1664 pixel, 224 ppi",
      ports: ["MagSafe 3", "2 × Thunderbolt / USB 4", "3,5 mm"],
      wifi: "Wi‑Fi 6 (802.11ax)",
      bluetooth: "Bluetooth 5.3",
      camera: "FaceTime HD 1080p",
      touchId: true,
      weight: "1,24 kg",
      compatibleCharger: "USB‑C 30W hoặc 35W; hỗ trợ sạc nhanh với 70W",
    },
  },
};

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
  return normalizeModelSpecifications(catalog[identifier].specifications);
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
