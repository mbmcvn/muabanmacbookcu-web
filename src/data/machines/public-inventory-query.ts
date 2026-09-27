import type { PublicMachineSummaryV2 } from "../../lib/public-projection/contracts.ts";
import { formatCompactStorage } from "../../lib/presentation/machine.ts";
import { buildReferralShareUrl } from "../../lib/contact-routing.ts";
import {
  imacDisplayFacetValues,
  imacDisplayVariantForModelSpecKey,
  type ImacDisplayFacet,
} from "./imac-display-variant.ts";

export { imacDisplayFacetValues };

export const priceFacetValues = [
  "under-12",
  "12-15",
  "15-18",
  "over-18",
] as const;
export const familyFacetValues = ["air", "pro", "imac", "mini"] as const;
export const chipFacetValues = [
  "intel",
  "m1",
  "m1-pro-max",
  "m2",
  "m2-pro-max",
  "m3-plus",
] as const;
export const ramFacetValues = ["8", "16", "32-plus"] as const;
export const screenFacetValues = ["compact", "large"] as const;
export const storageTypeFacetValues = ["ssd", "fusion", "hdd"] as const;
export const storageFacetValues = ["256", "512", "1024-plus"] as const;
export const inventorySortValues = [
  "relevance",
  "newest",
  "price-asc",
  "price-desc",
] as const;

export type PriceFacet = (typeof priceFacetValues)[number];
export type FamilyFacet = (typeof familyFacetValues)[number];
export type ChipFacet = (typeof chipFacetValues)[number];
export type RamFacet = (typeof ramFacetValues)[number];
export type ScreenFacet = (typeof screenFacetValues)[number];
export type StorageTypeFacet = (typeof storageTypeFacetValues)[number];
export type StorageFacet = (typeof storageFacetValues)[number];
export type InventorySort = (typeof inventorySortValues)[number];
export type MultiFacetGroup = "chip" | "ram" | "screen" | "display" | "storageType" | "storage";
export type FacetGroup = "price" | "family" | MultiFacetGroup;

export interface InventoryFacets {
  price: PriceFacet | null;
  family: FamilyFacet | null;
  chip: ChipFacet[];
  ram: RamFacet[];
  screen: ScreenFacet[];
  display: ImacDisplayFacet[];
  storageType: StorageTypeFacet[];
  storage: StorageFacet[];
}

export interface InventoryUrlState {
  query: string;
  sort: InventorySort;
  facets: InventoryFacets;
}

export interface NormalizedPublicMachine {
  machine: PublicMachineSummaryV2;
  searchable: string;
  price: PriceFacet;
  family: FamilyFacet;
  chip: ChipFacet | null;
  ram: RamFacet | null;
  screen: ScreenFacet | null;
  display: ImacDisplayFacet | null;
  storageType: StorageTypeFacet;
  storage: StorageFacet;
}

export const emptyInventoryFacets = (): InventoryFacets => ({
  price: null,
  family: null,
  chip: [],
  ram: [],
  screen: [],
  display: [],
  storageType: [],
  storage: [],
});

export function selectMachineFamily(
  facets: InventoryFacets,
  family: FamilyFacet | null,
): InventoryFacets {
  return {
    ...facets,
    family,
    screen: [],
    display: [],
    storageType: [],
    storage: [],
  };
}

export function applicableInventoryFacetGroups(
  family: FamilyFacet | null,
): readonly FacetGroup[] {
  const common: FacetGroup[] = ["price", "family", "chip", "ram"];
  if (family === "air" || family === "pro") return [...common, "screen"];
  if (family === "imac") return [...common, "display", "storageType"];
  if (family === "mini") return [...common, "storage"];
  return common;
}

function sanitizeFamilyScopedFacets(facets: InventoryFacets): InventoryFacets {
  return {
    ...facets,
    screen:
      facets.family === "air" || facets.family === "pro" ? facets.screen : [],
    display: facets.family === "imac" ? facets.display : [],
    storageType: facets.family === "imac" ? facets.storageType : [],
    storage: facets.family === "mini" ? facets.storage : [],
  };
}

function includesValue<T extends string>(
  values: readonly T[],
  value: string,
): value is T {
  return values.includes(value as T);
}

