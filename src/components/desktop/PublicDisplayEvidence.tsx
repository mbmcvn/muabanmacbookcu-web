import type { PublicDisplayEvidenceV1 } from "@/lib/care-report/desktop-public-report";
import styles from "./PublicDisplayEvidence.module.css";

const colorLabels = {
  white: "Trắng",
  black: "Đen",
  red: "Đỏ",
  green: "Xanh lá",
  blue: "Xanh dương",
} as const;

export default function PublicDisplayEvidence({
  evidence,
}: {
  evidence?: PublicDisplayEvidenceV1;
}) {
  if (!evidence) return null;

  // The backend supplies normalized public evidence. Only the schematic's
  // presentation uses a fallback ratio; evidence and QA outcomes stay unchanged.
  const ratio = evidence.displayAspectRatio ?? 16 / 10;
  return (
    <section className={styles.evidence} aria-label="Khu vực màn hình được đánh dấu">
      <p className="font-semibold">Khu vực đã được đánh dấu trong bài kiểm tra</p>
      {evidence.displayAspectRatio === null && (
        <p className="mt-1 text-sm text-slate-500">
          Tỷ lệ minh họa 16:10; báo cáo không cung cấp tỷ lệ màn hình.
        </p>
      )}
      <p className="mt-1 text-sm text-slate-500">Sơ đồ vị trí trên màn hình, không phải ảnh chụp.</p>
      {evidence.regions.map((region, index) => (
        <figure className={styles.figure} key={region.regionId}>
          <div
            role="img"
            aria-label={`Khu vực ${index + 1}, nền ${colorLabels[region.testColor]}`}
            className={styles.screen}
            style={{ aspectRatio: ratio, backgroundColor: region.testColor }}
          >
            <span
              aria-hidden="true"
              className={styles.region}
              style={{
                left: `${region.x * 100}%`,
                top: `${region.y * 100}%`,
                width: `${region.width * 100}%`,
                height: `${region.height * 100}%`,
              }}
            >
              <span className={styles.number}>{index + 1}</span>
            </span>
          </div>
          <figcaption className="mt-2 text-sm text-slate-500">
            Khu vực {index + 1} · Nền kiểm tra: {colorLabels[region.testColor]}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
