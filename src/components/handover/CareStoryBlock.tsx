import type { CareStoryDTO } from "@/data/handover/care-story";
import { CareStoryBody } from "./CareStoryBody";
import { PublicHandoverImage } from "./PublicHandoverImage";
import styles from "./CareStoryBlock.module.css";

export function CareStoryBlock({ story }: { story: CareStoryDTO | null }) {
  if (!story) return null;

  return (
    <section className={styles.block} aria-labelledby="care-story-title">
      <div className={styles.image}>
        <PublicHandoverImage
          src={story.imageUrl}
          alt=""
          fill
          sizes="(max-width: 672px) 100vw, 672px"
        />
      </div>
      <CareStoryBody story={story} />
    </section>
  );
}
