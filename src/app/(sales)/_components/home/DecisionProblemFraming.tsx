import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function DecisionProblemFraming() {
  const content = homepageContent.problem;

  return (
    <section
      className={`${styles.section} ${styles.problemSection}`}
      aria-labelledby="problem-title"
    >
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h2 id="problem-title">{content.title}</h2>
      </div>
      <div className={styles.problemCopy}>
        {content.statements.map((statement) => (
          <p key={statement}>{statement}</p>
        ))}
        <p className={styles.problemConclusion}>{content.conclusion}</p>
      </div>
    </section>
  );
}
