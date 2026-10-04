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
  variant = "detail",
}: {
  evidence?: PublicDisplayEvidenceV1;
  variant?: "compact" | "detail";
}) {
  if (!evidence) return null;

  // The backend supplies normalized public evidence. Only the schematic's
  // presentation uses a fallback ratio; evidence and QA outcomes stay unchanged.
  const ratio = evidence.displayAspectRatio ?? 16 / 10;
  const count = evidence.regions.length;
  return (
    <section
      className={`${styles.evidence} ${variant === "compact" ? styles.compact : ""}`}
      aria-label="Khu vực màn hình được đánh dấu"
      data-display-variant={variant}
    >
      <p className="font-semibold">Khu vực đã được đánh dấu trong bài kiểm tra</p>
      <p className="mt-1 text-sm text-slate-500">{count} khu vực được đánh dấu</p>
      {evidence.displayAspectRatio === null && (
        <p className="mt-1 text-sm text-slate-500">
          Tỷ lệ minh họa 16:10; báo cáo không cung cấp tỷ lệ màn hình.
        </p>
      )}
      <figure className={styles.figure}>
        <div
          role="img"
          aria-label={`Sơ đồ vị trí ${count} khu vực được đánh dấu trên màn hình`}
          data-display-schematic="true"
          className={styles.screen}
          style={{ aspectRatio: ratio }}
        >
          {evidence.regions.map((region, index) => (
            <span
              key={region.regionId}
              aria-hidden="true"
              data-display-region={index + 1}
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
          ))}
        </div>
        <figcaption className="mt-2 text-sm text-slate-500">
          Sơ đồ vị trí trên màn hình, không phải ảnh chụp.
        </figcaption>
      </figure>
      <ol className={styles.metadata}>
        {evidence.regions.map((region, index) => (
          <li key={region.regionId}>
            Khu vực {index + 1} · Nền kiểm tra: {colorLabels[region.testColor]}
            <span
              aria-hidden="true"
              className={styles.swatch}
              style={{ backgroundColor: region.testColor }}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}
