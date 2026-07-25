"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CareStoryDTO } from "@/data/handover/care-story";
import styles from "./CareStoryBlock.module.css";

export function CareStoryBody({ story }: { story: CareStoryDTO }) {
  const storyId = useId();
  const storyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [expandable, setExpandable] = useState(false);

  useLayoutEffect(() => {
    const element = storyRef.current;
    if (!element) return;
    const measure = () => {
      if (!expanded) {
        setExpandable(element.scrollHeight > element.clientHeight + 1);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [expanded]);

  return (
    <div className={styles.content}>
      <p className={styles.label}>{story.customerLabel}</p>
      <h2 id="care-story-title">{story.title}</h2>
      <p
        ref={storyRef}
        id={storyId}
        className={`${styles.story} ${expanded ? "" : styles.storyCollapsed}`}
      >
        {story.story}
      </p>
      {expandable && (
        <button
          type="button"
          className={styles.expand}
          aria-expanded={expanded}
          aria-controls={storyId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
      <time dateTime={story.handoverDate}>
        {new Intl.DateTimeFormat("vi-VN", {
          dateStyle: "long",
          timeZone: "Asia/Ho_Chi_Minh",
        }).format(new Date(story.handoverDate))}
      </time>
      {story.peopleHref && (
        <Link href={story.peopleHref} className={styles.link}>
          Đọc câu chuyện đầy đủ <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
