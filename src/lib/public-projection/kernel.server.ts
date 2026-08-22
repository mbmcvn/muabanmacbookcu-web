import type {
  PublicAvailability,
  PublicCosmeticGrade,
  PublicIncludedItems,
  PublicMachineExplanationV0,
  PublicImageVariants,
  PublicReservationKind,
} from "./contracts.ts";
import type {
  MachineVerificationItem,
  PublicMachineVerification,
} from "../machine-verification.ts";
import { publicMachineVerifications } from "../machine-verification.ts";

const PUBLIC_IMAGE_TYPES = new Set([
  "cover",
  "exterior",
  "screen",
  "keyboard",
  "bottom",
  "charger",
  "defect",
  "other",
]);
const PUBLIC_IMAGE_STAGES = new Set(["approved", "listing"]);

export type PublicationInput = {
  status: "draft" | "approved" | "published" | "archived";
  slug: string | null;
  revision: number;
  approvedBy: string | null;
  approvedAt: string | null;
  approvedEditorialRevision: number | null;
  publishedBy: string | null;
  firstPublishedAt?: string | null;
  publishedAt: string | null;
  publishedEditorialRevision: number | null;
  updatedAt?: string | null;
};

export type EditorialInput = {
  revision: number;
  publicConditionSummary: string | null;
  expertSummary?: string | null;
  suitableFor?: string[];
  notSuitableFor?: string[];
  contextualLabel?: string | null;
  includedItems?: PublicIncludedItems;
  policyApplicability?: string[];
  reviewedBy: string | null;
  reviewedAt: string | null;
};

export type PublicImageInput = {
  id: string;
  visibility: string;
  imageType: string;
  imageStage: string;
  publicUrl: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder?: number;
  isCover?: boolean;
  variants?: PublicImageVariants;
  [privateProperty: string]: unknown;
};

export type PublicMachineProjectionInput = {
  id?: string;
  code: string | null;
  status: string;
  displayName: string | null;
  modelSpecKey?: string | null;
  verifications?: MachineVerificationItem[];
  family: "Air" | "Pro" | "Unknown";
  year?: number | null;
  screenSizeInches?: number | null;
  chip: string | null;
  ramGb: number | null;
  ssdGb: number | null;
  color: string | null;
  retailPriceExpected: number | null;
  batteryHealthPercent?: number | null;
  cycleCount?: number | null;
  cosmeticGrade?: PublicCosmeticGrade | null;
  reservations?: PublicReservationKind[];
  reservationStateInvalid?: boolean;
  publication: PublicationInput | null;
  editorial: EditorialInput | null;
  machineExplanation?: PublicMachineExplanationV0 | null;
  images: PublicImageInput[];
  privacyValid: boolean;
  [privateProperty: string]: unknown;
};

export type NormalizedPublicImage = {
  sourceKey: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  isCover: boolean;
  variants?: PublicImageVariants;
};

export type NormalizedPublicMachineFacts = {
  code: string | null;
  machineStatus: string;
  displayName: string | null;
  modelSpecKey: string | null;
  verifications: PublicMachineVerification[];
  family: "Air" | "Pro" | "Unknown";
  year: number | null;
  screenSizeInches: number | null;
  chip: string | null;
  ramGb: number | null;
  ssdGb: number | null;
  color: string | null;
  retailPriceExpected: number | null;
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  cosmeticGrade: PublicCosmeticGrade | null;
  reservations: PublicReservationKind[];
  reservationStateInvalid: boolean;
  publication: PublicationInput | null;
  editorial: EditorialInput | null;
  machineExplanation: PublicMachineExplanationV0 | null;
  images: NormalizedPublicImage[];
  privacyValid: boolean;
};

export type PublicKernelImage = {
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  variants?: PublicImageVariants;
};
export type PublicProjectionKernel = {
  code: string;
  slug: string;
  displayName: string;
  modelSpecKey: string | null;
  verifications: PublicMachineVerification[];
  family: "Air" | "Pro" | "Unknown";
  year: number | null;
  screenSizeInches: number | null;
  chip: string;
  ramGb: number;
  ssdGb: number;
  color: string;
  priceAmount: number;
  availability: PublicAvailability;
  reservationKind: PublicReservationKind | null;
  images: PublicKernelImage[];
  coverIndex: number;
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  cosmeticGrade: PublicCosmeticGrade | null;
  conditionSummary: string;
  contextualLabel: string | null;
  expertSummary: string | null;
  suitableFor: string[];
  notSuitableFor: string[];
  includedItems: PublicIncludedItems;
  policyApplicability: string[];
  machineExplanation: PublicMachineExplanationV0 | null;
  firstPublishedAt: string | null;
  publishedAt: string;
  updatedAt: string | null;
};

function isNonBlank(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function filterPublicMachineImages(
  images: PublicImageInput[],
): NormalizedPublicImage[] {
  return images
    .filter(
      (image) =>
        image.visibility === "public" &&
        PUBLIC_IMAGE_TYPES.has(image.imageType) &&
        PUBLIC_IMAGE_STAGES.has(image.imageStage) &&
        isNonBlank(image.publicUrl),
    )
    .map((image) => ({
      sourceKey: image.id,
      url: image.publicUrl!.trim(),
      alt: isNonBlank(image.alt) ? image.alt.trim() : null,
      width: typeof image.width === "number" ? image.width : null,
      height: typeof image.height === "number" ? image.height : null,
      sortOrder: image.sortOrder ?? 0,
      isCover: image.isCover === true,
      ...(image.variants && Object.keys(image.variants).length > 0
        ? { variants: { ...image.variants } }
        : {}),
    }))
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.sourceKey.localeCompare(right.sourceKey),
    );
}

export function normalizePublicMachineFacts(
  input: PublicMachineProjectionInput,
): NormalizedPublicMachineFacts {
  const editorial = input.editorial;

  return {
    code: input.code,
    machineStatus: input.status,
    displayName: input.displayName,
    modelSpecKey: input.modelSpecKey ?? null,
    verifications: publicMachineVerifications(input.verifications ?? []),
    family: input.family,
    year: input.year ?? null,
    screenSizeInches: input.screenSizeInches ?? null,
    chip: input.chip,
    ramGb: input.ramGb,
    ssdGb: input.ssdGb,
    color: input.color,
    retailPriceExpected: input.retailPriceExpected,
    batteryHealthPercent: input.batteryHealthPercent ?? null,
    cycleCount: input.cycleCount ?? null,
    cosmeticGrade: input.cosmeticGrade ?? null,
    reservations: [...(input.reservations ?? [])],
    reservationStateInvalid: input.reservationStateInvalid === true,
    publication: input.publication ? { ...input.publication } : null,
    editorial: editorial
      ? {
          ...editorial,
          suitableFor: [...(editorial.suitableFor ?? [])],
          notSuitableFor: [...(editorial.notSuitableFor ?? [])],
          includedItems: editorial.includedItems
            ? {
                charger: editorial.includedItems.charger,
                cable: editorial.includedItems.cable,
                box: editorial.includedItems.box,
                bag: editorial.includedItems.bag,
                accessories: [...editorial.includedItems.accessories],
              }
            : undefined,
          policyApplicability: [...(editorial.policyApplicability ?? [])],
        }
      : null,
    machineExplanation: input.machineExplanation
      ? {
          audience: input.machineExplanation.audience,
          status: input.machineExplanation.status,
          blocks: input.machineExplanation.blocks.map((block) => ({
            ...block,
          })),
          notes: [...input.machineExplanation.notes],
        }
      : null,
    images: filterPublicMachineImages(input.images),
    privacyValid: input.privacyValid,
  };
}
