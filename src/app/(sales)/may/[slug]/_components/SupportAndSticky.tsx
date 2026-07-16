import type { PublicMachineDetail } from "@/models";
import { buildMachineContactHref } from "@/config/contact";
import { publicSalesPolicies } from "@/config/public-sales-policies";
import { formatCurrencyVnd } from "@/lib/presentation";

export function PoliciesAndSupport({ machine }: { machine: PublicMachineDetail }) {
  const href = buildMachineContactHref(machine.machineId, machine.title);
  return <section id="lien-he-mbmc" className="detail-section support-section" aria-labelledby="support-heading"><div><p className="eyebrow">Bàn giao và hỗ trợ</p><h2 id="support-heading">Trao đổi trực tiếp trước khi quyết định</h2><ul>{machine.warrantyMonths !== null ? <li>Bảo hành công khai: {machine.warrantyMonths} tháng.</li> : null}{publicSalesPolicies.map((policy) => <li key={policy}>{policy}</li>)}</ul></div><div className="support-contact"><p>Máy bạn đang xem</p><strong>{machine.machineId}</strong><span>{machine.title}</span><a className="primary-action" href={href} aria-label={`Nhắn MBMC xác nhận ${machine.machineId} – ${machine.title}`}>Nhắn MBMC xác nhận máy</a></div></section>;
}

export function PublicMachineStickyBar({ machine }: { machine: PublicMachineDetail }) {
  const href = buildMachineContactHref(machine.machineId, machine.title);
  return <aside className="public-machine-sticky" aria-label={`Quan tâm ${machine.machineId}`}><div><strong>{machine.title}</strong><span>{formatCurrencyVnd({ amount: machine.price, currency: "VND" })}</span></div><a href={href} aria-label={`Nhắn MBMC xác nhận ${machine.machineId} – ${machine.title}`}>Nhắn MBMC xác nhận máy</a></aside>;
}
