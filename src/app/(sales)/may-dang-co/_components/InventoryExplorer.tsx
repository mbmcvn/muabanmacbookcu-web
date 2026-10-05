"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicMachineSummaryV2 } from "@/models";
import {
  applicableInventoryFacetGroups,
  chipFacetValues,
  countFacetOption,
  emptyInventoryFacets,
  filterNormalizedPublicInventory,
  normalizePublicInventory,
  parseInventoryUrlState,
  priceFacetValues,
  familyFacetValues,
  imacDisplayFacetValues,
  ramFacetValues,
  removeFacetOption,
  screenFacetValues,
  selectMachineFamily,
  storageFacetValues,
  storageTypeFacetValues,
  serializeInventoryUrlState,
  sortNormalizedPublicInventory,
  type FacetGroup,
  type InventoryUrlState,
  type MultiFacetGroup,
} from "@/data/machines/public-inventory-query";
import { InventoryIntro } from "./InventoryIntro";
import { NoPublishedMachinesState } from "./InventoryEmptyState";
import { InventoryEmptyState } from "./InventoryEmptyState";
import { InventoryFilters, type FacetCountMap } from "./InventoryFilters";
import { InventoryToolbar } from "./InventoryToolbar";
import { MachineCatalog } from "./MachineCatalog";
import {
  useContactChannel,
  withContactChannel,
  resolveContactChannel,
} from "@/hooks/useContactChannel";
import { referralForQueryUpdate } from "@/lib/contact-routing";
import { CopyInventoryLink } from "@/components/contact/CopyInventoryLink";
import { DesiredSpecDemand } from "./DesiredSpecDemand";

const defaultState = (): InventoryUrlState => ({
  query: "",
  sort: "relevance",
  facets: emptyInventoryFacets(),
});

export function InventoryExplorer({
  machines,
  initialState,
}: {
  machines: PublicMachineSummaryV2[];
  initialState?: InventoryUrlState;
}) {
  const { channel, referralEvidence, shareReferralCode } = useContactChannel();
  const [state, setState] = useState<InventoryUrlState>(() => initialState ?? defaultState());
  const normalized = useMemo(
    () => normalizePublicInventory(machines),
    [machines],
  );

  useEffect(() => {
    const readUrl = () =>
      setState(
        parseInventoryUrlState(new URLSearchParams(window.location.search)),
      );
    readUrl();
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, []);

  const commit = (
    next: InventoryUrlState,
    mode: "push" | "replace" = "push",
  ) => {
    setState(next);
    const currentSearch = window.location.search;
    const requestedChannel = resolveContactChannel(new URLSearchParams(currentSearch).get("channel")) ?? channel;
    const preservedRef = referralForQueryUpdate(currentSearch, shareReferralCode);
    const url = `${withContactChannel(`${window.location.pathname}${serializeInventoryUrlState(next)}`, requestedChannel, preservedRef)}${window.location.hash}`;
    window.history[mode === "push" ? "pushState" : "replaceState"](
      null,
      "",
      url,
    );
  };

  const filtered = useMemo(
    () =>
      filterNormalizedPublicInventory(normalized, state.query, state.facets),
    [normalized, state.facets, state.query],
  );
  const results = useMemo(
    () =>
      sortNormalizedPublicInventory(filtered, state.sort).map(
        (item) => item.machine,
      ),
    [filtered, state.sort],
  );
  const counts = useMemo(() => {
    const next: FacetCountMap = {};
    const optionsByGroup = {
      price: priceFacetValues,
      family: familyFacetValues,
      chip: chipFacetValues,
      ram: ramFacetValues,
      screen: screenFacetValues,
      display: imacDisplayFacetValues,
      storageType: storageTypeFacetValues,
      storage: storageFacetValues,
    } as const;
    for (const group of applicableInventoryFacetGroups(state.facets.family)) {
      for (const option of optionsByGroup[group]) {
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

  return (
    <>
      <InventoryIntro total={results.length} facets={state.facets} />
      {machines.length ? (
        <>
          <div className="inventory-controls">
            <label className="search-field" htmlFor="inventory-search">
              <span className="visually-hidden">Tìm trong danh sách máy</span>
              <span aria-hidden="true">⌕</span>
              <input
                id="inventory-search"
                type="search"
                placeholder="Tìm model, chip, RAM, SSD, Fusion Drive, HDD…"
                value={state.query}
                onChange={(event) =>
                  commit({ ...state, query: event.target.value }, "replace")
                }
              />
            </label>
            <InventoryFilters
              facets={state.facets}
              sort={state.sort}
              counts={counts}
              showModernChip={showModernChip}
              onPriceChange={(price) =>
                commit({ ...state, facets: { ...state.facets, price } })
              }
              onFamilyChange={(family) =>
                commit({
                  ...state,
                  facets: selectMachineFamily(state.facets, family),
                })
              }
              onMultiChange={(group: MultiFacetGroup, values: string[]) =>
                commit({
                  ...state,
                  facets: { ...state.facets, [group]: values },
                })
              }
              onSortChange={(sort) => commit({ ...state, sort })}
              onRemove={(group, value) =>
                commit({
                  ...state,
                  facets: removeFacetOption(state.facets, group, value),
                })
              }
              onClearAll={() =>
                commit({ ...state, facets: emptyInventoryFacets() })
              }
              shareAction={<CopyInventoryLink state={state} />}
            />
          </div>
          <InventoryToolbar
            total={results.length}
            sort={state.sort}
            onSortChange={(sort) => commit({ ...state, sort })}
          />
          {results.length ? (
            <MachineCatalog machines={results} />
          ) : (
            <>
              <InventoryEmptyState />
              <DesiredSpecDemand
                state={state}
                referralEvidence={referralEvidence}
              />
            </>
          )}
        </>
      ) : <NoPublishedMachinesState />}
    </>
  );
}
