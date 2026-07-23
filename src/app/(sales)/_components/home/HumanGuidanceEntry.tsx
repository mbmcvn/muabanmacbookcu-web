import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function HumanGuidanceEntry() {
  const content = homepageContent.guidance;

  return (
    <section
      className={`${styles.section} ${styles.guidanceSection}`}
      aria-labelledby="guidance-title"
    >
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h2 id="guidance-title">{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <div className={styles.guidanceAction}>
        <ContactActionLink
          className={styles.primaryAction}
          label={content.action}
        />
        <p>{content.note}</p>
      </div>
    </section>
  );
}
