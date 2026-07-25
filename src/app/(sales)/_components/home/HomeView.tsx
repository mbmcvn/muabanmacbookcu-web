import type { PublicMachineSummaryV1 } from "@/models";
import type { PublicInventoryLoadState } from "@/data/machines/public-inventory-load-state";
import type { HomepageStoryDTO } from "@/data/handover/homepage-story";
import { ClosingDecisionCta } from "./ClosingDecisionCta";
import { DecisionProblemFraming } from "./DecisionProblemFraming";
import { HomeHero } from "./HomeHero";
import { HowMbmcHelps } from "./HowMbmcHelps";
import { HumanGuidanceEntry } from "./HumanGuidanceEntry";
import { AvailableMachines } from "./AvailableMachines";
import { HomeTrustOverview } from "./HomeTrustOverview";
import { HandoverStorySection } from "./HandoverStorySection";
import { UncertaintyRecognition } from "./UncertaintyRecognition";
import styles from "./Home.module.css";

export function HomeView({
  machineState,
  homepageStories,
}: {
  machineState: PublicInventoryLoadState<PublicMachineSummaryV1>;
  homepageStories: HomepageStoryDTO[];
}) {
  return (
    <>
      <HomeHero />
      <div className={`container ${styles.home}`}>
        <UncertaintyRecognition />
        <DecisionProblemFraming />
        <HowMbmcHelps />
        <HumanGuidanceEntry />
        <AvailableMachines state={machineState} />
        <HandoverStorySection stories={homepageStories} />
        <HomeTrustOverview />
        <ClosingDecisionCta />
      </div>
    </>
  );
}
