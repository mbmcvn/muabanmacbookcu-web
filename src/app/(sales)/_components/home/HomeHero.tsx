import Link from "next/link";
import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function HomeHero() {
  const content = homepageContent.hero;

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <p className={styles.eyebrow}>{content.eyebrow}</p>
      <h1 id="home-title">{content.title}</h1>
      <p className={styles.heroDescription}>{content.description}</p>
      <div className={styles.actions}>
        <Link className={styles.primaryAction} href="/may-dang-co">
          {content.inventoryAction}
        </Link>
      </div>
    </section>
  );
}
