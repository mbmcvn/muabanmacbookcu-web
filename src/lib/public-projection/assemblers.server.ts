import {
  PUBLIC_MACHINE_DETAIL_V1_SCHEMA,
  PUBLIC_MACHINE_PASSPORT_V1_SCHEMA,
  PUBLIC_MACHINE_SUMMARY_V1_SCHEMA,
  type PublicImage,
  type PublicInspection,
  type PublicMachineDetailV1,
  type PublicMachinePassportV1,
  type PublicMachineSummaryV1,
  type PublicWarranty,
} from "./contracts.ts";
import type {
  PublicKernelImage,
  PublicProjectionKernel,
} from "./kernel.server.ts";

function assembleImage(
  image: PublicKernelImage,
  displayName: string,
  position: number,
): PublicImage {
  return {
    url: image.url,
    alt: image.alt ?? `${displayName} - image ${position}`,
    width: image.width,
    height: image.height,
  };
}

function unknownWarranty(): PublicWarranty {
  return {
    status: "unknown",
    durationMonths: null,
    activatedAt: null,
    expiresAt: null,
  };
}

function unavailableInspection(): PublicInspection {
  return {
    status: "not_available",
    inspectedAt: null,
    summary: null,
  };
}

export function assemblePublicMachineSummaryV1(
  kernel: PublicProjectionKernel,
): PublicMachineSummaryV1 {
  const gallery = kernel.images.map((image, index) =>
    assembleImage(image, kernel.displayName, index + 1),
  );

  return {
    schemaVersion: PUBLIC_MACHINE_SUMMARY_V1_SCHEMA,
    code: kernel.code,
    slug: kernel.slug,
    displayName: kernel.displayName,
    family: kernel.family,
    year: kernel.year,
    screenSizeInches: kernel.screenSizeInches,
    chip: kernel.chip,
    ramGb: kernel.ramGb,
    ssdGb: kernel.ssdGb,
    color: kernel.color,
    price: { amount: kernel.priceAmount, currency: "VND" },
    availability: kernel.availability,
    coverImage: { ...gallery[kernel.coverIndex] },
    imageCount: gallery.length,
    batteryHealthPercent: kernel.batteryHealthPercent,
    cycleCount: kernel.cycleCount,
    cosmeticGrade: kernel.cosmeticGrade,
    conditionSummary: kernel.conditionSummary,
    warranty: unknownWarranty(),
    inspection: unavailableInspection(),
    contextualLabel: kernel.contextualLabel,
    publishedAt: kernel.publishedAt,
    updatedAt: kernel.updatedAt,
  };
}

export function assemblePublicMachinePassportV1(
  kernel: PublicProjectionKernel,
): PublicMachinePassportV1 {
  return {
    schemaVersion: PUBLIC_MACHINE_PASSPORT_V1_SCHEMA,
    code: kernel.code,
    slug: kernel.slug,
    publicStatus: kernel.availability,
    facts: [],
    timeline: [],
    inspection: unavailableInspection(),
    sourceVerification: "unknown",
    repairStatus: "unknown",
    firstPublishedAt: kernel.firstPublishedAt,
    lastPublishedAt: kernel.publishedAt,
  };
}

export function assemblePublicMachineDetailV1(
  kernel: PublicProjectionKernel,
): PublicMachineDetailV1 {
  return {
    schemaVersion: PUBLIC_MACHINE_DETAIL_V1_SCHEMA,
    summary: assemblePublicMachineSummaryV1(kernel),
    gallery: kernel.images.map((image, index) =>
      assembleImage(image, kernel.displayName, index + 1),
    ),
    expertSummary: kernel.expertSummary,
    suitableFor: [...kernel.suitableFor],
    notSuitableFor: [...kernel.notSuitableFor],
    decisionSpecifications: [],
    technicalSpecifications: {},
    includedItems: {
      charger: kernel.includedItems.charger,
      cable: kernel.includedItems.cable,
      box: kernel.includedItems.box,
      bag: kernel.includedItems.bag,
      accessories: [...kernel.includedItems.accessories],
    },
    policyApplicability: [...kernel.policyApplicability],
    passport: assemblePublicMachinePassportV1(kernel),
    relatedMachines: [],
  };
}
