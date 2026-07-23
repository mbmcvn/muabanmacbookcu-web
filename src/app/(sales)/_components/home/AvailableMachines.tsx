import Link from "next/link";
import type { PublicMachineSummaryV1 } from "@/models";
import type { PublicInventoryLoadState } from "@/data/machines/public-inventory-load-state";
import { PageState } from "@/components/ui/PageState";
import { MachineCard } from "../../may-dang-co/_components/MachineCard";
import { selectHomepageMachines } from "./homepage-machine-selection";
import { SectionHeader } from "./HomepagePresentation";
import styles from "./Home.module.css";

export function AvailableMachines({
  state,
}: {
  state: PublicInventoryLoadState<PublicMachineSummaryV1>;
}) {
  const machines =
    state.status === "ready" ? selectHomepageMachines(state.machines) : [];

  return (
    <section
      className={`${styles.section} ${styles.machineSection}`}
      aria-labelledby="available-machines-title"
    >
      <SectionHeader
        eyebrow="Máy cụ thể, thông tin cụ thể"
        title="Một số máy đang có"
        titleId="available-machines-title"
        description="Ba máy đầu tiên theo thứ tự hiện có trong danh sách công khai của MBMC. Đây không phải danh sách đề xuất cho riêng bạn."
      />

      {state.status === "unavailable" ? (
        <PageState
          className={styles.machineState}
          role="status"
        >
          <p>Danh sách máy tạm thời chưa thể hiển thị.</p>
          <p>Bạn vẫn có thể nhắn MBMC để hỏi về máy đang có.</p>
        </PageState>
      ) : machines.length ? (
        <div className={`machine-catalog ${styles.machineGrid}`}>
          {machines.map((machine) => (
            <MachineCard
              key={machine.slug}
              machine={machine}
              headingAs="h3"
            />
          ))}
        </div>
      ) : (
        <PageState
          className={styles.machineState}
        >
          <p>Hiện chưa có máy đủ điều kiện công khai.</p>
          <p>
            Máy sẽ xuất hiện sau khi thông tin và hình ảnh được duyệt để công
            khai.
          </p>
        </PageState>
      )}

      <Link className={styles.inventoryLink} href="/may-dang-co">
        Xem tất cả máy đang có <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
