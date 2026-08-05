import type { PublicMachineDetailV1 } from "@/models";
import { buildMachineEvidence } from "./machine-evidence-presentation";
import { MachineDetailIcon } from "./MachineDetailIcon";

const evidenceIcons = {
  "Pin": "battery",
  "Chu kỳ sạc": "status",
  "Ngoại hình": "condition",
  "Phụ kiện đi kèm": "accessories",
} as const;

export function MachineEvidenceGrid({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const evidence = buildMachineEvidence({
    batteryHealthPercent: summary.batteryHealthPercent,
    cycleCount: summary.cycleCount,
    cosmeticGrade: summary.cosmeticGrade,
    conditionSummary: summary.conditionSummary,
    includedItems: machine.includedItems,
  });
  return <section className="detail-section decision-information" aria-labelledby="decision-facts-title"><header><p className="eyebrow">Thông tin công khai hỗ trợ</p><h2 id="decision-facts-title">Tình trạng và thông tin đang có</h2></header><dl className="detail-facts condition-metrics">{evidence.map((item, index) => { const icon = evidenceIcons[item.label as keyof typeof evidenceIcons]; return <div className={item.wide && index > 3 ? "detail-fact-wide" : undefined} key={item.label}>{icon ? <MachineDetailIcon name={icon} className="condition-metric__icon" /> : null}<div className="condition-metric__copy"><dt>{item.label}</dt><dd>{item.value}</dd></div></div>; })}</dl></section>;
}
