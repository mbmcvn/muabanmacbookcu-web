"use client";

import Link from "next/link";
import { MachineImage } from "@/components/machine/MachineImage";
import {
  useContactChannel,
  withContactChannel,
} from "@/hooks/useContactChannel";
import type { PublicMachineSummaryV2 } from "@/models";
import {
  formatCurrencyVnd,
  formatMachineAvailability,
  formatPublicMachineDisplayName,
} from "@/lib/presentation";
import {
  formatMachineCardCondition,
  formatMachineCardSpecs,
  getMachineCardFamilyFact,
} from "./machine-card-presentation";
import { CopyMachineCardLink } from "./CopyMachineCardLink";

export function MachineCard({
  machine,
  headingAs: Heading = "h2",
}: {
  machine: PublicMachineSummaryV2;
  headingAs?: "h2" | "h3";
}) {
  const { channel } = useContactChannel();
  const price = formatCurrencyVnd(machine.price);
  const displayName = formatPublicMachineDisplayName(machine.displayName);
  const specs = formatMachineCardSpecs({
    chip: machine.chip,
    ramGb: machine.ramGb,
    storageGb: machine.storage.capacityGb,
    storageType: machine.storage.type,
    color: machine.color,
  });
  const familyFact = getMachineCardFamilyFact(machine.familyFacts);
  const condition = formatMachineCardCondition({
    machineFamily: machine.machineFamily,
    batteryHealthPercent: machine.familyFacts.machineFamily === "macbook" ? machine.familyFacts.batteryHealthPercent : null,
    cycleCount: machine.familyFacts.machineFamily === "macbook" ? machine.familyFacts.cycleCount : null,
    cosmeticGrade: machine.cosmeticGrade,
  });

  const reserved = machine.availability === "reserved";
  return (
    <article className="machine-card">
      <Link
        className="machine-card-link"
        href={withContactChannel(`/may/${machine.slug}`, channel)}
        aria-label={`Xem ${displayName}, ${price}`}
      >
        <div className="machine-image">
          <MachineImage
            image={machine.coverImage}
            variant="card"
            fill
            sizes="(max-width: 639px) 38vw, (max-width: 1199px) 45vw, 350px"
          />
        </div>
        <div className="machine-card-body">
          <div className="machine-card-status">
            <span>
              {formatMachineAvailability(
                machine.availability,
                machine.reservationKind,
              )}
            </span>
            {machine.contextualLabel ? (
              <span className="context-label">{machine.contextualLabel}</span>
            ) : null}
          </div>
          <Heading>{displayName}</Heading>
          <p className="machine-configuration">{specs}</p>
          <p className="machine-price">{price}</p>
          {condition ? (
            <p className="machine-card-condition">{condition}</p>
          ) : null}
          <dl className="decision-facts">
            {familyFact ? (
              <div>
                <dt>{familyFact.label}</dt>
                <dd>{familyFact.value}</dd>
              </div>
            ) : null}
            <div>
              <dt>Ngoại hình</dt>
              <dd>{machine.cosmeticGrade ?? "Chưa có dữ liệu"}</dd>
            </div>
          </dl>
          <div className="machine-card-footer">
            <span className="machine-code">{machine.code}</span>
            <span className="machine-card-cta">
              {reserved ? (
                "Xem thông tin"
              ) : (
                <>
                  <span className="machine-card-cta-short">Xem máy</span>
                  <span className="machine-card-cta-long">
                    Xem chiếc máy này
                  </span>{" "}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </span>
          </div>
        </div>
      </Link>
      <CopyMachineCardLink code={machine.code} slug={machine.slug} />
    </article>
  );
}
