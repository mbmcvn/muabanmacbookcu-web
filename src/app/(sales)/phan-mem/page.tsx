import type { Metadata } from "next";
import Link from "next/link";
import { publicDeviceCheckUrl } from "@/config/public-destinations";
import styles from "./software.module.css";

export const metadata: Metadata = {
  title: "Phần mềm MBMC | Công cụ dành cho người dùng Mac",
  description:
    "Các công cụ MBMC phát triển cho việc kiểm tra, tra cứu và sử dụng MacBook.",
  alternates: { canonical: "/phan-mem" },
};

export default function SoftwareHubPage() {
  const serialLookupUrl = publicDeviceCheckUrl();

  return (
    <article className={`container ${styles.page}`}>
      <nav className={styles.breadcrumbs} aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span>Phần mềm</span>
      </nav>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Công cụ từ MBMC</p>
        <h1>Phần mềm MBMC</h1>
        <p>
          Các công cụ được MBMC phát triển từ chính quy trình mua bán, kiểm tra
          và sử dụng MacBook thực tế.
        </p>
      </header>
      <div className={styles.productGrid}>
        <section
          className={styles.productCard}
          aria-labelledby="mac-checker-title"
        >
          <span className={styles.productMark} aria-hidden="true">
            MC
          </span>
          <div className={styles.cardHeading}>
            <h2 id="mac-checker-title">Mac Checker</h2>
            <span className={styles.status}>Có thể sử dụng</span>
          </div>
          <p>
            Kiểm tra MacBook theo một quy trình thống nhất, lưu kết quả và tạo
            lịch sử kiểm định cho từng máy.
          </p>
          <ul className={styles.featureList}>
            <li>Kiểm tra phần cứng theo hướng dẫn</li>
            <li>Pin &amp; SSD</li>
            <li>Kết quả kiểm định công khai</li>
            <li>Tra cứu bằng serial</li>
            <li>Lịch sử kiểm định của máy</li>
          </ul>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/phan-mem/mac-checker">
              Khám phá Mac Checker
            </Link>
            <a className={styles.secondary} href={serialLookupUrl}>
              Tra cứu serial
            </a>
          </div>
        </section>
        <section className={styles.productCard} aria-labelledby="desktop-title">
          <span className={styles.productMark} aria-hidden="true">
            MB
          </span>
          <div className={styles.cardHeading}>
            <h2 id="desktop-title">MBMC Desktop</h2>
            <span className={styles.status}>Public Beta</span>
          </div>
          <p>
            Ứng dụng macOS kết nối chiếc Mac với các công cụ và dịch vụ trong hệ
            sinh thái MBMC.
          </p>
          <ul className={styles.featureList}>
            <li>Mac Checker</li>
            <li>MBMC Care</li>
            <li>Kho phần mềm</li>
            <li>Các module dành cho người dùng Mac</li>
          </ul>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/phan-mem/mbmc-desktop">
              Tìm hiểu MBMC Desktop
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
