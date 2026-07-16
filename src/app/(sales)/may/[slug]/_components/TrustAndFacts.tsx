import type { PublicMachineDetail } from "@/models";
import { formatPublicDate } from "@/lib/presentation";

export function TrustAnchors({ machine }: { machine: PublicMachineDetail }) {
  return <ul className="trust-anchors" aria-label="Thông tin đảm bảo"><li>Đã kiểm định</li>{machine.warrantyMonths !== null ? <li>Bảo hành {machine.warrantyMonths} tháng</li> : null}<li>MBMC Passport</li></ul>;
}

export function DecisionFactGrid({ machine }: { machine: PublicMachineDetail }) {
  const facts = [
    machine.batteryHealth === null ? null : ["Pin", `${machine.batteryHealth}%`],
    machine.cycleCount === null ? null : ["Chu kỳ sạc", `${machine.cycleCount} lần`],
    machine.conditionRank === null ? null : ["Ngoại hình", `Hạng ${machine.conditionRank}`],
    machine.inspectedAt ? ["Kiểm định", `Đạt · ${formatPublicDate(machine.inspectedAt)}`] : ["Kiểm định", "Đạt"],
    machine.warrantyMonths === null ? null : ["Bảo hành", `${machine.warrantyMonths} tháng`],
    machine.chargerIncluded === null ? null : ["Phụ kiện", machine.chargerIncluded ? "Có sạc đi kèm" : "Không kèm sạc"],
    machine.sourceSummary ? ["Xác minh nguồn máy", machine.sourceSummary] : null,
  ].filter((fact): fact is string[] => fact !== null);
  return <section className="detail-section decision-information" aria-labelledby="decision-facts-title"><header><p className="eyebrow">Thông tin quyết định</p><h2 id="decision-facts-title">Tình trạng thực tế</h2></header><dl className="detail-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}
