import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { MBMC_DESKTOP_DOWNLOAD_URL } from "@/config/public-destinations";
import styles from "./software.module.css";

export const metadata: Metadata = {
  title: "MBMC Desktop | Phần mềm kiểm tra MacBook",
  description:
    "Tải MBMC Desktop và khám phá các module hỗ trợ kiểm tra, bảo trì và sử dụng MacBook.",
  alternates: { canonical: "/phan-mem" },
};

const downloadFilename = "MBMC-Desktop-V1.0-Beta-Universal.zip";

const modules = [
  {
    icon: "checker",
    title: "Mac Checker",
    description:
      "Kiểm tra phần cứng, pin, trackpad, loa, mic, camera, Bluetooth và các kết nối.",
  },
  {
    icon: "software",
    title: "Kho phần mềm",
    description:
      "Tổng hợp các phần mềm hữu ích dành cho người dùng Mac.",
  },
  {
    icon: "care",
    title: "MBMC Care",
    description:
      "Công cụ hỗ trợ kiểm tra, bảo trì và theo dõi tình trạng máy.",
  },
  {
    icon: "modules",
    title: "Các module khác",
    description:
      "Nhiều tiện ích nhỏ phục vụ công việc và trải nghiệm sử dụng Mac tốt hơn.",
  },
] as const;

const coreCapabilities = [
  {
    icon: "checker",
    title: "Kiểm tra phần cứng",
    description:
      "Màn hình, bàn phím, trackpad, loa, mic, camera, Bluetooth và cổng kết nối.",
  },
  {
    icon: "software",
    title: "Thông tin máy",
    description: "Model, pin, SSD và thông tin nhận dạng thiết bị.",
  },
  {
    icon: "care",
    title: "Báo cáo kiểm định",
    description:
      "Hoàn thành bài kiểm tra và nhận báo cáo có thể tra cứu lại.",
  },
] as const;

const usageSteps = [
  "Tải ứng dụng",
  "Giải nén",
  "Mở MBMC Desktop",
  "Nhập mã hiển thị",
  "Bắt đầu kiểm tra máy",
] as const;

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" />
    </svg>
  );
}

function ModuleIcon({ icon }: { icon: (typeof modules)[number]["icon"] }) {
  if (icon === "checker") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="12" rx="2" />
        <path d="m8 11 2.2 2.2L16 8.5M8 21h8m-4-4v4" />
      </svg>
    );
  }

  if (icon === "software") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </svg>
    );
  }

  if (icon === "care") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s-7-4.4-7-10.4A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 7 4.6C19 16.6 12 21 12 21Z" />
        <path d="M8.5 12h2l1-2.2 1.8 4.3 1-2.1h1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M17 14v6m-3-3h6" />
    </svg>
  );
}

