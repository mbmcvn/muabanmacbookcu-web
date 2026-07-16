export type PublicMachineAvailability = "available" | "reserved";
export type PublicConditionRank = "S" | "A" | "B" | "C" | "D";

export interface PublicMachineImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isCover: boolean;
  imageType: string | null;
  createdAt: string | null;
}

export interface PublicMachineCard {
  id: string;
  machineId: string;
  slug: string;
  title: string;
  chip: string | null;
  ramGb: number | null;
  storageGb: number | null;
  color: string | null;
  price: number;
  availability: PublicMachineAvailability;
  batteryHealth: number | null;
  conditionRank: PublicConditionRank | null;
  warrantyMonths: number | null;
  tag: string | null;
  coverImage: PublicMachineImage;
  publishedAt: string | null;
}

export interface PublicMachineEvent {
  id: string;
  eventType: string;
  title: string;
  note: string | null;
  createdAt: string;
}

export interface PublicRepairSummary {
  id: string;
  repairType: string;
  issueSummary: string | null;
  solution: string | null;
  publicNote: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface PublicMachineDetail extends PublicMachineCard {
  cycleCount: number | null;
  conditionSummary: string | null;
  mbmcSummary: string | null;
  sourceSummary: string | null;
  suitableFor: string[];
  notSuitableFor: string[];
  inspectionStatus: string;
  inspectedAt: string | null;
  inspectionSummary: string | null;
  chargerIncluded: boolean | null;
  images: PublicMachineImage[];
  events: PublicMachineEvent[];
  repairs: PublicRepairSummary[];
}
