import Image from "next/image";
import { homepageContent } from "./home-content";
import {
  EditorialChecklist,
  SectionHeader,
} from "./HomepagePresentation";
import styles from "./Home.module.css";

export function DecisionProblemFraming() {
  const content = homepageContent.problem;

  return (
    <section
      className={`${styles.section} ${styles.problemSection}`}
      aria-labelledby="problem-title"
    >
      <div className={styles.problemIntroduction}>
        <SectionHeader
          eyebrow={content.eyebrow}
          title={content.title}
          titleId="problem-title"
        />
        <div className={styles.problemImage}>
          <Image
            src="/images/home/mid-image.webp"
            alt="MacBook mở trên bàn trong một không gian yên tĩnh và nhiều ánh sáng"
            fill
            sizes="(max-width: 55.99rem) calc(100vw - 2rem), 40vw"
          />
        </div>
      </div>
      <EditorialChecklist
        items={content.statements}
        conclusion={content.conclusion}
      />
    </section>
  );
}
