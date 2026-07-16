import type { Metadata } from "next";
import { getAvailableMachines } from "@/data/machines/get-available-machines";
import { InventoryPageView } from "./_components/InventoryPageView";
import { InventoryUnavailable } from "./_components/InventoryUnavailable";

export const metadata: Metadata = { title: "Máy đang có", description: "Danh sách MacBook cũ đang có tại MBMC, kèm cấu hình và tình trạng công khai." };
export const revalidate = 60;

async function loadPublicMachines() {
  try {
    return await getAvailableMachines();
  } catch {
    return null;
  }
}

export default async function InventoryPage() {
  const machines = await loadPublicMachines();
  return machines
    ? <InventoryPageView machines={machines} />
    : <div className="container inventory-page"><InventoryUnavailable /></div>;
}
