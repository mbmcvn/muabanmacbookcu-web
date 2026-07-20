"use client";

import { useMemo, useState } from "react";
import type { PublicMachineSummaryV1 } from "@/models";
import { InventoryEmptyState } from "./InventoryEmptyState";
import { InventoryFilters, type QuickFilter } from "./InventoryFilters";
import { InventoryToolbar, type InventorySort } from "./InventoryToolbar";
import { MachineCatalog } from "./MachineCatalog";
import { filterAndSortPublicInventory } from "@/data/machines/public-inventory-query";

export function InventoryExplorer({ machines }: { machines: PublicMachineSummaryV1[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("Tất cả");
  const [sort, setSort] = useState<InventorySort>("relevance");
  const results = useMemo(
    () => filterAndSortPublicInventory(machines, query, filter, sort),
    [filter, machines, query, sort],
  );
  return <><div className="inventory-controls"><label className="search-field" htmlFor="inventory-search"><span className="visually-hidden">Tìm trong danh sách máy</span><span aria-hidden="true">⌕</span><input id="inventory-search" type="search" placeholder="Tìm theo model, chip, RAM, màu…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><InventoryFilters active={filter} onChange={setFilter} /></div><InventoryToolbar total={results.length} sort={sort} onSortChange={setSort} />{results.length ? <MachineCatalog machines={results} /> : <InventoryEmptyState />}</>;
}