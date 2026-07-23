import type { PublicMachineDetailV1 } from "@/models";
import { PassportDossier } from "./PassportDossier";
import { ExpertSummary, SuitabilityAssessment } from "./SpecificationsAndRecommendation";
import { MachineEvidenceGrid } from "./MachineEvidence";
import { DecisionSummary } from "./DecisionSummary";
import {
  PublicInformationLimitations,
  VerifiedPublicInformation,
} from "./PublicInformationStatus";

export function DecisionDossier({ machine }: { machine: PublicMachineDetailV1 }) {
  return <div className="decision-dossier" aria-label="Hồ sơ và tình trạng thực tế">
    <DecisionSummary />
    <SuitabilityAssessment machine={machine} />
    <ExpertSummary machine={machine} />
    <VerifiedPublicInformation machine={machine} />
    <PublicInformationLimitations machine={machine} />
    <PassportDossier machine={machine} />
    <MachineEvidenceGrid machine={machine} />
  </div>;
}
