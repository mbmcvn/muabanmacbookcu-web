import type { Metadata } from "next";
import { getPeopleStories } from "@/data/handover/get-people-stories.server";
import { HandoverStoryCard } from "@/components/handover/HandoverStoryCard";
import { mapPeopleStoryToCard } from "@/components/handover/HandoverStoryCardModel";
import styles from "./people.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Câu chuyện khách hàng",
  description: "Những câu chuyện bàn giao MacBook từ khách hàng MBMC.",
  alternates: { canonical: "/people" },
};

export default async function PeoplePage() {
  const stories = await getPeopleStories();
  return (
    <main className={`container ${styles.archive}`}>
      <header className={styles.introduction}>
        <p>People</p>
        <h1>Những câu chuyện bắt đầu cùng một chiếc MacBook</h1>
        <div>Mỗi lần bàn giao là một công việc, một kế hoạch và một chặng đường riêng.</div>
      </header>
      {stories.length ? (
        <div className={styles.grid}>
          {stories.map((story) => (
            <HandoverStoryCard
              key={story.slug}
              story={mapPeopleStoryToCard(story)}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Kho lưu trữ đang được chuẩn bị.</p>
      )}
    </main>
  );
}
