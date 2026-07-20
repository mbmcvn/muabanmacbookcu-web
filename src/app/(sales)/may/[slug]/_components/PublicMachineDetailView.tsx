import Link from "next/link";
import type { PublicMachineDetailV1 } from "@/models";
import { DetailedImages, RealCondition } from "./ConditionAndImages";
import { DecisionPanel } from "./DecisionPanel";
import { PassportDossier } from "./PassportDossier";
import { PublicMachineGallery } from "./PublicMachineGallery";
import { MbmcRecommendation, PublicSpecifications } from "./SpecificationsAndRecommendation";
import { PoliciesAndSupport } from "./SupportAndSticky";
import { DecisionFactGrid } from "./TrustAndFacts";

export function PublicMachineDetailView({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  return <div className="container public-detail-page"><nav className="detail-breadcrumb" aria-label="Đường dẫn"><Link href="/may-dang-co">Máy đang có</Link><span aria-hidden="true">/</span><span>{summary.displayName}{summary.color ? ` · ${summary.color}` : ""}</span></nav><div className="detail-hero"><PublicMachineGallery images={machine.gallery} title={summary.displayName} /><DecisionPanel machine={machine} /></div><MbmcRecommendation machine={machine} /><DecisionFactGrid machine={machine} /><PassportDossier machine={machine} /><RealCondition machine={machine} /><DetailedImages machine={machine} /><PublicSpecifications machine={machine} /><PoliciesAndSupport machine={machine} /></div>;
}