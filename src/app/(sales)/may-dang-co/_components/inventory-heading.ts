import type { InventoryFacets } from "@/data/machines/public-inventory-query";
import { facetOptions } from "./inventory-facet-options.ts";

/** Compose only unambiguous selected facets; retain the meaning of grouped labels. */
export function buildInventoryHeading(facets: InventoryFacets) {
  const family = facetOptions.family.find(option => option.value === facets.family)?.label.replace("MacBook", "Mac") ?? "Mac";
  const prefix = family === "iMac" ? "iMac" : "Mac";
  const singleLabel = (values: readonly string[], options: readonly { value: string; label: string }[]) =>
    values.length === 1 ? options.find(option => option.value === values[0])?.label : undefined;
  const descriptor = [
    family === "iMac" ? undefined : family.slice(prefix.length).trim(),
    singleLabel(facets.chip, facetOptions.chip),
    singleLabel(facets.ram, facetOptions.ram),
    singleLabel(facets.storage, facetOptions.storage),
  ].filter(Boolean).join(" ");
  return { prefix, descriptor, text: [prefix, descriptor, "đang có"].filter(Boolean).join(" ") };
}
