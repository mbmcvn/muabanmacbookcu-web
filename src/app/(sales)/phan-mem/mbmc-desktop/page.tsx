import type { Metadata } from "next";
import Link from "next/link";
import styles from "../software.module.css";

export const metadata: Metadata = {
  title: "MBMC Desktop | Ứng dụng macOS của MBMC",
  description:
    "MBMC Desktop là ứng dụng macOS kết nối chiếc Mac với các công cụ trong hệ sinh thái MBMC.",
  alternates: { canonical: "/phan-mem/mbmc-desktop" },
};

const modules = [
  [
    "Mac Checker / Device Check",
    "Trải nghiệm kiểm tra máy theo quy trình và lưu lại kết quả.",
    "Đang phát triển",
  ],
  [
    "MBMC Care",
    "Kết nối với các dịch vụ chăm sóc dành cho máy trong hệ sinh thái MBMC.",
    "Đang phát triển",
  ],
  [
    "Kho phần mềm",
    "Một khu vực dành cho các phần mềm hữu ích với người dùng Mac.",
    "Đang lên kế hoạch",
  ],
  [
    "Các module MBMC",
    "Nơi các công cụ mới của MBMC có thể được bổ sung trong tương lai.",
    "Đang lên kế hoạch",
  ],
] as const;

export default function MbmcDesktopPage() {
  return (
    <article className={`container ${styles.page}`}>
      <nav className={styles.breadcrumbs} aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href="/phan-mem">Phần mềm</Link>
        <span aria-hidden="true">/</span>
        <span>MBMC Desktop</span>
      </nav>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Ứng dụng đồng hành trên macOS</p>
        <h1>MBMC Desktop</h1>
        <p>Một nơi để kết nối chiếc Mac của bạn với các công cụ của MBMC.</p>
      </header>
      <div className={styles.sections}>
        <section
          className={styles.section}
          aria-labelledby="desktop-about-title"
        >
          <div className={styles.sectionHeader}>
            <h2 id="desktop-about-title">Rộng hơn một công cụ kiểm tra</h2>
            <p>
              Mac Checker là một trải nghiệm quan trọng trong ứng dụng. MBMC
              Desktop được định hướng là ứng dụng đồng hành rộng hơn, kết nối
              chiếc Mac với nhiều công cụ và dịch vụ của MBMC.
            </p>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="modules-title">
          <div className={styles.sectionHeader}>
            <h2 id="modules-title">Các khu vực sản phẩm</h2>
            <p>
              Các module dưới đây đang được phát triển hoặc lên kế hoạch. MBMC
              chưa công bố bản tải xuống rộng rãi.
            </p>
          </div>
          <div className={styles.detailGrid}>
            {modules.map(([title, copy, status]) => (
              <div className={styles.detailCard} key={title}>
                <div className={styles.cardHeading}>
                  <h3>{title}</h3>
                  <span className={styles.status}>{status}</span>
                </div>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <section
          className={styles.section}
          aria-labelledby="desktop-status-title"
        >
          <div className={styles.cta}>
            <div>
              <h2 id="desktop-status-title">MBMC Desktop đang phát triển</h2>
              <p>
                Trong lúc chờ ứng dụng hoàn thiện, bạn có thể tìm hiểu quy trình
                kiểm tra MacBook.
              </p>
            </div>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/phan-mem/mac-checker">
                Tìm hiểu Mac Checker
              </Link>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
