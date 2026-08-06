"use client";

import Link from "next/link";
import type { PublicMachineDetailV1 } from "@/models";
import { useContactChannel, withContactChannel } from "@/hooks/useContactChannel";
import { formatPublicMachineDisplayName } from "@/lib/presentation";
import { DecisionDossier } from "./DecisionDossier";
import { DecisionPanel } from "./DecisionPanel";
import { PublicMachineGallery } from "./PublicMachineGallery";
import { PublicMachineMediaProvider } from "./PublicMachineMediaProvider";
import { PoliciesAndSupport } from "./SupportAndSticky";
import { MachineDetailIcon } from "./MachineDetailIcon";
import { MachinePolicySummary } from "./MachinePolicySummary";
import { fitRecommendationForMachine } from "./PublicMachineFitRecommendation";
import { hasMachineFitRecommendation } from "@/lib/public-machine-fit-recommendation";

export function PublicMachineDetailView({ machine }: { machine: PublicMachineDetailV1 }) {
  const { channel } = useContactChannel();
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  const hasFitRecommendation = hasMachineFitRecommendation(fitRecommendationForMachine(machine));
  return <PublicMachineMediaProvider images={machine.gallery} title={displayName}>
    <div className="container public-detail-page">
      <nav className="detail-breadcrumb" aria-label="Đường dẫn"><Link href={withContactChannel("/may-dang-co", channel)}>Máy đang có</Link><span aria-hidden="true">/</span><span>{displayName}{summary.color ? ` · ${summary.color}` : ""}</span></nav>
      <div className="detail-hero"><PublicMachineGallery title={displayName} /><DecisionPanel machine={machine} /></div>
      <div className="detail-reading-entry">
        <p className="decision-hook">Phần tiếp theo giúp bạn đối chiếu chiếc máy này với nhu cầu và những điều còn chưa chắc chắn.</p>
        <nav className="dossier-navigation" aria-label="Nội dung hồ sơ quyết định">{hasFitRecommendation ? <a href="#danh-gia-phu-hop">Độ phù hợp</a> : null}<a href="#ho-so-cong-khai"><MachineDetailIcon name="trust" />Đã biết và chưa biết</a><a href="#thong-tin-ho-tro"><MachineDetailIcon name="condition" />Tình trạng thực tế</a><a href="#passport-cong-khai"><MachineDetailIcon name="passport" />Passport</a></nav>
      </div>
      <DecisionDossier machine={machine} />
      <MachinePolicySummary machine={machine} />
      <PoliciesAndSupport machine={machine} />
    </div>
  </PublicMachineMediaProvider>;
}
