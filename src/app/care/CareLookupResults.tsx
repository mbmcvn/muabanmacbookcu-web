import { CareLookupForm as SharedCareLookupForm } from "@/components/care/CareLookupForm";
import Image from "next/image";
import type { CareMachinePresentation } from "@/data/care/care-machine-presentation.server";
import Link from "next/link";
import type { CareLookupResult, CareLookupWarranty } from "@/data/care/public-inspection.server";
import { PageState } from "@/components/ui/PageState";
import styles from "./lookup.module.css";

type PublicReport = CareLookupResult["inspection_reports"][number];

export function CareLookupForm({ lookup }: { lookup: string }) {
  return <SharedCareLookupForm lookup={lookup} maxLength={40} autoCapitalize="characters" />;
}

function CareWarranty({ warranty }: { warranty?: CareLookupWarranty | null }) {
  const status = warranty?.status;
  const expiresAt = warranty?.expiresAt;
  return (
    <section className={styles.warranty} aria-label="Bảo hành của máy">
      {status ? (
        <p className={styles.warrantyStatus} data-warranty-status={status}>
          <span className={styles.warrantyDot} aria-hidden="true" />
          {status === "active" ? "Còn bảo hành" : "Hết bảo hành"}
        </p>
      ) : <p className={styles.warrantyAbsent}>Thông tin bảo hành chưa được công bố.</p>}
      {warranty && (
        <dl className={styles.warrantyDetails}>
          <div><dt>Hạn bảo hành</dt><dd>{expiresAt ? (
            <time dateTime={expiresAt}>{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(expiresAt))}</time>
          ) : "Chưa có thông tin"}</dd></div>
          <div><dt>Thời gian bảo hành</dt><dd>{warranty.durationLabel ?? "Chưa có thông tin"}</dd></div>
        </dl>
      )}
    </section>
  );
}

export function CareLookupSummary({ result, machine = null }: { result: CareLookupResult; machine?: CareMachinePresentation | null }) {
  const name = result.inspection_reports[0]?.display_name;
  return (
    <section className={styles.summary} aria-labelledby="care-summary-title">
      <div className={styles.summaryHeading}>
        <div>
          <p className={styles.eyebrow}>Hồ sơ công khai</p>
          <h2 id="care-summary-title">{result.machine_id ? "Hồ sơ máy MBMC" : name || "Hồ sơ máy MBMC"}</h2>
        </div>
        <p className={styles.reportCount}>{result.inspection_reports.length} kết quả kiểm định</p>
      </div>
      <div className={result.machine_id ? styles.machineBody : undefined}>
        {result.machine_id && <div className={styles.machinePhoto}>
          {machine?.image ? <Image src={machine.image.url} alt={machine.image.alt} fill sizes="(max-width: 640px) calc(100vw - 4rem), 350px" style={{ objectFit: "contain" }} /> : <p className={styles.photoPlaceholder}>Chưa có ảnh công khai</p>}
        </div>}
        <div className={styles.machineMetadata}>
      <dl className={styles.identity}>
        {result.machine_id && machine?.displayName && <div><dt>Model</dt><dd>{machine.displayName}</dd></div>}
        <div><dt>Serial</dt><dd>Serial đã được ẩn</dd></div>
        {result.machine_id && <div><dt>MBMC Machine ID</dt><dd className={styles.machineId}>{result.machine_id}</dd></div>}
      </dl>
      {result.machine_id && <CareWarranty warranty={result.warranty} />}
      {result.machine_id && result.machine_path ? (
        <Link className={styles.passportLink} href={result.machine_path}>
          Xem Care của máy <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <div className={styles.identityNote}>
          <p>Chưa có MBMC Machine ID</p>
          <p>Chiếc máy này chưa được gắn MBMC Machine ID trong hệ thống. Vẫn hiển thị các báo cáo kiểm tra công khai theo Serial.</p>
        </div>
      )}
        </div>
      </div>
    </section>
  );
}

function CareReportRow({ report }: { report: PublicReport }) {
  const timestamp = new Date(report.accepted_at).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh",
  });
  return (
    <li>
      <Link className={styles.reportRow} href={report.report_path} rel="nofollow">
        <div className={styles.reportIdentity}>
          <h3>{report.inspector_display_name}</h3>
          <p>{report.publication_type === "verified_inspection" ? "Kiểm định xác minh" : "Kiểm định được ủy quyền"} · {report.display_name}</p>
          <p className={styles.reportId}>{report.report_id}</p>
        </div>
        <div className={styles.reportTime}>
          <span>Tiếp nhận · GMT+7</span>
          <time dateTime={report.accepted_at}>{timestamp}</time>
        </div>
        <span className={styles.arrow}>Xem báo cáo</span>
      </Link>
    </li>
  );
}

export function CareReportList({ reports }: { reports: PublicReport[] }) {
  return (
    <section className={styles.reports} aria-labelledby="care-reports-title">
      <header className={styles.listHeading}>
        <div>
          <h2 id="care-reports-title">Kết quả kiểm định</h2>
          <p>Báo cáo từ kiểm định viên hoặc đối tác đã xác minh.</p>
        </div>
        <span className={styles.listCount}>{reports.length} báo cáo</span>
      </header>
      {reports.length ? (
        <ul className={styles.reportList}>
          {reports.map(report => <CareReportRow key={report.report_id} report={report} />)}
        </ul>
      ) : (
        <PageState className={styles.empty} role="status" description="Chưa có kết quả kiểm định từ đối tác/kiểm định viên." />
      )}
    </section>
  );
}
