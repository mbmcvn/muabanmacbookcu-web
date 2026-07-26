import Link from "next/link";
import styles from "./care.module.css";
export function CareActions({ machineCode }: { machineCode: string }) {
  const code = encodeURIComponent(machineCode);
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Bạn muốn làm gì?</p>
      <h2>Care và hỗ trợ là hai lựa chọn độc lập</h2>
      <div className={styles.actionGrid}>
        <Link className={styles.link} href={`/care/${code}`}>
          Mở hồ sơ Care
        </Link>
        <Link
          className={`${styles.link} ${styles.supportLink}`}
          href={`/care/${code}/support`}
        >
          Báo vấn đề với máy
        </Link>
      </div>
    </section>
  );
}
