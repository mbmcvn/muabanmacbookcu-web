import type { MachinePassport } from "@/models";
import { InspectionPreview } from "./InspectionPreview";
import { PassportFacts } from "./PassportFacts";
import { PassportIdentity } from "./PassportIdentity";
import { PassportStatus } from "./PassportStatus";
import { PassportTimeline } from "./PassportTimeline";
import { SourceVerification } from "./SourceVerification";

export function MachinePassportView({ passport }: { passport: MachinePassport }) {
  return <section aria-labelledby="passport-title"><h2 id="passport-title">Passport của máy</h2><PassportIdentity identity={passport.identity} /><PassportStatus status={passport.status} /><PassportFacts facts={passport.facts} /><InspectionPreview inspection={passport.inspection} /><SourceVerification source={passport.sourceVerification} /><PassportTimeline events={passport.timeline} /></section>;
}
