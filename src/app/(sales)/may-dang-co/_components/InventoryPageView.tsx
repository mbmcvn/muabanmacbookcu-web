import Link from "next/link";
import type { PublicMachineSummaryV2 } from "@/models";
import { InventoryExplorer } from "./InventoryExplorer";
import { InventoryIntro } from "./InventoryIntro";
import { InventoryTrustStatement } from "./InventoryTrustStatement";
import { NoPublishedMachinesState } from "./InventoryEmptyState";

export function InventoryPageView({ machines }: { machines: PublicMachineSummaryV2[] }) {
  return (
    <div className="container inventory-page">
      <InventoryIntro total={machines.length} />
      <aside className="inventory-chooser-callout" aria-label="Gợi ý chọn Mac">
        <div>
          <h2>Chưa biết bắt đầu từ đâu?</h2>
          <p>Hãy để MBMC gợi ý chiếc Mac phù hợp theo nhu cầu và ngân sách của bạn.</p>
        </div>
        <Link href="/chon-macbook">Để MBMC gợi ý <span aria-hidden="true">→</span></Link>
      </aside>
      {machines.length ? <InventoryExplorer machines={machines} /> : <NoPublishedMachinesState />}
      <InventoryTrustStatement />
    </div>
  );
}
