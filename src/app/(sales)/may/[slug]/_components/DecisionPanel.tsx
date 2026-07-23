"use client";

import type { PublicMachineDetailV1 } from "@/models";
import { phoneContact } from "@/config/contact";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { formatCurrencyVnd, formatMachineAvailability, formatPublicMachineDisplayName, formatPublicMachineSpecs } from "@/lib/presentation";
import { EvidenceAvailabilityAnchors } from "./MachineEvidence";

export function configuration(machine: PublicMachineDetailV1): string {
  const summary = machine.summary;
  return formatPublicMachineSpecs({ chip: summary.chip, ramGb: summary.ramGb, storageGb: summary.ssdGb, color: summary.color });
}

export function DecisionPanel({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  return <section className="detail-decision" aria-labelledby="machine-title"><div className="detail-status"><span>{formatMachineAvailability(summary.availability)}</span>{summary.contextualLabel ? <span>{summary.contextualLabel}</span> : null}</div><h1 id="machine-title">{displayName}</h1>{configuration(machine) ? <p className="detail-configuration">{configuration(machine)}</p> : null}<p className="detail-price">{formatCurrencyVnd(summary.price)}</p><EvidenceAvailabilityAnchors machine={machine} /><div className="detail-actions"><ContactActionLink className="primary-action" />{phoneContact ? <a className="secondary-action" href={phoneContact.href} aria-label={`Gọi MBMC về ${summary.code} – ${displayName}`}>Gọi MBMC</a> : null}</div><p className="contact-context">Bạn có thể gửi: “Tôi đang quan tâm {summary.code} – {displayName}.”</p></section>;
}
