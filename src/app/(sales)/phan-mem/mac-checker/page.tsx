import type { Metadata } from "next";
import Link from "next/link";
import { publicDeviceCheckUrl } from "@/config/public-destinations";
import styles from "../software.module.css";

export const metadata: Metadata = {
  title: "Mac Checker | Kiểm tra và tra cứu lịch sử MacBook",
  description:
    "Tìm hiểu quy trình kiểm tra MacBook, báo cáo theo thời điểm và lịch sử tra cứu bằng serial của Mac Checker.",
  alternates: { canonical: "/phan-mem/mac-checker" },
};

const checks = [
  ["Kết nối", "Wi-Fi, mạng và Bluetooth."],
  ["Thiết bị & cấu hình", "Thông tin thiết bị, cấu hình, pin và SSD."],
  ["Hiển thị & nhập liệu", "Màn hình, bàn phím và trackpad theo từng bước."],
  ["Âm thanh & hình ảnh", "Loa, microphone và camera."],
  ["Cổng kết nối", "Hướng dẫn kiểm tra các cổng có trên máy."],
  [
    "Kiểm tra vật lý",
    "Được ghi nhận khi thực hiện bởi người kiểm định có thẩm quyền.",
  ],
] as const;

export default function MacCheckerPage() {
  const serialLookupUrl = publicDeviceCheckUrl();

  return (
    <article className={`container ${styles.page}`}>
      <nav className={styles.breadcrumbs} aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href="/phan-mem">Phần mềm</Link>
        <span aria-hidden="true">/</span>
        <span>Mac Checker</span>
      </nav>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Kiểm tra &amp; lịch sử máy</p>
        <h1>Mac Checker</h1>
        <p>
          Kiểm tra một chiếc MacBook. Lưu lại tình trạng của nó. Tra cứu lại
          bằng serial.
        </p>
      </header>
      <div className={styles.sections}>
        <section className={styles.section} aria-labelledby="process-title">
          <div className={styles.sectionHeader}>
            <h2 id="process-title">Một quy trình kiểm tra thống nhất</h2>
            <p>
              Mac Checker hướng dẫn từng bước để việc kiểm tra nhất quán và dễ
              đối chiếu. Phần mềm hỗ trợ quy trình; không khẳng định có thể tự
              động phát hiện mọi lỗi phần cứng.
            </p>
          </div>
          <div className={styles.detailGrid}>
            {checks.map(([title, copy]) => (
              <div className={styles.detailCard} key={title}>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="history-title">
          <div className={styles.sectionHeader}>
            <h2 id="history-title">Kết quả không biến mất sau khi kiểm tra</h2>
            <p>
              Một lượt kiểm tra được chấp nhận sẽ trở thành báo cáo — ảnh chụp
              tình trạng chiếc máy tại thời điểm đó. Theo thời gian, một máy có
              thể tích lũy nhiều báo cáo để hình thành lịch sử kiểm định.
            </p>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="serial-title">
          <div className={styles.cta}>
            <div>
              <h2 id="serial-title">Tra cứu theo serial</h2>
              <p>
                Xem các báo cáo công khai đã được ghi nhận cho chiếc MacBook.
              </p>
            </div>
            <div className={styles.actions}>
              <a className={styles.primary} href={serialLookupUrl}>
                Tra cứu MacBook bằng serial
              </a>
            </div>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="audience-title">
          <div className={styles.sectionHeader}>
            <h2 id="audience-title">Ai có thể sử dụng</h2>
          </div>
          <div className={styles.audiences}>
            <div className={styles.audience}>Người mua MacBook cũ</div>
            <div className={styles.audience}>Người đang sở hữu Mac</div>
            <div className={styles.audience}>
              Thợ, cửa hàng và người kiểm định
            </div>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="trust-title">
          <div className={styles.sectionHeader}>
            <h2 id="trust-title">Mức độ tin cậy của lượt kiểm tra</h2>
            <p>
              Báo cáo cho biết lượt kiểm tra được thực hiện theo hình thức nào
              để người xem hiểu đúng bối cảnh.
            </p>
          </div>
          <ul className={styles.trustList}>
            <li>
              <strong>Tự kiểm tra</strong>
              <span>Người dùng tự thực hiện theo hướng dẫn.</span>
            </li>
            <li>
              <strong>Kiểm định xác minh</strong>
              <span>
                Được thực hiện bởi người kiểm định đã được MBMC xác minh.
              </span>
            </li>
            <li>
              <strong>Kiểm định được ủy quyền</strong>
              <span>Được thực hiện trong phạm vi ủy quyền đã xác định.</span>
            </li>
          </ul>
        </section>
        <section className={styles.section} aria-labelledby="next-title">
          <div className={styles.cta}>
            <div>
              <h2 id="next-title">Bắt đầu từ chiếc máy của bạn</h2>
              <p>Tra lịch sử hiện có hoặc tìm hiểu ứng dụng macOS của MBMC.</p>
            </div>
            <div className={styles.actions}>
              <a className={styles.primary} href={serialLookupUrl}>
                Tra serial / Kiểm tra máy
              </a>
              <Link className={styles.secondary} href="/phan-mem">
                Tìm hiểu MBMC Desktop
              </Link>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
