import type { PublicMachineSummaryV1 } from "../../lib/public-projection/contracts.ts";
import { formatCompactStorage } from "../../lib/presentation/machine.ts";

export const priceFacetValues = ["under-15", "15-18", "over-18"] as const;
export const familyFacetValues = ["air", "pro"] as const;
export const chipFacetValues = ["intel", "m1", "m1-pro-max", "m2", "m2-pro-max", "m3-plus"] as const;
export const ramFacetValues = ["8", "16", "32-plus"] as const;
export const screenFacetValues = ["compact", "large"] as const;
export const inventorySortValues = ["relevance", "newest", "price-asc", "price-desc"] as const;

export type PriceFacet = (typeof priceFacetValues)[number];
export type FamilyFacet = (typeof familyFacetValues)[number];
export type ChipFacet = (typeof chipFacetValues)[number];
export type RamFacet = (typeof ramFacetValues)[number];
export type ScreenFacet = (typeof screenFacetValues)[number];
export type InventorySort = (typeof inventorySortValues)[number];
export type MultiFacetGroup = "family" | "chip" | "ram" | "screen";
export type FacetGroup = "price" | MultiFacetGroup;

export interface InventoryFacets {
  price: PriceFacet | null;
  family: FamilyFacet[];
  chip: ChipFacet[];
  ram: RamFacet[];
  screen: ScreenFacet[];
}

export interface InventoryUrlState {
  query: string;
  sort: InventorySort;
  facets: InventoryFacets;
}

export interface NormalizedPublicMachine {
  machine: PublicMachineSummaryV1;
  searchable: string;
  price: PriceFacet;
  family: FamilyFacet | null;
  chip: ChipFacet | null;
  ram: RamFacet | null;
  screen: ScreenFacet | null;
}

export const emptyInventoryFacets = (): InventoryFacets => ({
  price: null,
  family: [],
  chip: [],
  ram: [],
  screen: [],
});

function includesValue<T extends string>(values: readonly T[], value: string): value is T {
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

export function normalizeScreenFacet(displayName: string): ScreenFacet | null {
  const match = displayName.match(/\b(13|14|15|16)(?:[\s-]*(?:inch|in|"))\b/i);
  if (!match) return null;
  const inches = Number(match[1]);
  return inches <= 14 ? "compact" : "large";
}

function normalizePriceFacet(amount: number): PriceFacet {
  if (amount < 15_000_000) return "under-15";
  if (amount <= 18_000_000) return "15-18";
  return "over-18";
}

export function normalizePublicInventory(machines: PublicMachineSummaryV1[]): NormalizedPublicMachine[] {
  return machines.map((machine) => ({
    machine,
    searchable: [
      machine.displayName,
      machine.code,
      machine.family,
      machine.chip,
      machine.ramGb === null ? "" : `${machine.ramGb}gb ram`,
      machine.ssdGb === null ? "" : `${machine.ssdGb}gb ssd ${formatCompactStorage(machine.ssdGb)} ssd`,
      machine.color,
    ].join(" ").toLocaleLowerCase("vi"),
    price: normalizePriceFacet(machine.price.amount),
    family: machine.family === "Air" ? "air" : machine.family === "Pro" ? "pro" : null,
    chip: normalizeChipFacet(machine.chip),
    ram: normalizeRamFacet(machine.ramGb),
    screen: normalizeScreenFacet(machine.displayName),
  }));
}

function matchesSearch(item: NormalizedPublicMachine, query: string): boolean {
  const terms = query.toLocaleLowerCase("vi").trim().split(/\s+/).filter(Boolean);
  return terms.every((term) => item.searchable.includes(term));
}

function matchesFacets(item: NormalizedPublicMachine, facets: InventoryFacets): boolean {
  return (
    (facets.price === null || item.price === facets.price) &&
    (!facets.family.length || (item.family !== null && facets.family.includes(item.family))) &&
    (!facets.chip.length || (item.chip !== null && facets.chip.includes(item.chip))) &&
    (!facets.ram.length || (item.ram !== null && facets.ram.includes(item.ram))) &&
    (!facets.screen.length || (item.screen !== null && facets.screen.includes(item.screen)))
  );
}

export function filterNormalizedPublicInventory(
  items: NormalizedPublicMachine[],
  query: string,
  facets: InventoryFacets,
): NormalizedPublicMachine[] {
  return items.filter((item) => matchesSearch(item, query) && matchesFacets(item, facets));
}

export function sortNormalizedPublicInventory(
  items: NormalizedPublicMachine[],
  sort: InventorySort,
): NormalizedPublicMachine[] {
  return items.toSorted((a, b) => {
    if (sort === "newest") {
      const order = Date.parse(b.machine.publishedAt ?? "") - Date.parse(a.machine.publishedAt ?? "");
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
    family: [...facets.family],
    chip: [...facets.chip],
    ram: [...facets.ram],
    screen: [...facets.screen],
  };
  if (group === "price") simulated.price = option as PriceFacet;
  else simulated[group] = [option] as never;
  return filterNormalizedPublicInventory(items, query, simulated).length;
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
  return { ...facets, [group]: facets[group].filter((value) => value !== option) };
}

export function parseInventoryUrlState(params: URLSearchParams): InventoryUrlState {
  const parseList = <T extends string>(key: string, allowed: readonly T[]): T[] =>
    [...new Set((params.get(key) ?? "").split(",").filter((value) => includesValue(allowed, value)))];
  const price = params.get("price") ?? "";
  const sort = params.get("sort") ?? "";
  return {
    query: params.get("q")?.trim() ?? "",
    sort: includesValue(inventorySortValues, sort) ? sort : "relevance",
    facets: {
      price: includesValue(priceFacetValues, price) ? price : null,
      family: parseList("family", familyFacetValues),
      chip: parseList("chip", chipFacetValues),
      ram: parseList("ram", ramFacetValues),
      screen: parseList("screen", screenFacetValues),
    },
  };
}

export function serializeInventoryUrlState(state: InventoryUrlState): string {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.facets.price) params.set("price", state.facets.price);
  for (const group of ["family", "chip", "ram", "screen"] as const) {
    if (state.facets[group].length) params.set(group, state.facets[group].join(","));
  }
  if (state.sort !== "relevance") params.set("sort", state.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

// Kept for callers and regression tests using the original single quick-filter API.
export type PublicInventoryFilter = "Tất cả" | "Dưới 15 triệu" | "15–18 triệu" | "Trên 18 triệu" | "MacBook Air" | "MacBook Pro" | "16GB RAM";
export type PublicInventorySort = InventorySort;

export function filterAndSortPublicInventory(
  machines: PublicMachineSummaryV1[],
  query: string,
  filter: PublicInventoryFilter,
  sort: PublicInventorySort,
) {
  const facets = emptyInventoryFacets();
  if (filter === "Dưới 15 triệu") facets.price = "under-15";
  if (filter === "15–18 triệu") facets.price = "15-18";
  if (filter === "Trên 18 triệu") facets.price = "over-18";
  if (filter === "MacBook Air") facets.family = ["air"];
  if (filter === "MacBook Pro") facets.family = ["pro"];
  if (filter === "16GB RAM") facets.ram = ["16"];
  return sortNormalizedPublicInventory(
    filterNormalizedPublicInventory(normalizePublicInventory(machines), query, facets),
    sort,
  ).map((item) => item.machine);
}
