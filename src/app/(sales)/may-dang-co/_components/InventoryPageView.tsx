import type { PublicMachineSummaryV2 } from "@/models";
import { InventoryExplorer } from "./InventoryExplorer";
import type { InventoryUrlState } from "@/data/machines/public-inventory-query";
import { InventoryTrustStatement } from "./InventoryTrustStatement";

export function InventoryPageView({ machines, initialState }: { machines: PublicMachineSummaryV2[]; initialState?: InventoryUrlState }) {
  return (
    <div className="container inventory-page">
      <InventoryExplorer machines={machines} initialState={initialState} />
      <InventoryTrustStatement />
    </div>
  );
}
