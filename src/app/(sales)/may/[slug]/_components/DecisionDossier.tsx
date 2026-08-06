import type { PublicMachineDetailV1 } from "@/models";
import { PassportDossier } from "./PassportDossier";
import { ExpertSummary, PublicSpecifications } from "./PublicSpecifications";
import { PublicMachineFitRecommendation } from "./PublicMachineFitRecommendation";
import { MachineEvidenceGrid } from "./MachineEvidence";
import { DecisionSummary } from "./DecisionSummary";
import {
  PublicInformationLimitations,
  VerifiedPublicInformation,
} from "./PublicInformationStatus";
import { DetailedImages } from "./ConditionAndImages";
import { MachineVerification } from "./MachineVerification";

export function DecisionDossier({ machine }: { machine: PublicMachineDetailV1 }) {
  return <div className="decision-dossier" aria-label="Hồ sơ và tình trạng thực tế">
    <div className="dossier-stage dossier-stage-decision" id="danh-gia-phu-hop">
      <DecisionSummary />
      <PublicMachineFitRecommendation machine={machine} />
      <MachineVerification items={machine.verifications} />
      <div className="dossier-pair dossier-status-pair" id="ho-so-cong-khai"><VerifiedPublicInformation machine={machine} /><PublicInformationLimitations machine={machine} /></div>
      <ExpertSummary machine={machine} />
    </div>
    <div className="dossier-stage dossier-stage-supporting" id="thong-tin-ho-tro">
      <MachineEvidenceGrid machine={machine} />
      <DetailedImages />
    </div>
    <PublicSpecifications machine={machine} />
    <div className="dossier-stage dossier-stage-passport" id="passport-cong-khai"><PassportDossier machine={machine} /></div>
  </div>;
}
