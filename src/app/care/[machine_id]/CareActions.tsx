import Link from "next/link";
import styles from "./care.module.css";

export function CareActions({
  machineCode,
  unlocked = false,
  model,
}: {
  machineCode: string;
  unlocked?: boolean;
  model?: string | null;
}) {
  const code = encodeURIComponent(machineCode);
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>
        {unlocked ? "Cần MBMC hỗ trợ?" : "Bạn muốn làm gì?"}
      </p>
      <h2>
        {unlocked
          ? "Bạn cần làm gì với máy này?"
          : "Care và hỗ trợ là hai lựa chọn độc lập"}
      </h2>
      {unlocked && (
        <p className={styles.actionHelper}>
          Chọn đúng nhu cầu để MBMC hỗ trợ nhanh hơn.
        </p>
      )}
      <div className={styles.actionGrid}>
        {!unlocked && (
          <Link className={styles.link} href={`/care/${code}`}>
            Mở hồ sơ Care
          </Link>
        )}
        {unlocked ? (
          <>
            <Link
              className={`${styles.actionCard} ${styles.primaryAction}`}
              href={`/care/${code}/support`}
            >
              <span className={styles.actionIcon} aria-hidden="true">
                ⚒
              </span>
              <span>
                <strong>Máy tôi có vấn đề</strong>
                <small>Kiểm tra, sửa chữa, bảo hành</small>
              </span>
            </Link>
            <Link
              className={`${styles.actionCard} ${styles.secondaryAction}`}
              href={`/care/${code}/resale`}
              aria-label={`Bán lại hoặc lên đời ${model ?? machineCode}`}
            >
              <span className={styles.actionIcon} aria-hidden="true">
                ⇄
              </span>
              <span>
                <strong>Bán lại / lên đời</strong>
                <small>Định giá, thu cũ đổi mới</small>
              </span>
            </Link>
          </>
        ) : (
          <Link
            className={`${styles.link} ${styles.supportLink}`}
            href={`/care/${code}/support`}
          >
            Báo vấn đề với máy
          </Link>
        )}
      </div>
    </section>
  );
}
