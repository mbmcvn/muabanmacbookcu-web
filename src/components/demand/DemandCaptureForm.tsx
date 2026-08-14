"use client";

import { useEffect, useState } from "react";
import { issueDemandCaptcha, submitCaptchaDemand } from "@/lib/demand-captcha";
import type {
  DesiredMacBookSpecV1,
  InventoryContextSnapshotV1,
  RequirementSnapshotV1,
} from "@/lib/demand-contract";

export function maskDemandPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return "số điện thoại đã cung cấp";
  return `${digits.slice(0, 4)}•••${digits.slice(-3)}`;
}

export function DemandCaptureForm({
  sourceRoute,
  requirementSnapshot,
  desiredSpecSnapshot,
  inventoryContextSnapshot,
  referralEvidence,
  onCancel,
}: {
  sourceRoute: "chon_macbook" | "may_dang_co";
  requirementSnapshot?: RequirementSnapshotV1;
  desiredSpecSnapshot?: DesiredMacBookSpecV1;
  inventoryContextSnapshot: InventoryContextSnapshotV1;
  referralEvidence?: string | null;
  onCancel?: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [answer, setAnswer] = useState("");
  const [challenge, setChallenge] = useState<Awaited<
    ReturnType<typeof issueDemandCaptcha>
  > | null>(null);
  const [submissionKey] = useState(() => crypto.randomUUID());
  const [state, setState] = useState<"idle" | "busy" | "success" | "error">(
    "idle",
  );
  const refresh = () =>
    issueDemandCaptcha()
      .then(setChallenge)
      .catch(() => setState("error"));
  useEffect(() => {
    void refresh();
  }, []);

  if (state === "success")
    return (
      <section className="demand-success" aria-live="polite">
        <strong>Đã ghi nhận nhu cầu.</strong>
        <p>
          MBMC sẽ liên hệ qua số {maskDemandPhone(phone)} khi có lựa chọn phù
          hợp.
        </p>
      </section>
    );

  return (
    <form
      className="demand-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!challenge) return;
        setState("busy");
        try {
          await submitCaptchaDemand({
            submissionKey,
            submittedPhone: phone,
            sourceRoute,
            requirementSnapshot,
            desiredSpecSnapshot,
            inventoryContextSnapshot,
            referralEvidence,
            captchaChallengeId: challenge.challengeId,
            captchaResponse: answer,
          });
          setState("success");
        } catch {
          setState("error");
          setAnswer("");
          void refresh();
        }
      }}
    >
      <h3>Để MBMC liên hệ khi tìm được máy phù hợp</h3>
      <label>
        Số điện thoại
        <input
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Ví dụ: 0912 345 678"
        />
      </label>
      <label>
        <span>
          Xác nhận:{" "}
          <strong className="demand-challenge">
            {challenge?.representation ?? "…"}
          </strong>
        </span>
        <input
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          required
          value={answer}
          placeholder="Nhập 4 số trên"
          aria-label="Nhập bốn số xác nhận"
          onChange={(event) =>
            setAnswer(event.target.value.replace(/\D/g, "").slice(0, 4))
          }
        />
      </label>
      {state === "error" && (
        <p className="demand-form-error" role="alert">
          Chưa thể ghi nhận. Kiểm tra số điện thoại và 4 số xác nhận rồi thử
          lại.
        </p>
      )}
      <div className="demand-form-actions">
        <button
          className="quiz-primary"
          disabled={state === "busy" || !challenge}
        >
          {state === "busy" ? "Đang gửi…" : "Gửi nhu cầu"}
        </button>
        {onCancel && (
          <button type="button" className="quiz-secondary" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
