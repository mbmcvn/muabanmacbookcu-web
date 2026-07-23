import { homepageContent } from "./home-content";
import {
  DecisionTimeline,
  SectionHeader,
} from "./HomepagePresentation";
import styles from "./Home.module.css";

export function HowMbmcHelps() {
  const content = homepageContent.approach;

  return (
    <section
      className={`${styles.section} ${styles.approachSection}`}
      aria-labelledby="approach-title"
    >
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        titleId="approach-title"
        description={content.description}
      />
      <DecisionTimeline steps={content.steps} />
    </section>
  );
}
