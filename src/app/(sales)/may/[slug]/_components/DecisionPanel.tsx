"use client";

import type { PublicMachineDetailV1 } from "@/models";
import { MBMC_ZALO_URL, phoneContact } from "@/config/contact";
import { useContactChannel } from "@/hooks/useContactChannel";
import { formatCurrencyVnd, formatMachineAvailability, formatPublicMachineDisplayName, formatPublicMachineSpecs } from "@/lib/presentation";
import { TrustAnchors } from "./TrustAndFacts";

export function configuration(machine: PublicMachineDetailV1): string {
  const summary = machine.summary;
  return formatPublicMachineSpecs({ chip: summary.chip, ramGb: summary.ramGb, storageGb: summary.ssdGb, color: summary.color });
}

export function DecisionPanel({ machine }: { machine: PublicMachineDetailV1 }) {
  const { contactUrl, contactLabel } = useContactChannel();
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  const label = contactLabel ?? "Nhắn MBMC xác nhận máy";
  return <section className="detail-decision" aria-labelledby="machine-title"><div className="detail-status"><span>{formatMachineAvailability(summary.availability)}</span>{summary.contextualLabel ? <span>{summary.contextualLabel}</span> : null}</div><h1 id="machine-title">{displayName}</h1>{configuration(machine) ? <p className="detail-configuration">{configuration(machine)}</p> : null}<p className="detail-price">{formatCurrencyVnd(summary.price)}</p><TrustAnchors machine={machine} /><div className="detail-actions"><a className="primary-action" href={contactUrl ?? MBMC_ZALO_URL} target="_blank" rel="noopener noreferrer" aria-label={label}>{label}</a>{phoneContact ? <a className="secondary-action" href={phoneContact.href} aria-label={`Gọi MBMC về ${summary.code} – ${displayName}`}>Gọi MBMC</a> : null}</div><p className="contact-context">Bạn có thể gửi: “Tôi đang quan tâm {summary.code} – {displayName}.”</p></section>;
}
