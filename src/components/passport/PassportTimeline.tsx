import type { PassportTimelineEvent } from "@/models";
import { formatPublicDate } from "@/lib/presentation";

export function PassportTimeline({ events }: { events: PassportTimelineEvent[] }) {
  if (events.length === 0) return null;
  return <section><h3>Dòng thời gian công khai</h3><ol>{events.map((event) => <li key={`${event.date}-${event.title}`}><time dateTime={event.date}>{formatPublicDate(event.date)}</time> — {event.title}{event.description ? `: ${event.description}` : ""}</li>)}</ol></section>;
}
