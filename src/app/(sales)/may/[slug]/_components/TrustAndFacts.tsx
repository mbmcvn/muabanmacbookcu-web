import type { PublicMachineDetailV1 } from "@/models";

export function TrustAnchors({ machine }: { machine: PublicMachineDetailV1 }) {
  return <ul className="trust-anchors" aria-label="Thông tin đảm bảo"><li>Thông tin đã duyệt</li><li>{machine.summary.inspection.status === "not_available" ? "Chưa có dữ liệu kiểm định" : "Có dữ liệu kiểm định"}</li><li>MBMC Passport</li></ul>;
}

export function DecisionFactGrid({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const facts = [
    summary.batteryHealthPercent === null ? null : ["Pin", `${summary.batteryHealthPercent}%`],
    summary.cycleCount === null ? null : ["Chu kỳ sạc", `${summary.cycleCount} lần`],
    summary.cosmeticGrade === null ? null : ["Ngoại hình", `Hạng ${summary.cosmeticGrade}`],
    ["Kiểm định", summary.inspection.status === "not_available" ? "Chưa có dữ liệu" : summary.inspection.status],
    machine.includedItems.charger === null ? null : ["Phụ kiện", machine.includedItems.charger ? "Có sạc đi kèm" : "Không kèm sạc"],
  ].filter((fact): fact is string[] => fact !== null);
  return <section className="detail-section decision-information" aria-labelledby="decision-facts-title"><header><p className="eyebrow">Thông tin quyết định</p><h2 id="decision-facts-title">Tình trạng thực tế</h2></header><dl className="detail-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}