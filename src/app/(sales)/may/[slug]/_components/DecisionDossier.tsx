import type { PublicMachineDetailV1 } from "@/models";
import { PassportDossier } from "./PassportDossier";
import { MbmcRecommendation } from "./SpecificationsAndRecommendation";
import { MachineEvidenceGrid } from "./MachineEvidence";

export function DecisionDossier({ machine }: { machine: PublicMachineDetailV1 }) {
  return <div className="decision-dossier" aria-label="Hồ sơ và tình trạng thực tế">
    <PassportDossier machine={machine} />
    <MachineEvidenceGrid machine={machine} />
    <MbmcRecommendation machine={machine} />
  </div>;
}
