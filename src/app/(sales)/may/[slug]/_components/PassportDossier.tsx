import type { PublicMachineDetailV1 } from "@/models";
import { formatMachineAvailability, formatPublicDate, formatPublicMachineDisplayName } from "@/lib/presentation";
import { MachineDetailIcon } from "./MachineDetailIcon";

export function PassportDossier({ machine }: { machine: PublicMachineDetailV1 }) {
  const passport = machine.passport;
  return <section className="detail-section passport-dossier" aria-labelledby="passport-heading"><header className="passport-heading"><div><p className="eyebrow">MBMC Passport</p><h2 id="passport-heading">Hồ sơ nhận diện công khai</h2><p>Đây là bản ghi nhận diện hiện có của chiếc máy, không phải lịch sử đầy đủ.</p></div></header><dl className="passport-summary"><div><MachineDetailIcon name="passport" className="passport-fact__icon" /><div><dt>Mã máy</dt><dd>{passport.code}</dd></div></div><div><MachineDetailIcon name="model" className="passport-fact__icon" /><div><dt>Model công khai</dt><dd>{formatPublicMachineDisplayName(machine.summary.displayName)}</dd></div></div><div><MachineDetailIcon name="status" className="passport-fact__icon" /><div><dt>Trạng thái</dt><dd>{formatMachineAvailability(passport.publicStatus, machine.summary.reservationKind)}</dd></div></div>{passport.firstPublishedAt ? <div><MachineDetailIcon name="published" className="passport-fact__icon" /><div><dt>Công khai từ</dt><dd>{formatPublicDate(passport.firstPublishedAt)}</dd></div></div> : null}</dl></section>;
}
