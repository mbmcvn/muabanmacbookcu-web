import { homepageContent } from "./home-content";
import {
  SectionHeader,
  TrustPrincipleList,
} from "./HomepagePresentation";
import styles from "./Home.module.css";

export function HomeTrustOverview() {
  const content = homepageContent.trust;

  return (
    <section className={styles.section} aria-labelledby="trust-title">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        titleId="trust-title"
        description={content.description}
      />
      <TrustPrincipleList points={content.points} />
    </section>
  );
}
