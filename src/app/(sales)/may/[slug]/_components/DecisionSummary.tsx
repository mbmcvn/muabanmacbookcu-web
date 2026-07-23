import type { PublicMachineDetailV1 } from "@/models";
import { hasBalancedSuitability } from "./decision-dossier-presentation";

export function DecisionSummary({ machine }: { machine: PublicMachineDetailV1 }) {
  const hasFitAssessment = hasBalancedSuitability(machine);
  return (
    <section
      className="detail-section decision-summary"
      aria-labelledby="decision-summary-heading"
    >
      <header>
        <p className="eyebrow">Bắt đầu quyết định</p>
        <h2 id="decision-summary-heading">
          Có nên tiếp tục cân nhắc chiếc máy này?
        </h2>
        <p>
          {hasFitAssessment
            ? "Hãy đọc cả trường hợp phù hợp, trường hợp nên tránh và phần hồ sơ công khai chưa đủ thông tin trước khi quyết định liên hệ."
            : "Hồ sơ này chưa có đủ nhận định cân bằng về trường hợp phù hợp và nên tránh. Hãy đọc phần thông tin đã xác minh và phần hồ sơ công khai chưa đủ thông tin trước khi quyết định liên hệ."}
        </p>
      </header>
    </section>
  );
}
