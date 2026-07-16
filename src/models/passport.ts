import type { InspectionItem, MachineAvailability } from "./machine";

export interface PassportIdentity {
  publicReference: string;
  model: string;
  modelYear?: number;
}

export interface PassportStatus {
  availability: MachineAvailability;
  verifiedAt: string;
}

export interface PassportFact {
  label: string;
  value: string;
}

export interface PassportTimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export interface InspectionPreview {
  result: "passed" | "passed-with-notes";
  items: InspectionItem[];
}

export interface SourceVerification {
  label: string;
  verified: boolean;
  note?: string;
}

export interface MachinePassport {
  identity: PassportIdentity;
  status: PassportStatus;
  facts: PassportFact[];
  timeline: PassportTimelineEvent[];
  inspection: InspectionPreview;
  sourceVerification: SourceVerification;
}
