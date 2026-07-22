"use client";

import type { PublicMachineDetailV1 } from "@/models";
import { MBMC_ZALO_URL } from "@/config/contact";
import { publicSalesPolicies } from "@/config/public-sales-policies";
import { useContactChannel } from "@/hooks/useContactChannel";
import { formatCurrencyVnd, formatPublicMachineDisplayName, formatPublicMachineSpecs } from "@/lib/presentation";

export function PoliciesAndSupport({ machine }: { machine: PublicMachineDetailV1 }) {
  const { contactUrl, contactLabel } = useContactChannel();
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  const label = contactLabel ?? "Nhắn MBMC xác nhận máy";
  return <section id="lien-he-mbmc" className="detail-section support-section" aria-labelledby="support-heading"><div><p className="eyebrow">Bàn giao và hỗ trợ</p><h2 id="support-heading">Trao đổi trực tiếp trước khi quyết định</h2><ul>{publicSalesPolicies.map((policy) => <li key={policy}>{policy}</li>)}</ul></div><div className="support-contact"><p>Máy bạn đang xem</p><strong>{summary.code}</strong><span>{displayName}</span><a className="primary-action" href={contactUrl ?? MBMC_ZALO_URL} target="_blank" rel="noopener noreferrer" aria-label={label}>{label}</a></div></section>;
}

export function PublicMachineStickyBar({ machine }: { machine: PublicMachineDetailV1 }) {
  const { contactUrl, contactLabel } = useContactChannel();
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  const specs = formatPublicMachineSpecs({ chip: summary.chip, ramGb: summary.ramGb, storageGb: summary.ssdGb });
  const label = contactLabel ?? "Nhắn MBMC xác nhận máy";
  return <aside className="public-machine-sticky" aria-label={`Quan tâm ${summary.code}`}><div className="public-machine-sticky-identity"><strong>{displayName}</strong>{specs ? <span className="public-machine-sticky-specs">{specs}</span> : null}</div><span className="public-machine-sticky-price">{formatCurrencyVnd(summary.price)}</span><a href={contactUrl ?? MBMC_ZALO_URL} target="_blank" rel="noopener noreferrer" aria-label={label}>{label}</a></aside>;
}
