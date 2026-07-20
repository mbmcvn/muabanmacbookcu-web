import type { PublicMachineDetailV1 } from "@/models";
import { buildMachineContactHref } from "@/config/contact";
import { publicSalesPolicies } from "@/config/public-sales-policies";
import { formatCurrencyVnd } from "@/lib/presentation";

export function PoliciesAndSupport({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const href = buildMachineContactHref(summary.code, summary.displayName);
  return <section id="lien-he-mbmc" className="detail-section support-section" aria-labelledby="support-heading"><div><p className="eyebrow">Bàn giao và hỗ trợ</p><h2 id="support-heading">Trao đổi trực tiếp trước khi quyết định</h2><ul>{publicSalesPolicies.map((policy) => <li key={policy}>{policy}</li>)}</ul></div><div className="support-contact"><p>Máy bạn đang xem</p><strong>{summary.code}</strong><span>{summary.displayName}</span><a className="primary-action" href={href} aria-label={`Nhắn MBMC xác nhận ${summary.code} – ${summary.displayName}`}>Nhắn MBMC xác nhận máy</a></div></section>;
}

export function PublicMachineStickyBar({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const href = buildMachineContactHref(summary.code, summary.displayName);
  return <aside className="public-machine-sticky" aria-label={`Quan tâm ${summary.code}`}><div><strong>{summary.displayName}</strong><span>{formatCurrencyVnd(summary.price)}</span></div><a href={href} aria-label={`Nhắn MBMC xác nhận ${summary.code} – ${summary.displayName}`}>Nhắn MBMC xác nhận máy</a></aside>;
}