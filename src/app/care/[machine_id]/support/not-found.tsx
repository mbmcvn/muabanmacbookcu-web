import Link from "next/link";
import styles from "./support.module.css";
export default function SupportNotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>MBMC Care</p>
        <h1>Không tìm thấy máy này</h1>
        <p>Kiểm tra lại mã máy hoặc liên hệ MBMC nếu bạn cần trợ giúp.</p>
        <Link className={styles.secondary} href="/">
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
