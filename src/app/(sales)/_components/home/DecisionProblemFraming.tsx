import Image from "next/image";
import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function DecisionProblemFraming() {
  const content = homepageContent.problem;

  return (
    <section
      className={`${styles.section} ${styles.problemSection}`}
      aria-labelledby="problem-title"
    >
      <div className={styles.problemIntroduction}>
        <div className={styles.sectionIntroduction}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h2 id="problem-title">{content.title}</h2>
        </div>
        <div className={styles.problemImage}>
          <Image
            src="/images/home/mid-image.webp"
            alt="MacBook mở trên bàn trong một không gian yên tĩnh và nhiều ánh sáng"
            fill
            sizes="(max-width: 55.99rem) calc(100vw - 2rem), 40vw"
          />
        </div>
      </div>
      <div className={styles.problemCopy}>
        <ul>
          {content.statements.map((statement) => (
            <li key={statement}>
              <span aria-hidden="true">✓</span>
              {statement}
            </li>
          ))}
        </ul>
        <p className={styles.problemConclusion}>{content.conclusion}</p>
      </div>
    </section>
  );
}
