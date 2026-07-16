export interface Money {
  amount: number;
  currency: "VND";
}

export type MachineAvailability =
  | "available"
  | "reserved"
  | "sold"
  | "unavailable";

export type MachineConditionGrade =
  | "excellent"
  | "very-good"
  | "good"
  | "fair";

export interface MachineImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  position: number;
}

export interface DecisionSpecifications {
  chip: string;
  ramGb: number;
  storageGb: number;
  batteryHealthPercent?: number;
  cycleCount?: number;
  cosmeticCondition: MachineConditionGrade;
  warrantyMonths?: number;
  inspectionResult: "passed" | "passed-with-notes";
}

export interface TechnicalSpecification {
  label: string;
  value: string;
}

export interface TechnicalSpecifications {
  groups: Array<{
    title: string;
    items: TechnicalSpecification[];
  }>;
}

export interface ConditionNote {
  area: "body" | "screen" | "keyboard" | "battery" | "other";
  summary: string;
  imageUrl?: string;
}

export interface InspectionItem {
  label: string;
  result: "passed" | "note";
  note?: string;
}

export interface MachinePreview {
  slug: string;
  publicCode: string;
  displayName: string;
  shortName: string;
  color: string;
  contextualLabel?: "Mới nhập" | "Giá tốt" | "Cấu hình cao";
  price: Money;
  availability: MachineAvailability;
  thumbnail: MachineImage;
  decisionSpecifications: DecisionSpecifications;
  conditionSummary: string;
  updatedAt: string;
}

export interface MachineDetail extends MachinePreview {
  images: MachineImage[];
  expertSummary: string;
  technicalSpecifications: TechnicalSpecifications;
  conditionNotes: ConditionNote[];
  includedItems: string[];
  passport: import("./passport").MachinePassport;
}
