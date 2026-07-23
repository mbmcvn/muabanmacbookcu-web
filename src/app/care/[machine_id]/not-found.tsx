import Link from "next/link";
import styles from "./care.module.css";

export default function CareNotFound() {
  return (
    <main className={styles.page}>
      <section className={`${styles.shell} ${styles.card}`}>
        <p className={styles.eyebrow}>MBMC Care</p>
        <h1>Không tìm thấy hồ sơ máy</h1>
        <p>Machine ID này chưa tồn tại hoặc đã được nhập sai.</p>
        <Link className={styles.link} href="/">Về trang chủ MBMC</Link>
      </section>
    </main>
  );
}
