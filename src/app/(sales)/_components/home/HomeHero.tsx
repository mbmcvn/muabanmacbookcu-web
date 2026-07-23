import Image from "next/image";
import Link from "next/link";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function HomeHero() {
  const content = homepageContent.hero;

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <Image
        className={styles.heroImage}
        src="/images/home/hero-mbmc.webp"
        alt="MacBook trên bàn làm việc với thông điệp MBMC Decision Studio"
        fill
        sizes="100vw"
        priority
      />
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1 id="home-title" aria-label={content.title}>
            {content.titleLines.map((line, index) => (
              <span className={styles.heroTitleLine} key={line}>
                {line}
                {index < content.titleLines.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p className={styles.heroDescription}>{content.description}</p>
          <div className={styles.actions}>
            <ContactActionLink
              className={styles.primaryAction}
              label={content.guidanceAction}
            />
            <Link className={styles.secondaryAction} href="/may-dang-co">
              {content.inventoryAction}
            </Link>
          </div>
          <ul className={styles.heroTrustIndicators} aria-label="Điểm tin cậy">
            {content.trustIndicators.map((indicator) => (
              <li key={indicator}>
                <span aria-hidden="true">✓</span>
                {indicator}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
