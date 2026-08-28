import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareStoryBlock } from "@/components/handover/CareStoryBlock";
import { readCurrentCareAccess } from "@/data/care/care-access.server";
import { normalizeMachineCode } from "@/data/care/care-contract";
import {
  getPublicCarePassport,
  resolvePublicCareState,
} from "@/data/care/care-repository.server";
import { getCareStory } from "@/data/handover/get-care-story.server";
import { MBMC_CONTACTS } from "@/lib/contact-routing";
import { VerificationForm } from "./VerificationForm";
import { ActivationForm } from "./ActivationForm";
import styles from "./care.module.css";
import { CareActions } from "./CareActions";
import { CarePublicImageGallery } from "./CarePublicImageGallery";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ machine_id: string }>;
  searchParams: Promise<{
    activation?: string;
    support?: string;
    verification?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Care Passport",
  description: "Hồ sơ định danh và bảo hành điện tử của thiết bị MBMC.",
  robots: { index: false, follow: false },
};

export default async function CarePage({ params, searchParams }: PageProps) {
  const [{ machine_id }, status] = await Promise.all([params, searchParams]);
  const machineCode = normalizeMachineCode(machine_id);
  const lifecycle = await resolvePublicCareState(machineCode);
  if (lifecycle.state === "not_found") notFound();
  if (lifecycle.state === "care_unavailable") {
    return <CareUnavailable machineCode={lifecycle.machineCode} />;
  }
  if (lifecycle.state === "activation_required") {
    return (
      <ActivationForm
        machineCode={lifecycle.machineCode}
        status={status.activation}
      />
    );
  }
  if (lifecycle.state === "unsafe") notFound();
  const access = await readCurrentCareAccess(machineCode);
  if (!access) {
    return (
      <VerificationForm
        machineCode={machineCode}
        failed={status.verification === "failed"}
      />
    );
  }
  const [passport, careStory] = await Promise.all([
    getPublicCarePassport(machineCode, access),
    getCareStory(machineCode, access),
  ]);
  if (!passport) notFound();

  const configuration = [
    passport.configuration.chip,
    passport.configuration.ramGb
      ? `${passport.configuration.ramGb}GB RAM`
      : null,
    passport.configuration.ssdGb
      ? `${passport.configuration.ssdGb}GB SSD`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className={styles.page}>
      <div className={`${styles.shell} ${styles.authenticatedShell}`}>
        <section className={styles.card}>
          <span className={styles.verified}>Machine Identity Verified</span>
          <p className={styles.eyebrow}>MBMC Care</p>
          <h1>Care Passport</h1>
          <p className={styles.intro}>
            Thiết bị này có hồ sơ định danh trong hệ thống MBMC Care.
          </p>
          <div
            className={`${styles.passportGrid} ${passport.publicImage ? "" : styles.passportGridWithoutImage}`}
          >
            {passport.publicImage && (
              <figure className={styles.machineFigure}>
                <Image
                  src={passport.publicImage.url}
                  alt={passport.publicImage.alt}
                  width={passport.publicImage.width ?? 1200}
                  height={passport.publicImage.height ?? 900}
                  sizes="(max-width: 48rem) 100vw, 32rem"
                />
                <figcaption>Ảnh công khai thời điểm chưa bán</figcaption>
              </figure>
            )}
            <dl className={`${styles.facts} ${styles.passportFacts}`}>
              <Info label="Machine ID" value={passport.machineCode} />
              <Info label="Model" value={passport.model} />
              <Info label="Cấu hình" value={configuration} />
              <Info label="Màu sắc" value={passport.color} />
              <Info label="Tình trạng" value={passport.condition} />
            </dl>
          </div>
          <CarePublicImageGallery
            images={passport.publicImages}
            representativeVisible={passport.publicImage !== null}
          />
          <p
            className={`${styles.state} ${passport.ownershipState === "activated" ? styles.active : styles.pending}`}
          >
            {passport.ownershipState === "activated"
              ? "Đã kích hoạt bảo hành điện tử"
              : passport.ownershipState === "awaiting_activation"
                ? "Chờ kích hoạt bảo hành điện tử"
                : "Máy chưa được kích hoạt bảo hành"}
          </p>
        </section>

        <StatusMessages
          activation={status.activation}
          support={status.support}
        />

        {passport.ownershipState === "not_sold" && (
          <section className={styles.card}>
            <h2>Máy hiện chưa có chủ sở hữu</h2>
            <p>
              Hồ sơ Care được giữ nguyên. Bảo hành sẽ khả dụng sau giao dịch bán
              hàng.
            </p>
          </section>
        )}

        {passport.ownershipState === "awaiting_activation" && (
          <section className={styles.card}>
            <p className={styles.eyebrow}>Xác minh người mua</p>
            <h2>Kích hoạt bảo hành điện tử</h2>
            <p>Nhập đúng tên và số điện thoại đã dùng khi mua máy.</p>
            <form
              action={`/care/${passport.machineCode}/activate`}
              method="post"
              className={styles.form}
            >
              <label>
                Họ và tên
                <input name="customer_name" autoComplete="name" required />
              </label>
              <label>
                Số điện thoại mua hàng
                <input
                  name="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
              </label>
              <button type="submit">Kích hoạt bảo hành</button>
            </form>
          </section>
        )}

        {passport.ownershipState === "activated" && (
          <section className={styles.card}>
            <div className={styles.cardHeadingRow}>
              <div>
                <p className={styles.eyebrow}>Bảo hành điện tử</p>
                <h2>Bảo hành của máy</h2>
              </div>
              <span
                className={`${styles.warrantyBadge} ${passport.warranty.status === "active" ? styles.active : passport.warranty.status === "expired" ? styles.expired : styles.pending}`}
              >
                {passport.warranty.status === "active"
                  ? "Còn bảo hành"
                  : passport.warranty.status === "expired"
                    ? "Đã hết bảo hành"
                    : "Chưa ghi nhận hạn bảo hành"}
              </span>
            </div>
            <div className={styles.warrantyGrid}>
              <div>
                <dl className={styles.facts}>
                  <Info
                    label="Trạng thái"
                    value={
                      passport.warranty.status === "active"
                        ? "Còn bảo hành"
                        : passport.warranty.status === "expired"
                          ? "Đã hết bảo hành"
                          : "Cần MBMC xác nhận"
                    }
                  />
                  <Info
                    label="Ngày kích hoạt"
                    value={formatDate(passport.activatedAt)}
                  />
                  <Info
                    label="Hạn bảo hành"
                    value={formatDateTime(passport.warranty.expiresAt)}
                  />
                </dl>
                {passport.warranty.availability ===
                  "historical_snapshot_missing" && (
                  <p className={styles.warrantyNote}>
                    Máy đã kích hoạt bảo hành điện tử, nhưng hồ sơ cũ chưa ghi
                    nhận ngày hết hạn. MBMC sẽ đối chiếu khi bạn cần hỗ trợ.
                  </p>
                )}
              </div>
              <div className={styles.careOfferPanel}>
                {passport.careOptions.length > 0 ? (
                  <>
                    <h3>Gói Care gợi ý</h3>
                    <ul
                      className={styles.careOptions}
                      aria-label="Các gói Care khả dụng"
                    >
                      {passport.careOptions.map((option) => (
                        <li key={option.code}>
                          <strong>Care {option.totalCoverageMonths}</strong>
                          <span>Tổng {option.totalCoverageMonths} tháng</span>
                          <b>{formatMoney(option.price)}</b>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className={styles.emptyOffer}>
                    <p className={styles.offerEyebrow}>Gia hạn bảo vệ</p>
                    <h3>Care cho chiếc Mac này</h3>
                    <p>
                      Tiếp tục bảo vệ máy sau thời gian bảo hành tiêu chuẩn.
                    </p>
                  </div>
                )}
                <Link
                  className={styles.link}
                  href={passport.policy?.careUrl ?? "/chinh-sach/mbmc-care"}
                >
                  Xem các gói Care
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className={styles.card}>
          <p className={styles.eyebrow}>Phạm vi áp dụng</p>
          <h2>Chính sách bảo hành</h2>
          <p>
            Bảo hành áp dụng cho lỗi chức năng phần cứng theo chính sách được
            xác nhận cho Machine ID này.
          </p>
          {passport.policy?.summaryItems.length ? (
            <ul
              className={styles.policyHighlights}
              aria-label="Tóm tắt phạm vi bảo hành"
            >
              {passport.policy.summaryItems.slice(0, 3).map((item) => (
                <li key={item}>
                  <span aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          <details className={styles.disclosure}>
            <summary>Xem phạm vi chi tiết</summary>
            <section
              className={`${styles.policyPreview} ${styles.coveredPolicy}`}
            >
              <h3>
                <span aria-hidden="true">✓</span> Được bảo hành
              </h3>
              {passport.policy?.summaryItems.length ? (
                <ul>
                  {passport.policy.summaryItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>Phạm vi cụ thể được đối chiếu theo Machine ID.</p>
              )}
            </section>
          </details>
          <Link
            className={styles.textLink}
            href={passport.policy?.warrantyUrl ?? "/chinh-sach/bao-hanh"}
          >
            Xem chính sách bảo hành đầy đủ →
          </Link>
        </section>

        <CareActions
          machineCode={passport.machineCode}
          model={passport.model}
          unlocked
        />

        <CareStoryBlock story={careStory} />

        <ServiceHub />

        {passport.events.length > 0 && (
          <section className={styles.card}>
            <p className={styles.eyebrow}>Hồ sơ công khai</p>
            <h2>Nhật ký thiết bị</h2>
            <ol className={styles.timeline}>
              {passport.events.map((event) => (
                <li key={event.id}>
                  <strong>{event.title}</strong>
                  <time>{formatDateTime(event.createdAt)}</time>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

function ServiceHub() {
  const services = [
    [
      "Phụ kiện phù hợp",
      "Sạc, cáp, túi chống sốc và phụ kiện tương thích với máy của bạn.",
      "⌁",
      "Hỏi phụ kiện →",
    ],
    [
      "Cài đặt & phần mềm",
      "Cài lại macOS, phần mềm cơ bản hoặc hỗ trợ thiết lập máy.",
      "⌘",
      "Nhờ cài đặt →",
    ],
    [
      "Ghé MBMC",
      "Muốn kiểm tra máy, hỏi gì đó về Mac hoặc đơn giản là qua ngồi chơi.",
      "⌖",
      "Đặt lịch ghé →",
    ],
  ] as const;
  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Dành cho chiếc Mac này</p>
      <h2>Có thể bạn sẽ cần</h2>
      <div className={styles.serviceGrid}>
        {services.map(([title, copy, icon, cta]) => (
          <article key={title} className={styles.serviceItem}>
            <span className={styles.serviceIcon} aria-hidden="true">
              {icon}
            </span>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
            <a
              href={MBMC_CONTACTS.zalo.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cta}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusMessages({
  activation,
  support,
}: {
  activation?: string;
  support?: string;
}) {
  if (activation === "mismatch")
    return (
      <p className={`${styles.notice} ${styles.error}`}>
        Thông tin chưa khớp với giao dịch mua hàng. Vui lòng kiểm tra lại.
      </p>
    );
  if (activation === "invalid")
    return (
      <p className={`${styles.notice} ${styles.error}`}>
        Vui lòng nhập đầy đủ họ tên và số điện thoại hợp lệ.
      </p>
    );
  if (activation === "failed" || support === "failed")
    return (
      <p className={`${styles.notice} ${styles.error}`}>
        Chưa thể xử lý yêu cầu. Vui lòng thử lại sau.
      </p>
    );
  if (activation === "success")
    return (
      <p className={`${styles.notice} ${styles.success}`}>
        Bảo hành điện tử đã được kích hoạt.
      </p>
    );
  if (support === "sent")
    return (
      <p className={`${styles.notice} ${styles.success}`}>
        MBMC đã tiếp nhận yêu cầu hỗ trợ cho chiếc máy này.
      </p>
    );
  return null;
}

function CareUnavailable({ machineCode }: { machineCode: string }) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>MBMC Care</p>
          <h1>Hồ sơ Care chưa khả dụng</h1>
          <p>
            Máy này đã được MBMC ghi nhận, nhưng hiện chưa có hồ sơ Care có thể
            mở. Bạn vẫn có thể gửi yêu cầu hỗ trợ cho máy.
          </p>
          <div className={styles.actionGrid}>
            <Link
              className={`${styles.link} ${styles.supportLink}`}
              href={`/care/${encodeURIComponent(machineCode)}/support`}
            >
              Báo vấn đề với máy
            </Link>
            <Link className={styles.link} href="/">
              Về trang chủ MBMC
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      })
    : "—";
}

function formatDateTime(value: string | null) {
  return value
    ? new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : "—";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}
