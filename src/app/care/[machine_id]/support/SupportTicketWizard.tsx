"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_ERROR_COPY,
  SUPPORT_INTAKE_SCHEMA,
  type SupportCategory,
  type SupportErrorCode,
  type SupportMachineContext,
  type SupportReceipt,
} from "@/data/support/support-contract";
import styles from "./support.module.css";

type State = {
  category: SupportCategory | "";
  description: string;
  files: File[];
  contactName: string;
  contactPhone: string;
  idempotencyKey: string;
};
const steps = ["Vấn đề", "Mô tả", "Hình ảnh", "Liên hệ", "Xem lại"];
const initial = (): State => ({
  category: "",
  description: "",
  files: [],
  contactName: "",
  contactPhone: "",
  idempotencyKey: crypto.randomUUID(),
});
function maskedPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length < 4
    ? "••••"
    : `${"•".repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
}
function fingerprint(state: State) {
  return JSON.stringify({
    category: state.category,
    description: state.description,
    files: state.files.map((file) => [
      file.name,
      file.type,
      file.size,
      file.lastModified,
    ]),
    contactName: state.contactName,
    contactPhone: state.contactPhone,
  });
}
export function SupportTicketWizard({
  machine,
}: {
  machine: SupportMachineContext;
}) {
  const [state, setState] = useState<State>(initial);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<SupportReceipt | null>(null);
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);

  const previews = useMemo(
    () => state.files.map((file) => URL.createObjectURL(file)),
    [state.files],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );
  const categoryLabel = useMemo(
    () =>
      SUPPORT_CATEGORIES.find(([value]) => value === state.category)?.[1] ?? "",
    [state.category],
  );
  const change = (patch: Partial<State>) => {
    setState((current) => ({
      ...current,
      ...patch,
      ...(lastAttempt ? { idempotencyKey: crypto.randomUUID() } : null),
    }));
    if (lastAttempt) setLastAttempt(null);
    setError("");
  };
  const next = () => {
    if (step === 0 && !state.category) return setError("Chọn một nhóm vấn đề.");
    if (
      step === 1 &&
      (state.description.trim().length < 1 ||
        state.description.trim().length > 4000)
    )
      return setError("Mô tả cần từ 1 đến 4000 ký tự.");
    if (
      step === 3 &&
      (!state.contactName.trim() ||
        state.contactName.trim().length > 120 ||
        !/^\+?[0-9\s().-]{9,22}$/.test(state.contactPhone.trim()))
    )
      return setError("Kiểm tra lại tên và số điện thoại.");
    setError("");
    setStep((value) => Math.min(4, value + 1));
  };
  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const files = [...state.files, ...Array.from(incoming)];
    if (files.length > 5)
      return setError(SUPPORT_ERROR_COPY.too_many_attachments);
    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
    )
      return setError(SUPPORT_ERROR_COPY.unsupported_attachment);
    if (
      files.some((file) => file.size > 10 * 1024 * 1024) ||
      files.reduce((sum, file) => sum + file.size, 0) > 25 * 1024 * 1024
    )
      return setError(SUPPORT_ERROR_COPY.payload_too_large);
    change({ files });
  };
  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const currentFingerprint = fingerprint(state);
    let key = state.idempotencyKey;
    if (lastAttempt && lastAttempt !== currentFingerprint) {
      key = crypto.randomUUID();
      setState((current) => ({ ...current, idempotencyKey: key }));
    }
    setLastAttempt(currentFingerprint);
    const form = new FormData();
    form.set("schemaVersion", SUPPORT_INTAKE_SCHEMA);
    form.set("machineCode", machine.machineCode);
    form.set("contactName", state.contactName.trim());
    form.set("contactPhone", state.contactPhone.trim());
    form.set("category", state.category);
    form.set("description", state.description.trim());
    form.set("idempotencyKey", key);
    state.files.forEach((file) =>
      form.append("attachments[]", file, file.name),
    );
    try {
      const response = await fetch("/api/public-support-tickets", {
        method: "POST",
        body: form,
      });
      const value = await response.json().catch(() => null);
      if (!response.ok) {
        const code = value?.error?.code as SupportErrorCode;
        setError(
          SUPPORT_ERROR_COPY[code] ??
            SUPPORT_ERROR_COPY.temporarily_unavailable,
        );
        return;
      }
      setReceipt(value as SupportReceipt);
      setState((current) => ({ ...current, idempotencyKey: "" }));
    } catch {
      setError(SUPPORT_ERROR_COPY.temporarily_unavailable);
    } finally {
      setSubmitting(false);
    }
  };
  if (receipt)
    return (
      <section className={styles.card} aria-live="polite">
        <p className={styles.eyebrow}>Yêu cầu đã gửi</p>
        <h1>MBMC đã nhận được yêu cầu</h1>
        <p className={styles.ticketCode}>
          Mã ticket: <strong>{receipt.ticketCode}</strong>
        </p>
        <p>MBMC sẽ liên hệ qua số điện thoại bạn đã cung cấp.</p>
      </section>
    );
  return (
    <div className={styles.shell}>
      <header className={styles.machine}>
        <p className={styles.eyebrow}>Hỗ trợ cho máy</p>
        <h1>{machine.displayName}</h1>
        <p>
          {machine.machineCode} · {machine.configuration}
        </p>
      </header>
      <nav className={styles.progress} aria-label="Tiến trình gửi yêu cầu">
        {steps.map((label, index) => (
          <span
            key={label}
            data-active={index === step}
            data-complete={index < step}
          >
            {index + 1}
            <small>{label}</small>
          </span>
        ))}
      </nav>
      <section className={styles.card}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {step === 0 && (
          <fieldset>
            <legend>Máy đang gặp vấn đề gì?</legend>
            <div className={styles.options}>
              {SUPPORT_CATEGORIES.map(([value, label]) => (
                <label key={value} data-selected={state.category === value}>
                  <input
                    type="radio"
                    name="category"
                    value={value}
                    checked={state.category === value}
                    onChange={() => change({ category: value })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {step === 1 && (
          <label className={styles.field}>
            <strong>Bạn gặp tình trạng này như thế nào?</strong>
            <span>
              Vấn đề bắt đầu khi nào? Máy có hiện thông báo gì? Bạn đã thử cách
              nào?
            </span>
            <textarea
              rows={9}
              minLength={1}
              maxLength={4000}
              value={state.description}
              onChange={(event) => change({ description: event.target.value })}
            />
            <small>{state.description.length}/4000</small>
          </label>
        )}
        {step === 2 && (
          <div>
            <h2>Có hình ảnh nào giúp MBMC hiểu rõ hơn không?</h2>
            <p>Không bắt buộc · JPEG, PNG hoặc WebP · tối đa 5 ảnh.</p>
            <label className={styles.upload}>
              Chọn hình ảnh
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            <div className={styles.previews}>
              {state.files.map((file, index) => (
                <figure key={`${file.name}-${file.lastModified}`}>
                  <Image
                    src={previews[index]}
                    alt={`Ảnh đính kèm ${index + 1}`}
                    fill
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() =>
                      change({
                        files: state.files.filter((_, item) => item !== index),
                      })
                    }
                  >
                    Xóa ảnh
                  </button>
                </figure>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2>MBMC nên liên hệ với ai?</h2>
            <p>Số điện thoại không cần trùng với người mua hoặc chủ Care.</p>
            <label className={styles.field}>
              <strong>Họ và tên</strong>
              <input
                autoComplete="name"
                maxLength={120}
                value={state.contactName}
                onChange={(event) =>
                  change({ contactName: event.target.value })
                }
              />
            </label>
            <label className={styles.field}>
              <strong>Số điện thoại</strong>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={state.contactPhone}
                onChange={(event) =>
                  change({ contactPhone: event.target.value })
                }
              />
            </label>
          </div>
        )}
        {step === 4 && (
          <div>
            <h2>Kiểm tra yêu cầu</h2>
            <dl className={styles.review}>
              <div>
                <dt>Máy</dt>
                <dd>
                  {machine.displayName}
                  <small>
                    {machine.machineCode} · {machine.configuration}
                  </small>
                </dd>
              </div>
              <div>
                <dt>Vấn đề</dt>
                <dd>{categoryLabel}</dd>
              </div>
              <div>
                <dt>Mô tả</dt>
                <dd className={styles.description}>{state.description}</dd>
              </div>
              <div>
                <dt>Hình ảnh</dt>
                <dd>{state.files.length} ảnh</dd>
              </div>
              <div>
                <dt>Liên hệ</dt>
                <dd>
                  {state.contactName}
                  <small>{maskedPhone(state.contactPhone)}</small>
                </dd>
              </div>
            </dl>
          </div>
        )}
        <div className={styles.actions}>
          {step > 0 && (
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
            >
              ← Quay lại
            </button>
          )}
          {step < 4 ? (
            <button type="button" className={styles.primary} onClick={next}>
              Tiếp tục
            </button>
          ) : (
            <button
              type="button"
              className={styles.primary}
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "Đang gửi…" : "Gửi yêu cầu hỗ trợ"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
