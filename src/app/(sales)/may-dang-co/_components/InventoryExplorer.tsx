"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicMachineSummaryV1 } from "@/models";
import {
  chipFacetValues,
  countFacetOption,
  emptyInventoryFacets,
  familyFacetValues,
  filterNormalizedPublicInventory,
  normalizePublicInventory,
  parseInventoryUrlState,
  priceFacetValues,
  ramFacetValues,
  removeFacetOption,
  screenFacetValues,
  serializeInventoryUrlState,
  sortNormalizedPublicInventory,
  type FacetGroup,
  type InventoryUrlState,
  type MultiFacetGroup,
} from "@/data/machines/public-inventory-query";
import { InventoryEmptyState } from "./InventoryEmptyState";
import { InventoryFilters, type FacetCountMap } from "./InventoryFilters";
import { InventoryToolbar } from "./InventoryToolbar";
import { MachineCatalog } from "./MachineCatalog";

const defaultState = (): InventoryUrlState => ({
  query: "",
  sort: "relevance",
  facets: emptyInventoryFacets(),
});

export function InventoryExplorer({ machines }: { machines: PublicMachineSummaryV1[] }) {
  const [state, setState] = useState<InventoryUrlState>(defaultState);
  const normalized = useMemo(() => normalizePublicInventory(machines), [machines]);

  useEffect(() => {
    const readUrl = () => setState(parseInventoryUrlState(new URLSearchParams(window.location.search)));
    readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, []);

  const commit = (next: InventoryUrlState, mode: "push" | "replace" = "push") => {
    setState(next);
    const url = `${window.location.pathname}${serializeInventoryUrlState(next)}${window.location.hash}`;
    window.history[mode === "push" ? "pushState" : "replaceState"](null, "", url);
  };

  const filtered = useMemo(
    () => filterNormalizedPublicInventory(normalized, state.query, state.facets),
    [normalized, state.facets, state.query],
  );
  const results = useMemo(
    () => sortNormalizedPublicInventory(filtered, state.sort).map((item) => item.machine),
    [filtered, state.sort],
  );
  const counts = useMemo(() => {
    const next: FacetCountMap = {};
    const groups = {
      price: priceFacetValues,
      family: familyFacetValues,
      chip: chipFacetValues,
      ram: ramFacetValues,
      screen: screenFacetValues,
    } as const;
    for (const [group, options] of Object.entries(groups)) {
      for (const option of options) {
        next[`${group}:${option}`] = countFacetOption(
          normalized,
          state.query,
          state.facets,
          group as FacetGroup,
          option,
        );
      }
    }
    return next;
  }, [normalized, state.facets, state.query]);
  const showModernChip = normalized.some((item) => item.chip === "m3-plus");

  return <>
    <div className="inventory-controls">
      <label className="search-field" htmlFor="inventory-search">
        <span className="visually-hidden">Tìm trong danh sách máy</span>
        <span aria-hidden="true">⌕</span>
        <input
          id="inventory-search"
          type="search"
          placeholder="Tìm theo model, chip, RAM, màu…"
          value={state.query}
          onChange={(event) => commit({ ...state, query: event.target.value }, "replace")}
        />
      </label>
      <InventoryFilters
        facets={state.facets}
        sort={state.sort}
        counts={counts}
        showModernChip={showModernChip}
        onPriceChange={(price) => commit({ ...state, facets: { ...state.facets, price } })}
        onMultiChange={(group: MultiFacetGroup, values: string[]) => commit({
          ...state,
          facets: { ...state.facets, [group]: values },
        })}
        onSortChange={(sort) => commit({ ...state, sort })}
        onRemove={(group, value) => commit({
          ...state,
          facets: removeFacetOption(state.facets, group, value),
        })}
        onClearAll={() => commit({ ...state, facets: emptyInventoryFacets() })}
      />
    </div>
    <InventoryToolbar
      total={results.length}
      sort={state.sort}
      onSortChange={(sort) => commit({ ...state, sort })}
    />
    {results.length ? <MachineCatalog machines={results} /> : <InventoryEmptyState />}
  </>;
}
