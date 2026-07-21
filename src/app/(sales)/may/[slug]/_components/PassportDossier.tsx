import type { PublicMachineDetailV1 } from "@/models";
import { formatMachineAvailability, formatPublicDate, formatPublicMachineDisplayName } from "@/lib/presentation";

export function PassportDossier({ machine }: { machine: PublicMachineDetailV1 }) {
  const passport = machine.passport;
  const events = passport.timeline.toSorted((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
  return <section className="detail-section passport-dossier" aria-labelledby="passport-heading"><header className="passport-heading"><div><p className="eyebrow">MBMC Passport</p><h2 id="passport-heading">Hồ sơ máy</h2></div><strong>{passport.code}</strong></header><dl className="passport-summary"><div><dt>Model công khai</dt><dd>{formatPublicMachineDisplayName(machine.summary.displayName)}</dd></div><div><dt>Trạng thái</dt><dd>{formatMachineAvailability(passport.publicStatus)}</dd></div>{passport.firstPublishedAt ? <div><dt>Công khai từ</dt><dd>{formatPublicDate(passport.firstPublishedAt)}</dd></div> : null}{passport.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>{events.length ? <section className="passport-history"><h3>Lịch sử công khai</h3><ol className="passport-timeline">{events.map((event) => <li key={`${event.type}-${event.occurredAt}`}><time dateTime={event.occurredAt}>{formatPublicDate(event.occurredAt)}</time><div><strong>{event.title}</strong></div></li>)}</ol></section> : null}</section>;
}