export function normalizeChipFacet(chip: string | null): ChipFacet | null {
  const value = chip?.trim() ?? "";
  if (/\bintel\b/i.test(value)) return "intel";
  const generation = value.match(/\bM(\d+)\b/i);
  if (!generation) return null;
  const number = Number(generation[1]);
  const proOrMax = /\b(?:Pro|Max)\b/i.test(value);
  if (number === 1) return proOrMax ? "m1-pro-max" : "m1";
  if (number === 2) return proOrMax ? "m2-pro-max" : "m2";
  return number >= 3 ? "m3-plus" : null;
}

export function normalizeRamFacet(ramGb: number | null): RamFacet | null {
  if (ramGb === 8) return "8";
  if (ramGb === 16) return "16";
  return ramGb !== null && ramGb >= 32 ? "32-plus" : null;
}

function normalizeFamilyFacet(
  machineFamily: PublicMachineSummaryV2["machineFamily"],
  productLine: PublicMachineSummaryV2["productLine"],
): FamilyFacet {
  if (machineFamily === "macbook")
    return productLine === "macbook-air" ? "air" : "pro";
  return machineFamily === "imac" ? "imac" : "mini";
}

function normalizeStorageFacet(capacityGb: number): StorageFacet {
  if (capacityGb <= 256) return "256";
  if (capacityGb <= 512) return "512";
  return "1024-plus";
}

