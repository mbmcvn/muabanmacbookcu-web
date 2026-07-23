import Link from "next/link";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { homepageContent } from "./home-content";
import styles from "./Home.module.css";

export function ClosingDecisionCta() {
  const content = homepageContent.closing;

  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <p className={styles.eyebrow}>{content.eyebrow}</p>
      <h2 id="closing-title">{content.title}</h2>
      <p>{content.description}</p>
      <div className={styles.actions}>
        <ContactActionLink
          className={styles.primaryAction}
          label={content.guidanceAction}
        />
        <Link className={styles.secondaryAction} href="/may-dang-co">
          {content.inventoryAction}
        </Link>
      </div>
    </section>
  );
}
