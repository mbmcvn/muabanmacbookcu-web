import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function HowMbmcHelps() {
  const content = homepageContent.approach;

  return (
    <section
      className={`${styles.section} ${styles.approachSection}`}
      aria-labelledby="approach-title"
    >
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h2 id="approach-title">{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <ol className={styles.stepList}>
        {content.steps.map((step, index) => (
          <li key={step.title}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
