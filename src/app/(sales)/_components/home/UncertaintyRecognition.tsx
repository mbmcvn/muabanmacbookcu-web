import { homepageContent } from "./home-content";
import {
  DecisionTopicGrid,
  SectionHeader,
} from "./HomepagePresentation";
import styles from "./Home.module.css";

export function UncertaintyRecognition() {
  const content = homepageContent.uncertainty;

  return (
    <section
      className={`${styles.section} ${styles.uncertaintySection}`}
      aria-labelledby="uncertainty-title"
    >
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        titleId="uncertainty-title"
        description={content.description}
      />
      <DecisionTopicGrid items={content.concerns} />
    </section>
  );
}
