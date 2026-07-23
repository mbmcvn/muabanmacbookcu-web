import type { PublicMachineDetailV1 } from "@/models";
import {
  formatMachineAvailability,
  formatPublicMachineDisplayName,
} from "@/lib/presentation";
import { buildPublicLimitations } from "./decision-dossier-presentation";

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
        <p className="eyebrow">Phạm vi hồ sơ hiện tại</p>
        <h2 id="verified-information-heading">
          Đã xác minh trong hồ sơ công khai
        </h2>
        <p>
          Những thông tin dưới đây xác định đúng bản ghi công khai của chiếc
          máy này, không phải kết luận kiểm định toàn diện.
        </p>
      </header>
      <dl className="detail-facts">
        <div><dt>Mã máy</dt><dd>{summary.code}</dd></div>
        <div><dt>Model công khai</dt><dd>{formatPublicMachineDisplayName(summary.displayName)}</dd></div>
        <div><dt>Trạng thái công khai</dt><dd>{formatMachineAvailability(summary.availability)}</dd></div>
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
    <section
      className="detail-section public-information-status"
      aria-labelledby="information-limitations-heading"
    >
      <header>
        <p className="eyebrow">Giới hạn của hồ sơ công khai</p>
        <h2 id="information-limitations-heading">Chưa đủ thông tin</h2>
      </header>
      <ul>{limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
    </section>
  );
}
