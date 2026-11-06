"use client";

import { useState } from "react";
import styles from "./care.module.css";
import { CareActions } from "./CareActions";

export function VerificationForm({
  machineCode,
  failed,
  expired,
  embedded = false,
}: {
  machineCode: string;
  failed: boolean;
  expired?: boolean;
  embedded?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const Container = embedded ? "div" : "main";
  const Heading = embedded ? "h2" : "h1";
  return (
    <Container className={embedded ? undefined : styles.page}>
      <div className={embedded ? undefined : styles.shell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>MBMC Care</p>
          <Heading>Mở hồ sơ Care</Heading>
          <p className={styles.intro}>
            Nhập số điện thoại đã dùng khi kích hoạt bảo hành để xem hồ sơ của
            máy.
          </p>
          {!embedded && (
            <dl className={styles.facts}>
              <Info label="Machine ID" value={machineCode} />
            </dl>
          )}
          {failed && (
            <p className={`${styles.notice} ${styles.error}`} role="alert">
              Thông tin chưa khớp. Kiểm tra lại số điện thoại đã dùng khi kích
              hoạt bảo hành.
            </p>
          )}
          {expired && (
            <p className={`${styles.notice} ${styles.error}`} role="alert">
              Phiên Care đã hết hạn. Xác minh lại số điện thoại để tiếp tục.
            </p>
          )}
          <form
            action={`/care/${encodeURIComponent(machineCode)}/verify`}
            method="post"
            className={styles.form}
            onSubmit={() => setPending(true)}
          >
            <label>
              Số điện thoại
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0xxx xxx xxx"
                required
              />
              <span className={styles.fieldHint}>
                Dùng đúng số điện thoại đã đăng ký khi mua máy.
              </span>
            </label>
            <button type="submit" disabled={pending}>
              {pending ? "Đang mở…" : "Mở hồ sơ Care"}
            </button>
          </form>
        </section>
        {!embedded && <CareActions machineCode={machineCode} />}
      </div>
    </Container>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
