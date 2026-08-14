"use client";

import { useEffect, useState } from "react";
import { issueDemandCaptcha, submitCaptchaDemand } from "@/lib/demand-captcha";
import type {
  DesiredMacBookSpecV1,
  InventoryContextSnapshotV1,
  RequirementSnapshotV1,
} from "@/lib/demand-contract";

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
        <strong>MBMC đã ghi nhận nhu cầu của bạn.</strong>
        <p>MBMC sẽ chủ động liên hệ khi tìm được máy phù hợp.</p>
      </section>
    );
  return (
    <form
      className="demand-form"
      onSubmit={async (e) => {
        e.preventDefault();
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
      <label>
        Số điện thoại
        <input
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ví dụ: 0912 345 678"
        />
      </label>
      <label>
        Nhập 4 số: <strong>{challenge?.representation ?? "…"}</strong>
        <input
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          required
          value={answer}
          onChange={(e) =>
            setAnswer(e.target.value.replace(/\D/g, "").slice(0, 4))
          }
        />
      </label>
      <small>
        CAPTCHA chỉ giúp hạn chế spam, không xác minh quyền sở hữu số điện
        thoại.
      </small>
      {state === "error" && (
        <p role="alert">
          Chưa thể ghi nhận. Kiểm tra số điện thoại và CAPTCHA rồi thử lại.
        </p>
      )}
      <div>
        <button
          className="quiz-primary"
          disabled={state === "busy" || !challenge}
        >
          {state === "busy" ? "Đang gửi…" : "Gửi nhu cầu"}
        </button>
        {onCancel && (
          <button type="button" className="quiz-secondary" onClick={onCancel}>
            Quay lại
          </button>
        )}
      </div>
    </form>
  );
}
