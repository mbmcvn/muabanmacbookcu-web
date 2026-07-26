"use client";

import { useState } from "react";
import styles from "./care.module.css";
import { CareActions } from "./CareActions";

export function VerificationForm({
  machineCode,
  failed,
}: {
  machineCode: string;
  failed: boolean;
}) {
  const [pending, setPending] = useState(false);
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>MBMC Care</p>
          <h1>Mở hồ sơ Care</h1>
          <p className={styles.intro}>
            Nhập số điện thoại đã dùng khi kích hoạt bảo hành để xem hồ sơ của
            máy.
          </p>
          <dl className={styles.facts}>
            <Info label="Machine ID" value={machineCode} />
          </dl>
          {failed && (
            <p className={`${styles.notice} ${styles.error}`} role="alert">
              Thông tin chưa khớp. Kiểm tra lại số điện thoại đã dùng khi kích
              hoạt bảo hành.
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
        <CareActions machineCode={machineCode} />
      </div>
    </main>
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
