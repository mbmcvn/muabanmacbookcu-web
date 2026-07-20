import type { Metadata } from "next";
import { getAvailableMachines } from "@/data/machines/get-available-machines";
import { InventoryPageView } from "./_components/InventoryPageView";
import { InventoryUnavailable } from "./_components/InventoryUnavailable";
import { loadPublicInventoryState } from "@/data/machines/public-inventory-load-state";

export const metadata: Metadata = { title: "Máy đang có", description: "Danh sách MacBook cũ đang có tại MBMC, kèm cấu hình và tình trạng công khai." };
export const revalidate = 60;

async function loadPublicMachines() {
  return loadPublicInventoryState(getAvailableMachines);
}

export default async function InventoryPage() {
  const state = await loadPublicMachines();
  return state.status === "ready"
    ? <InventoryPageView machines={state.machines} />
    : <div className="container inventory-page"><InventoryUnavailable /></div>;
}
