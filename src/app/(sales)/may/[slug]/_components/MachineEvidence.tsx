import type { PublicMachineDetailV1 } from "@/models";
import { buildMachineEvidence } from "./machine-evidence-presentation";

export function MachineEvidenceGrid({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const evidence = buildMachineEvidence({
    batteryHealthPercent: summary.batteryHealthPercent,
    cycleCount: summary.cycleCount,
    cosmeticGrade: summary.cosmeticGrade,
    conditionSummary: summary.conditionSummary,
    includedItems: machine.includedItems,
  });
  return <section className="detail-section decision-information" aria-labelledby="decision-facts-title"><header><p className="eyebrow">Thông tin công khai hỗ trợ</p><h2 id="decision-facts-title">Tình trạng và thông tin đang có</h2></header><dl className="detail-facts">{evidence.map((item) => <div className={item.wide ? "detail-fact-wide" : undefined} key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>;
}
