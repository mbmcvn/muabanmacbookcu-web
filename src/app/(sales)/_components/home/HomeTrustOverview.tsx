import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function HomeTrustOverview() {
  const content = homepageContent.trust;

  return (
    <section className={styles.section} aria-labelledby="trust-title">
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h2 id="trust-title">{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <ul className={styles.trustList}>
        {content.points.map((point) => (
          <li key={point.title}>
            <h3>{point.title}</h3>
            <p>{point.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
