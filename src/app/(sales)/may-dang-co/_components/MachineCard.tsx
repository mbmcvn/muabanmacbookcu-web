"use client";

import Image from "next/image";
import Link from "next/link";
import { useContactChannel, withContactChannel } from "@/hooks/useContactChannel";
import type { PublicMachineSummaryV1 } from "@/models";
import { formatCurrencyVnd, formatMachineAvailability, formatPublicMachineDisplayName, formatPublicMachineSpecs } from "@/lib/presentation";
import { formatMachineCardCondition, getMachineCardBatteryFact } from "./machine-card-presentation";

export function MachineCard({ machine }: { machine: PublicMachineSummaryV1 }) {
  const { channel } = useContactChannel();
  const price = formatCurrencyVnd(machine.price);
  const displayName = formatPublicMachineDisplayName(machine.displayName);
  const specs = formatPublicMachineSpecs({ chip: machine.chip, ramGb: machine.ramGb, storageGb: machine.ssdGb, color: machine.color });
  const battery = getMachineCardBatteryFact(machine.batteryHealthPercent, machine.cycleCount);
  const condition = formatMachineCardCondition({
    batteryHealthPercent: machine.batteryHealthPercent,
    cycleCount: machine.cycleCount,
    cosmeticGrade: machine.cosmeticGrade,
  });

  return <article className="machine-card"><Link className="machine-card-link" href={withContactChannel(`/may/${machine.slug}`, channel)} aria-label={`Xem ${displayName}, ${price}`}><div className="machine-image"><Image src={machine.coverImage.url} alt={machine.coverImage.alt} fill sizes="(max-width: 639px) 38vw, (max-width: 1199px) 45vw, 350px" /></div><div className="machine-card-body"><div className="machine-card-status"><span>{formatMachineAvailability(machine.availability)}</span>{machine.contextualLabel ? <span className="context-label">{machine.contextualLabel}</span> : null}</div><h2>{displayName}</h2><p className="machine-configuration">{specs}</p><p className="machine-price">{price}</p>{condition ? <p className="machine-card-condition">{condition}</p> : null}<dl className="decision-facts">{battery ? <div><dt>{battery.label}</dt><dd>{battery.value}</dd></div> : null}<div><dt>Ngoại hình</dt><dd>{machine.cosmeticGrade ?? "Chưa có dữ liệu"}</dd></div></dl><div className="machine-card-footer"><span className="machine-code">{machine.code}</span><span className="machine-card-cta"><span className="machine-card-cta-short">Xem máy</span><span className="machine-card-cta-long">Xem chiếc máy này</span> <span aria-hidden="true">→</span></span></div></div></Link></article>;
}