export default function SoftwareHubPage() {
  return (
    <article className={`container ${styles.page} ${styles.hubPage}`}>
      <nav className={styles.breadcrumbs} aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span>Phần mềm</span>
      </nav>

      <header className={`${styles.hero} ${styles.hubHero}`}>
        <p className={styles.eyebrow}>Công cụ từ MBMC</p>
        <h1>Phần mềm MBMC</h1>
        <p className={styles.heroLead}>
          Một ứng dụng trung tâm cho các công cụ kiểm tra, bảo trì và sử dụng
          MacBook do MBMC phát triển từ nhu cầu thực tế.
        </p>
      </header>

      <section
        className={styles.desktopProduct}
        aria-labelledby="mbmc-desktop-title"
      >
        <div className={styles.desktopProductCopy}>
          <span className={styles.releaseBadge}>Public Beta</span>
          <p className={styles.productEyebrow}>Ứng dụng chính của MBMC</p>
          <h2 id="mbmc-desktop-title">MBMC Desktop</h2>
          <p className={styles.desktopProductLead}>
            Công cụ kiểm tra MacBook cũ trực tiếp trên máy.
          </p>
          <p className={styles.desktopProductDescription}>
            Kiểm tra phần cứng, đọc thông tin máy và sử dụng các module dành
            riêng cho người dùng Mac trong một ứng dụng thống nhất.
          </p>
          <ul className={styles.desktopMetadata} aria-label="Yêu cầu hệ thống">
            <li>macOS 13 trở lên</li>
            <li>Universal: Apple Silicon + Intel</li>
            <li>Version 1.0 Beta</li>
          </ul>
          <div className={styles.desktopActions}>
            <a
              className={styles.downloadAction}
              href={MBMC_DESKTOP_DOWNLOAD_URL}
              download
            >
              <DownloadIcon />
              <span>
                <strong>Tải MBMC Desktop</strong>
                <small>{downloadFilename}</small>
              </span>
            </a>
          </div>
        </div>

        <div className={styles.desktopProductVisual} aria-label="MBMC Desktop">
          <Image
            className={styles.productLaptop}
            src="/images/mbmc-desktop-asset/1.png"
            alt="Ứng dụng MBMC Desktop trên MacBook"
            width={1448}
            height={1086}
            priority
            sizes="(max-width: 55rem) 100vw, 52vw"
          />
          <Image
            className={styles.productAppIcon}
            src="/images/mbmc-desktop-asset/2.png"
            alt="MBMC Desktop"
            width={1286}
            height={1223}
          />
          <Image
            className={`${styles.productAnnotation} ${styles.productAnnotationTop}`}
            src="/images/mbmc-desktop-asset/3.png"
            alt=""
            width={1536}
            height={1024}
            aria-hidden="true"
          />
          <Image
            className={`${styles.productAnnotation} ${styles.productAnnotationSide}`}
            src="/images/mbmc-desktop-asset/4.png"
            alt=""
            width={1536}
            height={1024}
            aria-hidden="true"
          />
        </div>
      </section>

      <div className={styles.hubAccessCode}>
        <span aria-hidden="true">⌘</span>
        <p>
          Mã dùng phần mềm là: <strong>mbmc.vn</strong>
        </p>
        <small>Nhập mã trong ứng dụng để bắt đầu sử dụng.</small>
      </div>

      <section
        className={styles.coreSection}
        aria-labelledby="core-capabilities-title"
      >
        <div className={styles.compactSectionHeading}>
          <h2 id="core-capabilities-title">
            Kiểm tra rõ ràng, lưu kết quả để tra cứu
          </h2>
          <p>
            MBMC Desktop đưa quy trình Mac Checker lên chính chiếc Mac đang
            được kiểm tra.
          </p>
        </div>
        <ul className={styles.coreCapabilities}>
          {coreCapabilities.map((capability, index) => (
            <li key={capability.title}>
              <span className={styles.moduleIcon}>
                <ModuleIcon icon={capability.icon} />
              </span>
              <div>
                <span className={styles.capabilityNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.usageSection} aria-labelledby="usage-title">
        <div className={styles.compactSectionHeading}>
          <h2 id="usage-title">Cách bắt đầu</h2>
          <p>
            Một bản Universal duy nhất cho máy Mac dùng Apple Silicon và Intel.
          </p>
        </div>
        <ol className={styles.hubUsageSteps}>
          {usageSteps.map((step) => (
            <li key={step}>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.moduleSection} aria-labelledby="modules-title">
        <div className={styles.moduleHeading}>
          <p className={styles.eyebrow}>Bên trong MBMC Desktop</p>
          <h2 id="modules-title">Các module và tiện ích</h2>
        </div>
        <ul className={styles.moduleStrip}>
          {modules.map((module) => (
            <li key={module.title}>
              <span className={styles.moduleIcon}>
                <ModuleIcon icon={module.icon} />
              </span>
              <div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside
        className={styles.architectureNote}
        aria-label="Kiến trúc sản phẩm"
      >
        <strong>MBMC Desktop là ứng dụng chính của MBMC.</strong>
        <span>
          Trong đó, Mac Checker là một module quan trọng, không phải là phần
          mềm riêng biệt.
        </span>
      </aside>

      <section className={styles.hubBetaPanel} aria-labelledby="beta-title">
        <div>
          <p className={styles.eyebrow}>Trạng thái phát hành</p>
          <h2 id="beta-title">
            MBMC Desktop hiện đang ở giai đoạn Public Beta.
          </h2>
          <p>
            Nếu cần hỗ trợ trong quá trình cài đặt hoặc kiểm tra máy, hãy liên
            hệ MBMC qua kênh hỗ trợ hiện có.
          </p>
        </div>
        <ContactActionLink
          className={styles.learnMoreAction}
          label="Liên hệ MBMC"
        />
      </section>
    </article>
  );
}
