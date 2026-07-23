import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function UncertaintyRecognition() {
  const content = homepageContent.uncertainty;

  return (
    <section className={styles.section} aria-labelledby="uncertainty-title">
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>{content.eyebrow}</p>
        <h2 id="uncertainty-title">{content.title}</h2>
        <p>{content.description}</p>
      </div>
      <ul className={styles.concernList}>
        {content.concerns.map((concern) => (
          <li key={concern}>{concern}</li>
        ))}
      </ul>
    </section>
  );
}
