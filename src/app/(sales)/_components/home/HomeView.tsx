import type { PublicMachineSummaryV1 } from "@/models";
import type { PublicInventoryLoadState } from "@/data/machines/public-inventory-load-state";
import { ClosingDecisionCta } from "./ClosingDecisionCta";
import { DecisionProblemFraming } from "./DecisionProblemFraming";
import { HomeHero } from "./HomeHero";
import { HowMbmcHelps } from "./HowMbmcHelps";
import { HumanGuidanceEntry } from "./HumanGuidanceEntry";
import { AvailableMachines } from "./AvailableMachines";
import { UncertaintyRecognition } from "./UncertaintyRecognition";
import styles from "./Home.module.css";

export function HomeView({
  machineState,
}: {
  machineState: PublicInventoryLoadState<PublicMachineSummaryV1>;
}) {
  return (
    <div className={`container ${styles.home}`}>
      <HomeHero />
      <UncertaintyRecognition />
      <DecisionProblemFraming />
      <HowMbmcHelps />
      <HumanGuidanceEntry />
      <AvailableMachines state={machineState} />
      <ClosingDecisionCta />
    </div>
  );
}
