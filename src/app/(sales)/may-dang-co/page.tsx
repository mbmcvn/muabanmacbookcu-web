import { parseInventoryUrlState } from "@/data/machines/public-inventory-query";
import type { Metadata } from "next";
import { getAvailableMachines } from "@/data/machines/get-available-machines";
import { InventoryPageView } from "./_components/InventoryPageView";
import { InventoryUnavailable } from "./_components/InventoryUnavailable";
import { loadPublicInventoryState } from "@/data/machines/public-inventory-load-state";

export const metadata: Metadata = { title: "Mac đang có", description: "Danh sách Mac cũ đang có tại MBMC, kèm cấu hình và tình trạng công khai." };
export const revalidate = 60;

async function loadPublicMachines() {
  return loadPublicInventoryState(getAvailableMachines);
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const entry of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, entry);
  }
  const initialState = parseInventoryUrlState(params);
  const state = await loadPublicMachines();
  return state.status === "ready"
    ? <InventoryPageView machines={state.machines} initialState={initialState} />
    : <div className="container inventory-page"><InventoryUnavailable /></div>;
}
