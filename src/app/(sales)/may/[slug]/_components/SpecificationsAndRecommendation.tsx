import type { PublicMachineDetailV1 } from "@/models";
import { formatStorage } from "@/lib/presentation";

export function PublicSpecifications({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const items = [
    ["Model", summary.displayName], ["Chip", summary.chip],
    ["RAM", summary.ramGb === null ? null : `${summary.ramGb} GB`],
    ["Lưu trữ", summary.ssdGb === null ? null : `${formatStorage(summary.ssdGb)} SSD`],
    ["Màu", summary.color],
    ["Sạc đi kèm", machine.includedItems.charger === null ? null : machine.includedItems.charger ? "Có" : "Không"],
  ].filter((item): item is string[] => item[1] !== null);
  return <section className="detail-section specification-section" aria-labelledby="specifications-heading"><header><p className="eyebrow">Cấu hình</p><h2 id="specifications-heading">Thông số kỹ thuật</h2></header><details><summary>Xem cấu hình đầy đủ</summary><dl className="public-specifications">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details></section>;
}

export function MbmcRecommendation({ machine }: { machine: PublicMachineDetailV1 }) {
  if (!machine.expertSummary && !machine.suitableFor.length && !machine.notSuitableFor.length) return null;
  return <section className="detail-section recommendation-section" aria-labelledby="recommendation-heading"><header><p className="eyebrow">Nhận định kỹ thuật</p><h2 id="recommendation-heading">MBMC đánh giá</h2>{machine.expertSummary ? <p>{machine.expertSummary}</p> : null}</header><div className="recommendation-columns">{machine.suitableFor.length ? <section><h3>Phù hợp với</h3><ul>{machine.suitableFor.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}{machine.notSuitableFor.length ? <section><h3>Không phù hợp nếu</h3><ul>{machine.notSuitableFor.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}</div></section>;
}