import { DecisionProblemFraming } from "./DecisionProblemFraming";
import { HomeHero } from "./HomeHero";
import { HowMbmcHelps } from "./HowMbmcHelps";
import { UncertaintyRecognition } from "./UncertaintyRecognition";
import styles from "./Home.module.css";

export function HomeView() {
  return (
    <div className={`container ${styles.home}`}>
      <HomeHero />
      <UncertaintyRecognition />
      <DecisionProblemFraming />
      <HowMbmcHelps />
    </div>
  );
}
