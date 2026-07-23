import type { PublicMachineDetailV1 } from "@/models";
import { formatMachineAvailability, formatPublicDate, formatPublicMachineDisplayName } from "@/lib/presentation";

export function PassportDossier({ machine }: { machine: PublicMachineDetailV1 }) {
  const passport = machine.passport;
  return <section className="detail-section passport-dossier" aria-labelledby="passport-heading"><header className="passport-heading"><div><p className="eyebrow">MBMC Passport</p><h2 id="passport-heading">Hồ sơ nhận diện công khai</h2><p>Đây là bản ghi nhận diện hiện có của chiếc máy, không phải lịch sử đầy đủ.</p></div><strong>{passport.code}</strong></header><dl className="passport-summary"><div><dt>Model công khai</dt><dd>{formatPublicMachineDisplayName(machine.summary.displayName)}</dd></div><div><dt>Trạng thái</dt><dd>{formatMachineAvailability(passport.publicStatus)}</dd></div>{passport.firstPublishedAt ? <div><dt>Công khai từ</dt><dd>{formatPublicDate(passport.firstPublishedAt)}</dd></div> : null}</dl></section>;
}
