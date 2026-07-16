import type { PublicMachineCard } from "@/models";
import { InventoryExplorer } from "./InventoryExplorer";
import { InventoryIntro } from "./InventoryIntro";
import { InventoryTrustStatement } from "./InventoryTrustStatement";

export function InventoryPageView({ machines }: { machines: PublicMachineCard[] }) {
  return <div className="container inventory-page"><InventoryIntro total={machines.length} /><InventoryExplorer machines={machines} /><InventoryTrustStatement /></div>;
}