export function normalizeScreenFacet(displayName: string): ScreenFacet | null {
  const match = displayName.match(/\b(13|14|15|16)(?:[\s-]*(?:inch|in|"))\b/i);
  if (!match) return null;
  const inches = Number(match[1]);
  return inches <= 14 ? "compact" : "large";
}

function normalizePriceFacet(amount: number): PriceFacet {
  if (amount < 12_000_000) return "under-12";
  if (amount < 15_000_000) return "12-15";
  if (amount <= 18_000_000) return "15-18";
  return "over-18";
}

export function normalizePublicInventory(
  machines: Array<PublicMachineSummaryV2 & { modelSpecKey?: string | null }>,
): NormalizedPublicMachine[] {
  return machines.map((machine) => ({
    machine,
    searchable: [
      machine.displayName,
      machine.code,
      machine.machineFamily,
      machine.productLine,
      machine.chip,
      machine.ramGb === null ? "" : `${machine.ramGb}gb ram`,
      `${machine.storage.capacityGb}gb ${machine.storage.type} ${formatCompactStorage(machine.storage.capacityGb)} ${machine.storage.type === "fusion" ? "fusion drive" : machine.storage.type}`,
      machine.color,
    ]
      .join(" ")
      .toLocaleLowerCase("vi"),
    price: normalizePriceFacet(machine.price.amount),
    family: normalizeFamilyFacet(machine.machineFamily, machine.productLine),
    chip: normalizeChipFacet(machine.chip),
    ram: normalizeRamFacet(machine.ramGb),
    screen: "displaySizeInches" in machine.familyFacts && machine.familyFacts.displaySizeInches !== null
      ? machine.familyFacts.displaySizeInches <= 14 ? "compact" : "large"
      : normalizeScreenFacet(machine.displayName),
    display:
      machine.machineFamily === "imac"
        ? imacDisplayVariantForModelSpecKey(machine.modelSpecKey)
        : null,
    storageType: machine.storage.type,
    storage: normalizeStorageFacet(machine.storage.capacityGb),
  }));
}

function matchesSearch(item: NormalizedPublicMachine, query: string): boolean {
  const terms = query
    .toLocaleLowerCase("vi")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return terms.every((term) => item.searchable.includes(term));
}

function matchesFacets(
  item: NormalizedPublicMachine,
  facets: InventoryFacets,
): boolean {
  return (
    (facets.price === null || item.price === facets.price) &&
    (facets.family === null || item.family === facets.family) &&
    (!facets.chip.length ||
      (item.chip !== null && facets.chip.includes(item.chip))) &&
    (!facets.ram.length ||
      (item.ram !== null && facets.ram.includes(item.ram))) &&
    (!facets.screen.length ||
      (item.screen !== null && facets.screen.includes(item.screen))) &&
    (!facets.display.length ||
      (item.display !== null && facets.display.includes(item.display))) &&
    (!facets.storageType.length || facets.storageType.includes(item.storageType)) &&
    (!facets.storage.length || facets.storage.includes(item.storage))
  );
}

export function filterNormalizedPublicInventory(
  items: NormalizedPublicMachine[],
  query: string,
  facets: InventoryFacets,
): NormalizedPublicMachine[] {
  return items.filter(
    (item) => matchesSearch(item, query) && matchesFacets(item, facets),
  );
}

export function sortNormalizedPublicInventory(
  items: NormalizedPublicMachine[],
  sort: InventorySort,
): NormalizedPublicMachine[] {
  return items.toSorted((a, b) => {
    if (sort === "newest") {
      const order =
        Date.parse(b.machine.publishedAt ?? "") -
        Date.parse(a.machine.publishedAt ?? "");
      if (order) return order;
    }
    if (sort === "price-asc") {
      const order = a.machine.price.amount - b.machine.price.amount;
      if (order) return order;
    }
    if (sort === "price-desc") {
      const order = b.machine.price.amount - a.machine.price.amount;
      if (order) return order;
    }
    return a.machine.slug.localeCompare(b.machine.slug);
  });
}

export function countFacetOption(
  items: NormalizedPublicMachine[],
  query: string,
  facets: InventoryFacets,
  group: FacetGroup,
  option: string,
): number {
  const simulated: InventoryFacets = {
    ...facets,
    chip: [...facets.chip],
    ram: [...facets.ram],
    screen: [...facets.screen],
    display: [...facets.display],
    storageType: [...facets.storageType],
    storage: [...facets.storage],
  };
  if (group === "price") simulated.price = option as PriceFacet;
  else if (group === "family") return filterNormalizedPublicInventory(
    items,
    query,
    selectMachineFamily(simulated, option as FamilyFacet),
  ).length;
  else simulated[group] = [option] as never;
  return filterNormalizedPublicInventory(items, query, simulated).length;
}

export function countFamilyOption(
  items: NormalizedPublicMachine[],
  query: string,
  facets: InventoryFacets,
  family: FamilyFacet,
): number {
  return filterNormalizedPublicInventory(items, query, {
    ...selectMachineFamily(facets, family),
  }).length;
}

export function toggleMultiFacet<T extends MultiFacetGroup>(
  facets: InventoryFacets,
  group: T,
  option: InventoryFacets[T][number],
): InventoryFacets {
  const current = facets[group] as string[];
  const next = current.includes(option)
    ? current.filter((value) => value !== option)
    : [...current, option];
  return { ...facets, [group]: next };
}

export function removeFacetOption(
  facets: InventoryFacets,
  group: FacetGroup,
  option: string,
): InventoryFacets {
  if (group === "price") return { ...facets, price: null };
  if (group === "family") return selectMachineFamily(facets, null);
  return {
    ...facets,
    [group]: facets[group].filter((value) => value !== option),
  };
}

export function parseInventoryUrlState(
  params: URLSearchParams,
): InventoryUrlState {
  const parseList = <T extends string>(
    key: string,
    allowed: readonly T[],
  ): T[] => [
    ...new Set(
      (params.get(key) ?? "")
        .split(",")
        .filter((value) => includesValue(allowed, value)),
    ),
  ];
  const price = params.get("price") ?? "";
  const sort = params.get("sort") ?? "";
  const rawFamily = params.get("family") ?? "";
  const compatibilityFamily = rawFamily === "mac-mini" ? "mini" : null;
  const family = includesValue(familyFacetValues, rawFamily)
    ? rawFamily
    : compatibilityFamily;
  return {
    query: params.get("q")?.trim() ?? "",
    sort: includesValue(inventorySortValues, sort) ? sort : "relevance",
    facets: sanitizeFamilyScopedFacets({
      price: includesValue(priceFacetValues, price) ? price : null,
      family,
      chip: parseList("chip", chipFacetValues),
      ram: parseList("ram", ramFacetValues),
      screen: parseList("screen", screenFacetValues),
      display: parseList("display", imacDisplayFacetValues),
      storageType: parseList("storageType", storageTypeFacetValues),
      storage: parseList("storage", storageFacetValues),
    }),
  };
}

export function serializeInventoryUrlState(state: InventoryUrlState): string {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.facets.price) params.set("price", state.facets.price);
  if (state.facets.family) params.set("family", state.facets.family);
  for (const group of ["chip", "ram", "screen", "display", "storageType", "storage"] as const) {
    if (state.facets[group].length)
      params.set(group, state.facets[group].join(","));
  }
  if (state.sort !== "relevance") params.set("sort", state.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function buildInventoryShareUrl(
  origin: string,
  state: InventoryUrlState,
  referralCode: string | null,
): string {
  const canonical = new URL(
    `/may-dang-co${serializeInventoryUrlState(state)}`,
    origin,
  );
  return buildReferralShareUrl(canonical.toString(), referralCode);
}

export async function copyInventoryShareUrl(
  origin: string,
  state: InventoryUrlState,
  referralCode: string | null,
  writeText: (value: string) => Promise<void>,
): Promise<boolean> {
  try {
    await writeText(buildInventoryShareUrl(origin, state, referralCode));
    return true;
  } catch {
    return false;
  }
}

export function inventoryShareLabel(facets: InventoryFacets): string {
  const selected = [
    ...(facets.price ? [facets.price] : []),
    ...(facets.family ? [facets.family] : []),
    ...facets.chip,
    ...facets.ram,
    ...facets.screen,
    ...facets.display,
    ...facets.storageType,
    ...facets.storage,
  ];
  if (!selected.length || selected.length > 3) return "Sao chép liên kết";
  const family = facets.family
    ? [{ air: "Air", pro: "Pro", imac: "iMac", mini: "Mac mini" }[facets.family]]
    : [];
  const chip: Record<ChipFacet, string> = {
    intel: "Intel",
    m1: "M1",
    "m1-pro-max": "M1 Pro+",
    m2: "M2",
    "m2-pro-max": "M2 Pro+",
    "m3-plus": "M3+",
  };
  const rest = [
    ...(facets.price
      ? [
          {
            "under-12": "<12 triệu",
            "12-15": "12–15 triệu",
            "15-18": "15–18 triệu",
            "over-18": ">18 triệu",
          }[facets.price],
        ]
      : []),
    ...facets.ram.map((value) =>
      value === "32-plus" ? "32GB+" : `${value}GB`,
    ),
    ...facets.screen.map((value) =>
      value === "compact" ? '13–14"' : '15–16"',
    ),
    ...facets.display.map((value) =>
      ({
        "21.5": '21.5"',
        "21.5-4k": '21.5" 4K',
        "24-4.5k": '24" 4.5K',
        "27-5k": '27" 5K',
      })[value],
    ),
    ...facets.storageType.map((value) =>
      value === "fusion" ? "Fusion Drive" : value.toUpperCase(),
    ),
    ...facets.storage.map((value) =>
      value === "1024-plus" ? "1TB+" : `${value}GB`,
    ),
  ];
  const leading = [...family, ...facets.chip.map((value) => chip[value])].join(
    " ",
  );
  const detail = [leading, ...rest].filter(Boolean).join(" • ");
  return detail ? `Sao chép liên kết ${detail}` : "Sao chép liên kết";
}

// Kept for callers and regression tests using the original single quick-filter API.
export type PublicInventoryFilter =
  | "Tất cả"
  | "Dưới 12 triệu"
  | "12–15 triệu"
  | "15–18 triệu"
  | "Trên 18 triệu"
  | "MacBook Air"
  | "MacBook Pro"
  | "16GB RAM";
export type PublicInventorySort = InventorySort;

export function filterAndSortPublicInventory(
  machines: PublicMachineSummaryV2[],
  query: string,
  filter: PublicInventoryFilter,
  sort: PublicInventorySort,
) {
  const facets = emptyInventoryFacets();
  if (filter === "Dưới 12 triệu") facets.price = "under-12";
  if (filter === "12–15 triệu") facets.price = "12-15";
  if (filter === "15–18 triệu") facets.price = "15-18";
  if (filter === "Trên 18 triệu") facets.price = "over-18";
  if (filter === "MacBook Air") {
    facets.family = "air";
  }
  if (filter === "MacBook Pro") {
    facets.family = "pro";
  }
  if (filter === "16GB RAM") facets.ram = ["16"];
  return sortNormalizedPublicInventory(
    filterNormalizedPublicInventory(
      normalizePublicInventory(machines),
      query,
      facets,
    ),
    sort,
  ).map((item) => item.machine);
}
