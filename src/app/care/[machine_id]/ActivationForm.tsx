"use client";

import { useState } from "react";
import styles from "./care.module.css";

export function ActivationForm({
  machineCode,
  status,
}: {
  machineCode: string;
  status?: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>MBMC CARE</p>
          <h1>Kích hoạt hồ sơ Care</h1>
          <p className={styles.intro}>
            Nhập tên và số điện thoại đã dùng khi mua máy để kích hoạt bảo hành
            và mở hồ sơ của thiết bị.
          </p>
          <dl className={styles.facts}>
            <div>
              <dt>Machine ID</dt>
              <dd>{machineCode}</dd>
            </div>
          </dl>
          {status && status !== "success" && (
            <p className={`${styles.notice} ${styles.error}`} role="alert">
              Thông tin chưa khớp. Vui lòng kiểm tra lại và thử lại.
            </p>
          )}
          <form
            action={`/care/${encodeURIComponent(machineCode)}/activate`}
            method="post"
            className={styles.form}
            onSubmit={() => setPending(true)}
          >
            <label>
              Tên khách hàng
              <input name="customer_name" autoComplete="name" required />
            </label>
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
              {pending ? "Đang kích hoạt…" : "Kích hoạt MBMC Care"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
