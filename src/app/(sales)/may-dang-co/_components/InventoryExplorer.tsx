"use client";

import { useMemo, useState } from "react";
import type { PublicMachineCard } from "@/models";
import { InventoryEmptyState } from "./InventoryEmptyState";
import { InventoryFilters, type QuickFilter } from "./InventoryFilters";
import { InventoryToolbar, type InventorySort } from "./InventoryToolbar";
import { MachineCatalog } from "./MachineCatalog";

function matchesFilter(machine: PublicMachineCard, filter: QuickFilter): boolean {
  if (filter === "Dưới 15 triệu") return machine.price < 15_000_000;
  if (filter === "15–18 triệu") return machine.price >= 15_000_000 && machine.price <= 18_000_000;
  if (filter === "Trên 18 triệu") return machine.price > 18_000_000;
  if (filter === "MacBook Air") return machine.title.includes("MacBook Air");
  if (filter === "MacBook Pro") return machine.title.includes("MacBook Pro");
  if (filter === "16GB RAM") return machine.ramGb === 16;
  return true;
}

export function InventoryExplorer({ machines }: { machines: PublicMachineCard[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QuickFilter>("Tất cả");
  const [sort, setSort] = useState<InventorySort>("relevance");
  const results = useMemo(() => {
    const terms = query.toLocaleLowerCase("vi").trim().split(/\s+/).filter(Boolean);
    const filtered = machines.filter((machine) => {
      const searchable = `${machine.title} ${machine.color ?? ""} ${machine.machineId} ${machine.chip ?? ""} ${machine.ramGb ?? ""} ${machine.storageGb ?? ""}`.toLocaleLowerCase("vi");
      return terms.every((term) => searchable.includes(term)) && matchesFilter(machine, filter);
    });
    return filtered.toSorted((a, b) => sort === "newest" ? Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? "") : sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0);
  }, [filter, machines, query, sort]);
  return <><div className="inventory-controls"><label className="search-field" htmlFor="inventory-search"><span className="visually-hidden">Tìm trong danh sách máy</span><span aria-hidden="true">⌕</span><input id="inventory-search" type="search" placeholder="Tìm theo model, chip, RAM, màu…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><InventoryFilters active={filter} onChange={setFilter} /></div><InventoryToolbar total={results.length} sort={sort} onSortChange={setSort} />{results.length ? <MachineCatalog machines={results} /> : <InventoryEmptyState />}</>;
}
