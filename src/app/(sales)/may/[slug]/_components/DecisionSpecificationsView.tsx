import type { DecisionSpecifications } from "@/models";
import { formatBatteryHealth, formatConditionGrade, formatCycleCount, formatStorage, formatWarranty } from "@/lib/presentation";

export function DecisionSpecificationsView({ specifications }: { specifications: DecisionSpecifications }) {
  const inspection = specifications.inspectionResult === "passed" ? "Đã đạt" : "Đã đạt, có ghi chú";
  return <section className="section" aria-labelledby="decision-specs"><h2 id="decision-specs">Thông tin giúp bạn quyết định</h2><dl className="specification-grid"><div><dt>Chip</dt><dd>{specifications.chip}</dd></div><div><dt>RAM</dt><dd>{specifications.ramGb} GB</dd></div><div><dt>Lưu trữ</dt><dd>{formatStorage(specifications.storageGb)}</dd></div><div><dt>Pin</dt><dd>{formatBatteryHealth(specifications.batteryHealthPercent)}</dd></div><div><dt>Số lần sạc</dt><dd>{formatCycleCount(specifications.cycleCount)}</dd></div><div><dt>Ngoại hình</dt><dd>{formatConditionGrade(specifications.cosmeticCondition)}</dd></div><div><dt>Bảo hành</dt><dd>{formatWarranty(specifications.warrantyMonths)}</dd></div><div><dt>Kiểm tra</dt><dd>{inspection}</dd></div></dl></section>;
}
