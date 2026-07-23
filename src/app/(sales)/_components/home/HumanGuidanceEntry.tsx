import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { homepageContent } from "./home-content";
import {
  GuidancePanel,
  SectionHeader,
} from "./HomepagePresentation";
import styles from "./Home.module.css";

export function HumanGuidanceEntry() {
  const content = homepageContent.guidance;

  return (
    <section
      className={`${styles.section} ${styles.guidanceSection}`}
      aria-labelledby="guidance-title"
    >
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        titleId="guidance-title"
        description={content.description}
      />
      <GuidancePanel
        action={
          <ContactActionLink
            className={styles.primaryAction}
            label={content.action}
          />
        }
        note={content.note}
      />
    </section>
  );
}
