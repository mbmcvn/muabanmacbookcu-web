import Image from "next/image";
import Link from "next/link";
import type { PublicMachineCard } from "@/models";
import { formatBatteryHealth, formatCurrencyVnd, formatMachineAvailability, formatWarranty } from "@/lib/presentation";

function specification(value: number | null, suffix: string): string {
  return value === null ? "Chưa rõ" : `${value}${suffix}`;
}

export function MachineCard({ machine }: { machine: PublicMachineCard }) {
  const price = formatCurrencyVnd({ amount: machine.price, currency: "VND" });
  return (
    <article className="machine-card">
      <Link className="machine-card-link" href={`/may/${machine.slug}`} aria-label={`Xem ${machine.title}, ${price}`}>
        <div className="machine-image">
          <Image src={machine.coverImage.url} alt={machine.coverImage.alt} fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1199px) 45vw, 350px" />
        </div>
        <div className="machine-card-body">
          <div className="machine-card-status"><span>{formatMachineAvailability(machine.availability)}</span>{machine.tag ? <span className="context-label">{machine.tag}</span> : null}</div>
          <h2>{machine.title}</h2>
          <p className="machine-configuration">{machine.chip ?? "Chưa rõ chip"} · {specification(machine.ramGb, "GB")} · {specification(machine.storageGb, "GB SSD")}</p>
          {machine.color ? <p className="machine-color">{machine.color}</p> : null}
          <p className="machine-price">{price}</p>
          <dl className="decision-facts">
            <div><dt>Pin</dt><dd>{formatBatteryHealth(machine.batteryHealth ?? undefined)}</dd></div>
            <div><dt>Ngoại hình</dt><dd>{machine.conditionRank ?? "Chưa có dữ liệu"}</dd></div>
            <div><dt>Bảo hành</dt><dd>{formatWarranty(machine.warrantyMonths ?? undefined)}</dd></div>
          </dl>
          <div className="machine-card-footer"><span>{machine.machineId}</span><span className="machine-card-cta">Xem chiếc máy này <span aria-hidden="true">→</span></span></div>
        </div>
      </Link>
    </article>
  );
}
