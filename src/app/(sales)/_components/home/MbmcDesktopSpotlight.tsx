import Image from "next/image";
import Link from "next/link";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { MBMC_DESKTOP_DOWNLOAD_URL } from "@/config/public-destinations";
import styles from "./Home.module.css";

const accessCode = "mbmc.vn";

const features = [
  {
    icon: "device",
    title: "Kiểm tra phần cứng",
    description:
      "Màn hình, bàn phím, trackpad, loa, mic, camera, Bluetooth và cổng kết nối.",
  },
  {
    icon: "document",
    title: "Thông tin máy",
    description: "Model, pin, SSD và các thông tin nhận dạng thiết bị.",
  },
  {
    icon: "shield",
    title: "Báo cáo kiểm định",
    description: "Hoàn thành bài kiểm tra và nhận báo cáo có thể tra cứu lại.",
  },
] as const;

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8m-3 3 2 2m-5 1 2 2" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10h.01" />
    </svg>
  );
}

function FeatureIcon({ icon }: { icon: (typeof features)[number]["icon"] }) {
  if (icon === "device") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="11" rx="1.5" />
        <path d="M2.5 19h19M9 16v3m6-3v3" />
      </svg>
    );
  }

  if (icon === "document") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h4M10 12h5m-5 4h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 19 6v5c0 4.4-2.8 8.4-7 10-4.2-1.6-7-5.6-7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function MbmcDesktopSpotlight() {
  return (
    <section
      className={styles.desktopSpotlight}
      aria-labelledby="desktop-spotlight-title"
    >
      <div className={`container ${styles.desktopSpotlightInner}`}>
        <div className={styles.desktopSpotlightCopy}>
          <p className={styles.eyebrow}>MBMC Desktop</p>
          <h2 id="desktop-spotlight-title">Tải MBMC Desktop</h2>
          <p className={styles.desktopSpotlightLead}>
            Công cụ kiểm tra MacBook cũ trực tiếp trên máy.
          </p>
          <p className={styles.desktopSpotlightDescription}>
            Kiểm tra phần cứng, đọc thông tin máy và tạo báo cáo kiểm định rõ
            ràng.
          </p>
          <div className={styles.actions}>
            <a
              className={styles.primaryAction}
              href={MBMC_DESKTOP_DOWNLOAD_URL}
              download
            >
              <DownloadIcon />
              Tải MBMC Desktop
            </a>
            <Link
              className={styles.secondaryAction}
              href="/phan-mem/mac-checker"
            >
              Xem Mac Checker
            </Link>
          </div>
          <ul className={styles.desktopSpotlightMetadata} aria-label="Yêu cầu">
            <li>Public Beta</li>
            <li>macOS 13+</li>
            <li>Apple Silicon + Intel</li>
          </ul>
        </div>

        <div
          className={styles.desktopSpotlightVisual}
          aria-label="MBMC Desktop"
        >
          <Image
            className={styles.desktopProductImage}
            src="/images/mbmc-desktop-asset/1.png"
            alt="Ứng dụng MBMC Desktop trên MacBook"
            width={1448}
            height={1086}
            sizes="(max-width: 55.99rem) 100vw, 56vw"
          />
          <Image
            className={styles.desktopProductIcon}
            src="/images/mbmc-desktop-asset/2.png"
            alt="MBMC Desktop"
            width={1286}
            height={1223}
            sizes="(max-width: 30rem) 24vw, 9rem"
          />
          <Image
            className={`${styles.desktopAnnotation} ${styles.desktopAnnotationOne}`}
            src="/images/mbmc-desktop-asset/3.png"
            alt=""
            width={1536}
            height={1024}
            aria-hidden="true"
          />
          <Image
            className={`${styles.desktopAnnotation} ${styles.desktopAnnotationTwo}`}
            src="/images/mbmc-desktop-asset/4.png"
            alt=""
            width={1536}
            height={1024}
            aria-hidden="true"
          />
        </div>

        <div className={styles.desktopAccessCode}>
          <span className={styles.desktopAccessCodeIcon}>
            <KeyIcon />
          </span>
          <div>
            <p>
              Mã dùng phần mềm là: <strong>{accessCode}</strong>
            </p>
            <span>Nhập mã trong ứng dụng để bắt đầu sử dụng.</span>
          </div>
        </div>

        <ol className={styles.desktopFeatureStrip}>
          {features.map((feature, index) => (
            <li key={feature.title}>
              <div className={styles.desktopFeatureHeading}>
                <span className={styles.desktopFeatureIcon}>
                  <FeatureIcon icon={feature.icon} />
                </span>
                <span className={styles.desktopFeatureNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </li>
          ))}
        </ol>

        <div className={styles.desktopBetaNote}>
          <p>
            <InfoIcon />
            <span>MBMC Desktop hiện đang ở giai đoạn Public Beta.</span>
          </p>
          <ContactActionLink
            className={styles.desktopSupportLink}
            label="Liên hệ MBMC"
          />
        </div>
      </div>
    </section>
  );
}
