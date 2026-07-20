import type { PublicMachineDetailV1 } from "@/models";
import { buildDecisionFacts } from "./decision-facts-presentation";

export function TrustAnchors({ machine }: { machine: PublicMachineDetailV1 }) {
  return <ul className="trust-anchors" aria-label="Thông tin đảm bảo"><li>Thông tin đã duyệt</li>{machine.summary.inspection.status === "not_available" ? null : <li>Có dữ liệu kiểm định</li>}<li>MBMC Passport</li></ul>;
}

export function DecisionFactGrid({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const facts = buildDecisionFacts({
    batteryHealthPercent: summary.batteryHealthPercent,
    cycleCount: summary.cycleCount,
    cosmeticGrade: summary.cosmeticGrade,
    conditionSummary: summary.conditionSummary,
    includedItems: machine.includedItems,
  });
  return <section className="detail-section decision-information" aria-labelledby="decision-facts-title"><header><p className="eyebrow">Thông tin quyết định</p><h2 id="decision-facts-title">Tình trạng thực tế</h2></header><dl className="detail-facts">{facts.map((fact) => <div className={fact.wide ? "detail-fact-wide" : undefined} key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></section>;
}
