import Image from "next/image";
import Link from "next/link";
import type { PublicMachineSummaryV1 } from "@/models";
import { formatBatteryHealth, formatCurrencyVnd, formatMachineAvailability } from "@/lib/presentation";

function specification(value: number | null, suffix: string): string {
  return value === null ? "Chưa rõ" : `${value}${suffix}`;
}

export function MachineCard({ machine }: { machine: PublicMachineSummaryV1 }) {
  const price = formatCurrencyVnd(machine.price);
  return <article className="machine-card"><Link className="machine-card-link" href={`/may/${machine.slug}`} aria-label={`Xem ${machine.displayName}, ${price}`}><div className="machine-image"><Image src={machine.coverImage.url} alt={machine.coverImage.alt} fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 45vw, 350px" /></div><div className="machine-card-body"><div className="machine-card-status"><span>{formatMachineAvailability(machine.availability)}</span>{machine.contextualLabel ? <span className="context-label">{machine.contextualLabel}</span> : null}</div><h2>{machine.displayName}</h2><p className="machine-configuration">{machine.chip ?? "Chưa rõ chip"} · {specification(machine.ramGb, "GB")} · {specification(machine.ssdGb, "GB SSD")}</p>{machine.color ? <p className="machine-color">{machine.color}</p> : null}<p className="machine-price">{price}</p><dl className="decision-facts"><div><dt>Pin</dt><dd>{formatBatteryHealth(machine.batteryHealthPercent ?? undefined)}</dd></div><div><dt>Ngoại hình</dt><dd>{machine.cosmeticGrade ?? "Chưa có dữ liệu"}</dd></div><div><dt>Kiểm định</dt><dd>{machine.inspection.status === "not_available" ? "Chưa có dữ liệu" : machine.inspection.status}</dd></div></dl><div className="machine-card-footer"><span>{machine.code}</span><span className="machine-card-cta">Xem chiếc máy này <span aria-hidden="true">→</span></span></div></div></Link></article>;
}