import "server-only";

import { getAvailableMachines } from "@/data/machines/get-available-machines";
import type { RecommendationProfile } from "./quiz-types";
import type { PublicMachineSummaryV1, PublicMachineSummaryV2 } from "@/models";
import { matchPublicInventory, type InventoryMatchResult } from "./inventory-matcher";

export async function matchAvailablePublicInventory(
  profile: RecommendationProfile,
): Promise<InventoryMatchResult> {
  const publicMachines = await getAvailableMachines();
  return matchPublicInventory(
    profile,
    publicMachines.flatMap((machine) =>
      machine.machineFamily === "macbook" ? [legacyMacBookSummary(machine)] : [],
    ),
  );
}

function legacyMacBookSummary(machine: PublicMachineSummaryV2): PublicMachineSummaryV1 {
  const facts = machine.familyFacts.machineFamily === "macbook" ? machine.familyFacts : null;
  return {
    schemaVersion: "public-machine-summary.v1",
    code: machine.code, slug: machine.slug, displayName: machine.displayName,
    family: machine.productLine === "macbook-air" ? "Air" : machine.productLine === "macbook-pro" ? "Pro" : "Unknown",
    year: machine.year, screenSizeInches: facts?.displaySizeInches ?? null,
    chip: machine.chip, ramGb: machine.ramGb, ssdGb: machine.storage.capacityGb,
    color: machine.color, price: machine.price, availability: machine.availability,
    reservationKind: machine.reservationKind, coverImage: machine.coverImage,
    imageCount: machine.imageCount, batteryHealthPercent: facts?.batteryHealthPercent ?? null,
    cycleCount: facts?.cycleCount ?? null, cosmeticGrade: machine.cosmeticGrade,
    conditionSummary: machine.conditionSummary, warranty: machine.warranty,
    inspection: machine.inspection, contextualLabel: machine.contextualLabel,
    publishedAt: machine.publishedAt, updatedAt: machine.updatedAt,
  };
}
