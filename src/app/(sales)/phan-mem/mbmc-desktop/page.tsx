import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { MBMC_DESKTOP_DOWNLOAD_URL } from "@/config/public-destinations";
import styles from "../software.module.css";

export const metadata: Metadata = {
  title: "MBMC Desktop | Tải ứng dụng kiểm tra MacBook",
  description:
    "Tải MBMC Desktop Public Beta cho macOS để kiểm tra phần cứng, xem thông tin máy và tạo báo cáo kiểm định.",
  alternates: { canonical: "/phan-mem/mbmc-desktop" },
};

const productFacts = [
  ["Trạng thái", "Public Beta"],
  ["Hệ điều hành", "macOS 13 trở lên"],
  ["Kiến trúc", "Universal: Apple Silicon + Intel"],
  ["Phiên bản", "1.0 Beta"],
] as const;

const features = [
  [
    "Kiểm tra phần cứng",
    "Màn hình, bàn phím, trackpad, loa, mic, camera, Bluetooth và cổng kết nối.",
  ],
  ["Thông tin máy", "Model, pin, SSD và thông tin nhận dạng thiết bị."],
  [
    "Báo cáo kiểm định",
    "Hoàn thành bài kiểm tra và nhận báo cáo có thể tra cứu lại.",
  ],
] as const;

const usageSteps = [
  "Tải ứng dụng",
  "Giải nén",
  "Mở MBMC Desktop",
  "Nhập mã hiển thị",
  "Bắt đầu kiểm tra máy",
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

      <header className={styles.downloadHero}>
        <div className={styles.downloadHeroCopy}>
          <Image
            className={styles.desktopAppIcon}
            src="/brand/mbmc-desktop-icon.png"
            alt="MBMC Desktop"
            width={1536}
            height={1536}
            priority
          />
          <p className={styles.eyebrow}>Ứng dụng macOS · Public Beta</p>
          <h1>MBMC Desktop</h1>
          <p>Công cụ kiểm tra MacBook cũ trực tiếp trên máy.</p>
          <div className={styles.downloadActions}>
            <a
              className={styles.primary}
              href={MBMC_DESKTOP_DOWNLOAD_URL}
              download
            >
              Tải MBMC Desktop
            </a>
            <Link className={styles.secondary} href="/phan-mem/mac-checker">
              Tìm hiểu Mac Checker
            </Link>
          </div>
          <p className={styles.accessCode}>
            Mã dùng phần mềm là: <strong>mbmc.vn</strong>
          </p>
        </div>

        <dl className={styles.productFacts} aria-label="Thông tin phiên bản">
          {productFacts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className={styles.sections}>
        <section className={styles.section} aria-labelledby="features-title">
          <div className={styles.sectionHeader}>
            <h2 id="features-title">
              Kiểm tra rõ ràng, lưu kết quả để tra cứu
            </h2>
            <p>
              MBMC Desktop đưa quy trình Mac Checker lên chính chiếc Mac đang
              được kiểm tra.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(([title, description], index) => (
              <div className={styles.featureCard} key={title}>
                <span aria-hidden="true">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="usage-title">
          <div className={styles.sectionHeader}>
            <h2 id="usage-title">Cách bắt đầu</h2>
            <p>
              Tải một bản Universal duy nhất cho cả máy Mac dùng Apple Silicon
              và Intel.
            </p>
          </div>
          <ol className={styles.usageSteps}>
            {usageSteps.map((step) => (
              <li key={step}>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className={styles.accessNote}>
            <p>Mã dùng phần mềm là:</p>
            <strong>mbmc.vn</strong>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="beta-title">
          <div className={styles.betaPanel}>
            <div>
              <p className={styles.eyebrow}>Trạng thái phát hành</p>
              <h2 id="beta-title">
                MBMC Desktop hiện đang ở giai đoạn Public Beta.
              </h2>
              <p>
                Nếu cần hỗ trợ trong quá trình cài đặt hoặc kiểm tra máy, hãy
                liên hệ MBMC qua kênh hỗ trợ hiện có.
              </p>
            </div>
            <ContactActionLink
              className={styles.secondary}
              label="Liên hệ MBMC"
            />
          </div>
        </section>
      </div>
    </article>
  );
}
