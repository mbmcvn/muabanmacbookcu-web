import Image from "next/image";
import Link from "next/link";
import type { HandoverStoryCardModel } from "./HandoverStoryCardModel";
import styles from "./HandoverStoryCard.module.css";

export function HandoverStoryCard({
  story,
}: {
  story: HandoverStoryCardModel;
}) {
  const content = (
    <article className={styles.card}>
      <div className={styles.image}>
        <Image
          src={story.imageUrl}
          alt={`Khoảnh khắc bàn giao của ${story.customerLabel}`}
          fill
          sizes="(min-width: 56rem) 42vw, 100vw"
        />
      </div>
      <div className={styles.copy}>
        <p className={styles.customer}>{story.customerLabel}</p>
        <h3>{story.title}</h3>
        <p className={styles.excerpt}>{story.excerpt}</p>
        {story.href ? (
          <span className={styles.cta} aria-hidden="true">
            Đọc câu chuyện →
          </span>
        ) : null}
      </div>
    </article>
  );

  return story.href ? (
    <Link className={styles.link} href={story.href}>
      {content}
    </Link>
  ) : (
    content
  );
}
