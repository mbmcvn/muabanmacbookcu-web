import Link from "next/link";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { homepageContent } from "./home-content";
import { SectionHeader } from "./HomepagePresentation";
import styles from "./Home.module.css";

export function ClosingDecisionCta() {
  const content = homepageContent.closing;

  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        titleId="closing-title"
        description={content.description}
      />
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
