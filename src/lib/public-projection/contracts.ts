export const PUBLIC_MACHINE_SUMMARY_V1_SCHEMA =
  "public-machine-summary.v1" as const;
export const PUBLIC_MACHINE_DETAIL_V1_SCHEMA =
  "public-machine-detail.v1" as const;
export const PUBLIC_MACHINE_PASSPORT_V1_SCHEMA =
  "public-machine-passport.v1" as const;

export type ISODateTime = string;
export type PublicMoney = { amount: number; currency: "VND" };
export type PublicImage = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};
export type PublicAvailability =
  | "available"
  | "reserved"
  | "sold"
  | "unavailable";
export type PublicRepairStatus =
  | "repaired"
  | "no_internal_repair_history"
  | "no_repair_evidence_found"
  | "unknown";
export type PublicSourceVerification =
  | "verified"
  | "partially_verified"
  | "not_verified"
  | "unknown";
export type PublicCosmeticGrade = string;

export type PublicWarranty =
  | {
      status: "unknown";
      durationMonths: null;
      activatedAt: null;
      expiresAt: null;
    }
  | {
      status: "not_applicable";
      durationMonths: null;
      activatedAt: null;
      expiresAt: null;
    }
  | {
      status: "active" | "expired";
      durationMonths: number;
      activatedAt: ISODateTime;
      expiresAt: ISODateTime;
    };

export type PublicInspection =
  | { status: "not_available"; inspectedAt: null; summary: null }
  | {
      status: "passed" | "failed" | "incomplete";
      inspectedAt: ISODateTime;
      summary: string | null;
    };

export type PublicIncludedItems = {
  charger: boolean | null;
  cable: boolean | null;
  box: boolean | null;
  bag: boolean | null;
  accessories: string[];
};
export type PublicFact = { label: string; value: string };
export type PublicTimelineEvent = {
  type: string;
  title: string;
  occurredAt: ISODateTime;
};

export interface PublicMachineSummaryV1 {
  schemaVersion: typeof PUBLIC_MACHINE_SUMMARY_V1_SCHEMA;
  code: string;
  slug: string;
  displayName: string;
  family: "Air" | "Pro" | "Unknown";
  year: number | null;
  screenSizeInches: number | null;
  chip: string | null;
  ramGb: number | null;
  ssdGb: number | null;
  color: string | null;
  price: PublicMoney;
  availability: PublicAvailability;
  coverImage: PublicImage;
  imageCount: number;
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  cosmeticGrade: PublicCosmeticGrade | null;
  conditionSummary: string;
  warranty: PublicWarranty;
  inspection: PublicInspection;
  contextualLabel: string | null;
  publishedAt: ISODateTime | null;
  updatedAt: ISODateTime | null;
}

export interface PublicMachinePassportV1 {
  schemaVersion: typeof PUBLIC_MACHINE_PASSPORT_V1_SCHEMA;
  code: string;
  slug: string;
  publicStatus: PublicAvailability;
  facts: PublicFact[];
  timeline: PublicTimelineEvent[];
  inspection: PublicInspection;
  sourceVerification: PublicSourceVerification;
  repairStatus: PublicRepairStatus;
  firstPublishedAt: ISODateTime | null;
  lastPublishedAt: ISODateTime | null;
}

export interface PublicMachineDetailV1 {
  schemaVersion: typeof PUBLIC_MACHINE_DETAIL_V1_SCHEMA;
  summary: PublicMachineSummaryV1;
  gallery: PublicImage[];
  expertSummary: string | null;
  suitableFor: string[];
  notSuitableFor: string[];
  decisionSpecifications: PublicFact[];
  technicalSpecifications: Record<
    string,
    string | number | boolean | null
  >;
  includedItems: PublicIncludedItems;
  policyApplicability: string[];
  passport: PublicMachinePassportV1;
  relatedMachines: PublicMachineSummaryV1[];
}

export const PUBLIC_MACHINE_SUMMARY_V1_KEYS = [
  "schemaVersion", "code", "slug", "displayName", "family", "year",
  "screenSizeInches", "chip", "ramGb", "ssdGb", "color", "price",
  "availability", "coverImage", "imageCount", "batteryHealthPercent",
  "cycleCount", "cosmeticGrade", "conditionSummary", "warranty",
  "inspection", "contextualLabel", "publishedAt", "updatedAt",
] as const satisfies readonly (keyof PublicMachineSummaryV1)[];

export const PUBLIC_MACHINE_DETAIL_V1_KEYS = [
  "schemaVersion", "summary", "gallery", "expertSummary", "suitableFor",
  "notSuitableFor", "decisionSpecifications", "technicalSpecifications",
  "includedItems", "policyApplicability", "passport", "relatedMachines",
] as const satisfies readonly (keyof PublicMachineDetailV1)[];

export const PUBLIC_MACHINE_PASSPORT_V1_KEYS = [
  "schemaVersion", "code", "slug", "publicStatus", "facts", "timeline",
  "inspection", "sourceVerification", "repairStatus", "firstPublishedAt",
  "lastPublishedAt",
] as const satisfies readonly (keyof PublicMachinePassportV1)[];
