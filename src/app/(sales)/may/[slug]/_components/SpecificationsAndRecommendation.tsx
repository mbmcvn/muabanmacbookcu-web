import type { PublicMachineDetailV1 } from "@/models";
import { buildPublicSpecificationRows } from "./technical-specifications-presentation";

export function PublicSpecifications({ machine }: { machine: PublicMachineDetailV1 }) {
  const rows = buildPublicSpecificationRows(machine);
  if (!rows.length) return null;
  return <section className="detail-section specification-section" aria-labelledby="specifications-heading"><header><p className="eyebrow">Cấu hình</p><h2 id="specifications-heading">Thông số kỹ thuật</h2></header><dl className="public-specifications">{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>;
}

export function hasBalancedSuitability(machine: PublicMachineDetailV1): boolean {
  return machine.suitableFor.length > 0 && machine.notSuitableFor.length > 0;
}

export function SuitabilityAssessment({ machine }: { machine: PublicMachineDetailV1 }) {
  if (!hasBalancedSuitability(machine)) return null;
  return <>
    <section className="detail-section fit-section" aria-labelledby="suitable-heading">
      <header><p className="eyebrow">Nên tiếp tục cân nhắc nếu</p><h2 id="suitable-heading">Phù hợp với</h2></header>
      <ul>{machine.suitableFor.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
    <section className="detail-section fit-section" aria-labelledby="not-suitable-heading">
      <header><p className="eyebrow">Nên dừng lại nếu</p><h2 id="not-suitable-heading">Không phù hợp nếu</h2></header>
      <ul>{machine.notSuitableFor.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  </>;
}

export function ExpertSummary({ machine }: { machine: PublicMachineDetailV1 }) {
  if (!machine.expertSummary) return null;
  return <section className="detail-section expert-summary" aria-labelledby="expert-summary-heading"><header><p className="eyebrow">Nhận định của con người</p><h2 id="expert-summary-heading">Đánh giá từ MBMC</h2><p>{machine.expertSummary}</p></header></section>;
}
