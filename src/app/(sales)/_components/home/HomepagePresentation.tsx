import type { ReactNode } from "react";
import styles from "./Home.module.css";

export function SectionHeader({
  eyebrow,
  title,
  titleId,
  description,
}: {
  eyebrow: string;
  title: string;
  titleId: string;
  description?: string;
}) {
  return (
    <header className={styles.sectionIntroduction}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={titleId}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

export function DecisionTopicGrid({ items }: { items: readonly string[] }) {
  return (
    <ul className={styles.concernList}>
      {items.map((item) => (
        <li key={item}>
          <span className={styles.topicMarker} aria-hidden="true">
            ?
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function EditorialChecklist({
  items,
  conclusion,
}: {
  items: readonly string[];
  conclusion: string;
}) {
  return (
    <div className={styles.problemCopy}>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span className={styles.checkMarker} aria-hidden="true">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className={styles.problemConclusion}>{conclusion}</p>
    </div>
  );
}

export function DecisionTimeline({
  steps,
}: {
  steps: readonly { title: string; description: string }[];
}) {
  return (
    <ol className={styles.stepList}>
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className={styles.stepMarker} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className={styles.stepContent}>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function GuidancePanel({
  action,
  note,
}: {
  action: ReactNode;
  note: string;
}) {
  return (
    <aside className={styles.guidanceAction}>
      {action}
      <p>{note}</p>
    </aside>
  );
}

export function TrustPrincipleList({
  points,
}: {
  points: readonly { title: string; description: string }[];
}) {
  return (
    <ul className={styles.trustList}>
      {points.map((point, index) => (
        <li key={point.title}>
          <span aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3>{point.title}</h3>
            <p>{point.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
