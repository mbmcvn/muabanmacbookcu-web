import type { PublicMachineDetail } from "@/models";
import { buildMachineContactHref, phoneContact } from "@/config/contact";
import { formatCurrencyVnd, formatMachineAvailability, formatStorage } from "@/lib/presentation";
import { TrustAnchors } from "./TrustAndFacts";

export function configuration(machine: PublicMachineDetail): string {
  return [machine.chip, machine.ramGb === null ? null : `${machine.ramGb} GB RAM`, machine.storageGb === null ? null : `${formatStorage(machine.storageGb)} SSD`, machine.color].filter(Boolean).join(" · ");
}

export function DecisionPanel({ machine }: { machine: PublicMachineDetail }) {
  const href = buildMachineContactHref(machine.machineId, machine.title);
  return <section className="detail-decision" aria-labelledby="machine-title"><div className="detail-status"><span>{formatMachineAvailability(machine.availability)}</span>{machine.tag ? <span>{machine.tag}</span> : null}</div><h1 id="machine-title">{machine.title}</h1>{configuration(machine) ? <p className="detail-configuration">{configuration(machine)}</p> : null}<p className="detail-price">{formatCurrencyVnd({ amount: machine.price, currency: "VND" })}</p><TrustAnchors machine={machine} /><div className="detail-actions"><a className="primary-action" href={href} aria-label={`Nhắn MBMC xác nhận ${machine.machineId} – ${machine.title}`}>Nhắn MBMC xác nhận máy</a>{phoneContact ? <a className="secondary-action" href={phoneContact.href} aria-label={`Gọi MBMC về ${machine.machineId} – ${machine.title}`}>Gọi MBMC</a> : null}</div><p className="contact-context">Tin nhắn đã có sẵn mã máy: “Tôi đang quan tâm {machine.machineId} – {machine.title}.”</p></section>;
}
