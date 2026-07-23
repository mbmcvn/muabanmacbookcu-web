import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCarePassport } from "@/data/care/care-repository.server";
import styles from "./care.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ machine_id: string }>;
  searchParams: Promise<{ activation?: string; support?: string }>;
};

export const metadata: Metadata = {
  title: "Care Passport",
  description: "Hồ sơ định danh và bảo hành điện tử của thiết bị MBMC.",
  robots: { index: false, follow: false },
};

export default async function CarePage({ params, searchParams }: PageProps) {
  const [{ machine_id }, status] = await Promise.all([params, searchParams]);
  const passport = await getPublicCarePassport(machine_id);
  if (!passport) notFound();

  const configuration = [
    passport.configuration.chip,
    passport.configuration.ramGb ? `${passport.configuration.ramGb}GB RAM` : null,
    passport.configuration.ssdGb ? `${passport.configuration.ssdGb}GB SSD` : null,
  ].filter(Boolean).join(" · ");

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <span className={styles.verified}>Machine Identity Verified</span>
          <p className={styles.eyebrow}>MBMC Care</p>
          <h1>Care Passport</h1>
          <p className={styles.intro}>Thiết bị này có hồ sơ định danh trong hệ thống MBMC Care.</p>
          <dl className={styles.facts}>
            <Info label="Machine ID" value={passport.machineCode} />
            <Info label="Model" value={passport.model} />
            <Info label="Cấu hình" value={configuration} />
            <Info label="Màu sắc" value={passport.color} />
            <Info label="Tình trạng" value={passport.condition} />
          </dl>
          <p className={`${styles.state} ${passport.ownershipState === "activated" ? styles.active : styles.pending}`}>
            {passport.ownershipState === "activated"
              ? "Đã kích hoạt bảo hành điện tử"
              : passport.ownershipState === "awaiting_activation"
                ? "Chờ kích hoạt bảo hành điện tử"
                : "Máy chưa được kích hoạt bảo hành"}
          </p>
        </section>

        <StatusMessages activation={status.activation} support={status.support} />

        <section className={styles.card}>
          <p className={styles.eyebrow}>Phạm vi áp dụng</p>
          <h2>Chính sách bảo hành</h2>
          <p>Bảo hành áp dụng cho lỗi chức năng phần cứng. Không áp dụng cho hao mòn ngoại hình, trầy xước, móp cấn, vào nước, rơi vỡ hoặc lỗi do người dùng.</p>
        </section>

        {passport.ownershipState === "not_sold" && (
          <section className={styles.card}>
            <h2>Máy hiện chưa có chủ sở hữu</h2>
            <p>Hồ sơ Care được giữ nguyên. Bảo hành sẽ khả dụng sau giao dịch bán hàng.</p>
          </section>
        )}

        {passport.ownershipState === "awaiting_activation" && (
          <section className={styles.card}>
            <p className={styles.eyebrow}>Xác minh người mua</p>
            <h2>Kích hoạt bảo hành điện tử</h2>
            <p>Nhập đúng tên và số điện thoại đã dùng khi mua máy.</p>
            <form action={`/care/${passport.machineCode}/activate`} method="post" className={styles.form}>
              <label>Họ và tên<input name="customer_name" autoComplete="name" required /></label>
              <label>Số điện thoại mua hàng<input name="phone" inputMode="tel" autoComplete="tel" required /></label>
              <button type="submit">Kích hoạt bảo hành</button>
            </form>
          </section>
        )}

        {passport.ownershipState === "activated" && (
          <>
            <section className={styles.card}>
              <p className={styles.eyebrow}>Bảo hành điện tử</p>
              <h2>Thông tin bảo hành</h2>
              <dl className={styles.facts}>
                <Info label="Trạng thái" value="Đã kích hoạt" />
                <Info label="Ngày kích hoạt" value={formatDate(passport.activatedAt)} />
              </dl>
            </section>
            <section className={styles.card}>
              <p className={styles.eyebrow}>Hỗ trợ sau bán hàng</p>
              <h2>Cần hỗ trợ?</h2>
              <p>Gửi mô tả ngắn để MBMC ghi nhận trước khi trao đổi trực tiếp.</p>
              <form action={`/care/${passport.machineCode}/support`} method="post" className={styles.form}>
                <label>Nhóm vấn đề<select name="title" required defaultValue="">
                  <option value="" disabled>Chọn nhóm vấn đề</option>
                  {["Pin / Sạc", "Màn hình", "Bàn phím / Trackpad", "Loa / Mic / Camera", "Hiệu năng / Nóng / Lag", "Phần mềm / Tài khoản", "Khác"].map((item) => <option key={item}>{item}</option>)}
                </select></label>
                <label>Mô tả<textarea name="description" rows={4} maxLength={2000} required /></label>
                <button type="submit">Tạo phiếu hỗ trợ</button>
              </form>
            </section>
          </>
        )}

        {passport.events.length > 0 && (
          <section className={styles.card}>
            <p className={styles.eyebrow}>Hồ sơ công khai</p>
            <h2>Nhật ký thiết bị</h2>
            <ol className={styles.timeline}>
              {passport.events.map((event) => (
                <li key={event.id}><strong>{event.title}</strong><time>{formatDateTime(event.createdAt)}</time></li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return <div><dt>{label}</dt><dd>{value || "—"}</dd></div>;
}

function StatusMessages({ activation, support }: { activation?: string; support?: string }) {
  if (activation === "mismatch") return <p className={`${styles.notice} ${styles.error}`}>Thông tin chưa khớp với giao dịch mua hàng. Vui lòng kiểm tra lại.</p>;
  if (activation === "invalid") return <p className={`${styles.notice} ${styles.error}`}>Vui lòng nhập đầy đủ họ tên và số điện thoại hợp lệ.</p>;
  if (activation === "failed" || support === "failed") return <p className={`${styles.notice} ${styles.error}`}>Chưa thể xử lý yêu cầu. Vui lòng thử lại sau.</p>;
  if (activation === "success") return <p className={`${styles.notice} ${styles.success}`}>Bảo hành điện tử đã được kích hoạt.</p>;
  if (support === "sent") return <p className={`${styles.notice} ${styles.success}`}>MBMC đã tiếp nhận yêu cầu hỗ trợ cho chiếc máy này.</p>;
  return null;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—";
}
