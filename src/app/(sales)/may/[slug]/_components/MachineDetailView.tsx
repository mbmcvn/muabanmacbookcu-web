import type { ContactChannel, MachineDetail } from "@/models";
import { ContactCTA } from "@/components/contact/ContactCTA";
import { MachinePassportView } from "@/components/passport/MachinePassportView";
import { CompareAlternatives } from "./CompareAlternatives";
import { DecisionSpecificationsView } from "./DecisionSpecificationsView";
import { IncludedItems } from "./IncludedItems";
import { MachineBreadcrumbs } from "./MachineBreadcrumbs";
import { MachineCondition } from "./MachineCondition";
import { MachineExpertSummary } from "./MachineExpertSummary";
import { MachineGallery } from "./MachineGallery";
import { MachineSummary } from "./MachineSummary";
import { SalesProcess } from "./SalesProcess";
import { TechnicalSpecificationsView } from "./TechnicalSpecificationsView";

export function MachineDetailView({ machine, channels }: { machine: MachineDetail; channels: ContactChannel[] }) {
  return <div className="container page-shell"><MachineBreadcrumbs name={machine.displayName} /><MachineGallery images={machine.images} /><MachineSummary machine={machine} /><DecisionSpecificationsView specifications={machine.decisionSpecifications} /><MachineExpertSummary summary={machine.expertSummary} /><ContactCTA channels={channels} /><MachinePassportView passport={machine.passport} /><MachineCondition summary={machine.conditionSummary} notes={machine.conditionNotes} /><TechnicalSpecificationsView specifications={machine.technicalSpecifications} /><IncludedItems items={machine.includedItems} /><SalesProcess /><CompareAlternatives /></div>;
}
