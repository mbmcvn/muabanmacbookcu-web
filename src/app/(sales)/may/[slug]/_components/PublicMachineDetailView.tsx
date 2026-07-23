"use client";

import Link from "next/link";
import type { PublicMachineDetailV1 } from "@/models";
import { useContactChannel, withContactChannel } from "@/hooks/useContactChannel";
import { formatPublicMachineDisplayName } from "@/lib/presentation";
import { DecisionDossier } from "./DecisionDossier";
import { DecisionPanel } from "./DecisionPanel";
import { PublicMachineGallery } from "./PublicMachineGallery";
import { PublicMachineMediaProvider } from "./PublicMachineMediaProvider";
import { PublicSpecifications } from "./SpecificationsAndRecommendation";
import { PoliciesAndSupport } from "./SupportAndSticky";

export function PublicMachineDetailView({ machine }: { machine: PublicMachineDetailV1 }) {
  const { channel } = useContactChannel();
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  return <PublicMachineMediaProvider images={machine.gallery} title={displayName}><div className="container public-detail-page"><nav className="detail-breadcrumb" aria-label="Đường dẫn"><Link href={withContactChannel("/may-dang-co", channel)}>Máy đang có</Link><span aria-hidden="true">/</span><span>{displayName}{summary.color ? ` · ${summary.color}` : ""}</span></nav><div className="detail-hero"><PublicMachineGallery title={displayName} /><DecisionPanel machine={machine} /></div><p className="decision-hook">Phần tiếp theo giúp bạn đối chiếu chiếc máy này với nhu cầu và những điều còn chưa chắc chắn.</p><DecisionDossier machine={machine} /><PublicSpecifications machine={machine} /><PoliciesAndSupport machine={machine} /></div></PublicMachineMediaProvider>;
}
