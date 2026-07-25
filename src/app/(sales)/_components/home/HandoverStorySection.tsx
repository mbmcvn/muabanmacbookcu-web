import type { HomepageStoryDTO } from "@/data/handover/homepage-story";
import { HandoverStoryCard } from "@/components/handover/HandoverStoryCard";
import { mapHomepageStoryToCard } from "@/components/handover/HandoverStoryCardModel";
import styles from "./Home.module.css";

export function HandoverStorySection({
  stories,
}: {
  stories: HomepageStoryDTO[];
}) {
  if (stories.length === 0) return null;

  return (
    <section
      className={`${styles.section} ${styles.storySection}`}
      aria-labelledby="handover-story-heading"
    >
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>Người thật, việc thật</p>
        <h2 id="handover-story-heading">Những câu chuyện từ khách hàng MBMC</h2>
        <p>
          Mỗi chiếc MacBook được chọn cho một công việc, một kế hoạch và một
          chặng đường riêng.
        </p>
      </div>
      <div className={styles.storyGrid}>
        {stories.map((story) => (
          <HandoverStoryCard
            key={story.slug}
            story={mapHomepageStoryToCard(story)}
          />
        ))}
      </div>
    </section>
  );
}
