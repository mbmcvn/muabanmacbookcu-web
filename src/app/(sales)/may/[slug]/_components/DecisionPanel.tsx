import type { PublicMachineDetailV1 } from "@/models";
import { buildMachineContactHref, phoneContact } from "@/config/contact";
import { formatCurrencyVnd, formatMachineAvailability, formatStorage } from "@/lib/presentation";
import { TrustAnchors } from "./TrustAndFacts";

export function configuration(machine: PublicMachineDetailV1): string {
  const summary = machine.summary;
  return [summary.chip, summary.ramGb === null ? null : `${summary.ramGb} GB RAM`, summary.ssdGb === null ? null : `${formatStorage(summary.ssdGb)} SSD`, summary.color].filter(Boolean).join(" · ");
}

export function DecisionPanel({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const href = buildMachineContactHref(summary.code, summary.displayName);
  return <section className="detail-decision" aria-labelledby="machine-title"><div className="detail-status"><span>{formatMachineAvailability(summary.availability)}</span>{summary.contextualLabel ? <span>{summary.contextualLabel}</span> : null}</div><h1 id="machine-title">{summary.displayName}</h1>{configuration(machine) ? <p className="detail-configuration">{configuration(machine)}</p> : null}<p className="detail-price">{formatCurrencyVnd(summary.price)}</p><TrustAnchors machine={machine} /><div className="detail-actions"><a className="primary-action" href={href} aria-label={`Nhắn MBMC xác nhận ${summary.code} – ${summary.displayName}`}>Nhắn MBMC xác nhận máy</a>{phoneContact ? <a className="secondary-action" href={phoneContact.href} aria-label={`Gọi MBMC về ${summary.code} – ${summary.displayName}`}>Gọi MBMC</a> : null}</div><p className="contact-context">Tin nhắn đã có sẵn mã máy: “Tôi đang quan tâm {summary.code} – {summary.displayName}.”</p></section>;
}