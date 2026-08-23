import {
  PUBLIC_MACHINE_DETAIL_V1_SCHEMA,
  PUBLIC_MACHINE_DETAIL_V2_SCHEMA,
  PUBLIC_MACHINE_PASSPORT_V1_SCHEMA,
  PUBLIC_MACHINE_SUMMARY_V1_SCHEMA,
  type PublicImage,
  type PublicInspection,
  type PublicMachineDetailV1,
  type PublicMachineDetailV2,
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
    ...(image.variants ? { variants: { ...image.variants } } : {}),
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
    reservationKind: kernel.reservationKind,
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

function assemblePublicMachineDetailCurrent(
  kernel: PublicProjectionKernel,
): Omit<PublicMachineDetailV2, "schemaVersion"> {
  return {
    summary: assemblePublicMachineSummaryV1(kernel),
    modelSpecKey: kernel.modelSpecKey,
    verifications: kernel.verifications.map((item) => ({ ...item })),
    gallery: kernel.images.map((image, index) =>
      assembleImage(image, kernel.displayName, index + 1),
    ),
    ...(kernel.suitableAudiences.length > 0
      ? { suitableAudiences: [...kernel.suitableAudiences] }
      : {}),
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
    ...(kernel.machineExplanation
      ? {
          machineExplanation: {
            audience: kernel.machineExplanation.audience,
            status: kernel.machineExplanation.status,
            blocks: kernel.machineExplanation.blocks.map((block) => ({
              ...block,
            })),
            notes: [...kernel.machineExplanation.notes],
          },
        }
      : {}),
    passport: assemblePublicMachinePassportV1(kernel),
    relatedMachines: [],
  };
}

export function assemblePublicMachineDetailV1(
  kernel: PublicProjectionKernel,
): PublicMachineDetailV1 {
  const current = assemblePublicMachineDetailCurrent(kernel);
  return {
    schemaVersion: PUBLIC_MACHINE_DETAIL_V1_SCHEMA,
    summary: current.summary,
    modelSpecKey: current.modelSpecKey,
    verifications: current.verifications,
    gallery: current.gallery,
    expertSummary: kernel.expertSummary,
    suitableFor: [...kernel.suitableFor],
    notSuitableFor: [...kernel.notSuitableFor],
    ...(current.suitableAudiences
      ? { suitableAudiences: current.suitableAudiences }
      : {}),
    decisionSpecifications: current.decisionSpecifications,
    technicalSpecifications: current.technicalSpecifications,
    includedItems: current.includedItems,
    policyApplicability: current.policyApplicability,
    ...(current.machineExplanation
      ? { machineExplanation: current.machineExplanation }
      : {}),
    passport: current.passport,
    relatedMachines: current.relatedMachines,
  };
}

export function assemblePublicMachineDetailV2(
  kernel: PublicProjectionKernel,
): PublicMachineDetailV2 {
  return {
    schemaVersion: PUBLIC_MACHINE_DETAIL_V2_SCHEMA,
    ...assemblePublicMachineDetailCurrent(kernel),
  };
}
