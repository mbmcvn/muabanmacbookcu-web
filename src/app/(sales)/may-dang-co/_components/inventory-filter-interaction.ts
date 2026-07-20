import type { FacetGroup } from "../../../../data/machines/public-inventory-query.ts";

export type FilterControlGroup = FacetGroup | "sort";
export type OpenFilter = FilterControlGroup | null;

export function nextOpenFilter(current: OpenFilter, requested: FilterControlGroup): OpenFilter {
  return current === requested ? null : requested;
}

export function selectionKeepsFilterOpen(group: FacetGroup): boolean {
  return group !== "price";
}

export function selectFacetValues(
  current: string[],
  value: string,
  mobileSingleSelect: boolean,
): string[] {
  if (mobileSingleSelect) return current.includes(value) ? [] : [value];
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}
