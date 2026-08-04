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
    <div className="dossier-stage dossier-stage-decision" id="danh-gia-phu-hop">
      <DecisionSummary machine={machine} />
      <div className="dossier-pair dossier-fit-pair"><SuitabilityAssessment machine={machine} /></div>
    </div>
    <div className="dossier-stage dossier-stage-public-record" id="ho-so-cong-khai">
      <ExpertSummary machine={machine} />
      <div className="dossier-pair dossier-status-pair"><VerifiedPublicInformation machine={machine} /><PublicInformationLimitations machine={machine} /></div>
    </div>
    <div className="dossier-stage dossier-stage-supporting" id="thong-tin-ho-tro">
      <MachineEvidenceGrid machine={machine} />
      <DetailedImages />
    </div>
    <div className="dossier-stage dossier-stage-passport" id="passport-cong-khai"><PassportDossier machine={machine} /></div>
  </div>;
}
