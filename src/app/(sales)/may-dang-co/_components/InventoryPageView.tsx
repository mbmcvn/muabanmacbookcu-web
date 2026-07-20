import type { PublicMachineSummaryV1 } from "@/models";
import { InventoryExplorer } from "./InventoryExplorer";
import { InventoryIntro } from "./InventoryIntro";
import { InventoryTrustStatement } from "./InventoryTrustStatement";
import { NoPublishedMachinesState } from "./InventoryEmptyState";

export function InventoryPageView({ machines }: { machines: PublicMachineSummaryV1[] }) {
  return <div className="container inventory-page"><InventoryIntro total={machines.length} />{machines.length ? <InventoryExplorer machines={machines} /> : <NoPublishedMachinesState />}<InventoryTrustStatement /></div>;
}