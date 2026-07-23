import type { PublicMachineDetailV1 } from "@/models";
import { PassportDossier } from "./PassportDossier";
import { ExpertSummary, SuitabilityAssessment } from "./SpecificationsAndRecommendation";
import { MachineEvidenceGrid } from "./MachineEvidence";
import { DecisionSummary } from "./DecisionSummary";
import {
  PublicInformationLimitations,
  VerifiedPublicInformation,
} from "./PublicInformationStatus";
import { DetailedImages } from "./ConditionAndImages";

export function DecisionDossier({ machine }: { machine: PublicMachineDetailV1 }) {
  return <div className="decision-dossier" aria-label="Hồ sơ và tình trạng thực tế">
    <DecisionSummary machine={machine} />
    <SuitabilityAssessment machine={machine} />
    <ExpertSummary machine={machine} />
    <VerifiedPublicInformation machine={machine} />
    <PublicInformationLimitations machine={machine} />
    <MachineEvidenceGrid machine={machine} />
    <DetailedImages />
    <PassportDossier machine={machine} />
  </div>;
}
