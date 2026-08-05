import type { PublicMachineDetailV1 } from "@/models";
import {
  formatMachineAvailability,
  formatPublicMachineDisplayName,
} from "@/lib/presentation";
import { buildPublicLimitations } from "./decision-dossier-presentation";
import { MachineDetailIcon } from "./MachineDetailIcon";

export function VerifiedPublicInformation({
  machine,
}: {
  machine: PublicMachineDetailV1;
}) {
  const summary = machine.summary;
  return (
    <section
      className="detail-section public-information-status"
      aria-labelledby="verified-information-heading"
    >
      <header>
        <p className="eyebrow"><span className="verified-information-mark" aria-hidden="true">✓</span> Phạm vi hồ sơ hiện tại</p>
        <h2 id="verified-information-heading">
          Đã xác minh trong hồ sơ công khai
        </h2>
        <p>
          Những thông tin dưới đây xác định đúng bản ghi công khai của chiếc
          máy này, không phải kết luận kiểm định toàn diện.
        </p>
      </header>
      <dl className="detail-facts verified-information-facts">
        <div><dt>Mã máy</dt><dd>{summary.code}</dd></div>
        <div><dt>Model công khai</dt><dd>{formatPublicMachineDisplayName(summary.displayName)}</dd></div>
        <div><dt>Trạng thái công khai</dt><dd>{formatMachineAvailability(summary.availability, summary.reservationKind)}</dd></div>
        <div><dt>Hình ảnh công khai</dt><dd>{summary.imageCount} ảnh trong hồ sơ</dd></div>
      </dl>
    </section>
  );
}

export function PublicInformationLimitations({
  machine,
}: {
  machine: PublicMachineDetailV1;
}) {
  const limitations = buildPublicLimitations(machine);
  if (!limitations.length) return null;
  return (
    <details
      className="public-information-disclosure supporting-information-row"
      id="thong-tin-can-xac-nhan-them"
    >
      <summary className="public-information-disclosure__summary">
        <span className="public-information-disclosure__copy">
          <MachineDetailIcon name="help" className="supporting-information-row__icon" />
          <span className="public-information-disclosure__text"><span className="public-information-disclosure__label">Thông tin cần xác nhận thêm</span>
          <strong className="public-information-disclosure__count">Chưa có {limitations.length} nhóm thông tin xác nhận trong hồ sơ công khai</strong></span>
        </span>
        <span className="public-information-disclosure__icon" aria-hidden="true">
          <span className="public-information-disclosure__icon-closed">+</span>
          <span className="public-information-disclosure__icon-open">−</span>
        </span>
      </summary>
      <div className="public-information-disclosure__content">
        <ul>{limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
      </div>
    </details>
  );
}
