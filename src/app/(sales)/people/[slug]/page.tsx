import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPeopleStoryBySlug } from "@/data/handover/get-people-stories.server";
import styles from "./story.module.css";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/people/[slug]">): Promise<Metadata> {
  const story = await getPeopleStoryBySlug((await params).slug);
  if (!story) notFound();
  return {
    title: story.title,
    description: story.story.slice(0, 155),
    alternates: { canonical: `/people/${story.slug}` },
    openGraph: { title: story.title, description: story.story.slice(0, 155), images: [story.imageUrl] },
  };
}

export default async function PeopleStoryPage({ params }: PageProps<"/people/[slug]">) {
  const story = await getPeopleStoryBySlug((await params).slug);
  if (!story) notFound();
  const date = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(story.occurredAt));
  return (
    <main className={styles.page}>
      <div className={`container ${styles.navigation}`}><Link href="/people">← Trở lại People</Link></div>
      <div className={styles.hero}><Image src={story.imageUrl} alt={`Khoảnh khắc bàn giao của ${story.customerLabel}`} fill priority sizes="100vw" /></div>
      <article className={styles.article}>
        <p className={styles.customer}>{story.customerLabel}</p>
        <h1>{story.title}</h1>
        <time dateTime={story.occurredAt}>{date}</time>
        <div className={styles.story}>{story.story}</div>
      </article>
    </main>
  );
}
