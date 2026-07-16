import type { InspectionPreview as InspectionPreviewModel } from "@/models";

export function InspectionPreview({ inspection }: { inspection: InspectionPreviewModel }) {
  return <section><h3>Kiểm tra</h3><p>{inspection.result === "passed" ? "Đã đạt kiểm tra" : "Đã đạt, có ghi chú"}</p><ul>{inspection.items.map((item) => <li key={item.label}>{item.label}: {item.result === "passed" ? "Đạt" : item.note ?? "Có ghi chú"}</li>)}</ul></section>;
}
