"use client";

import { useEffect, useState } from "react";
import {
  CTV_ANSWERS_SCHEMA,
  CTV_APPLICATION_SCHEMA,
  CTV_QUESTION_IDS,
  type CtvQuestionId,
} from "@/lib/ctv-application-contract";
import {
  issueCtvCaptcha,
  submitCtvApplication,
  type CtvCaptcha,
} from "@/lib/ctv-application-client";

const DRAFT_KEY = "mbmc_ctv_application_draft_v1";
const emptyAnswers = Object.fromEntries(
  CTV_QUESTION_IDS.map((id) => [id, ""]),
) as Record<CtvQuestionId, string>;
const prompts: Record<CtvQuestionId, string> = {
  distribution_surface:
    "Hiện tại bạn thường có cơ hội gặp người cần mua MacBook từ đâu?",
  mbmc_exploration: "Bạn nhận thấy điều gì?",
  unclear_customer:
    "Một khách nói: ‘Em cần MacBook khoảng 15–20 triệu để học và làm việc, nhưng em không biết chọn máy nào.’ Bạn sẽ làm gì tiếp theo?",
  unavailable_machine:
    "Khách nói: ‘Mình cần Pro 14 inch, RAM 16GB, khoảng 20 triệu.’ Nhưng MBMC hiện chưa có đúng máy. Bạn xử lý thế nào?",
  price_question:
    "Khách hỏi: ‘Máy này có giảm thêm được không?’ Trong khi website đã công khai giá. Bạn sẽ trả lời thế nào?",
  ctv_value: "Theo bạn, CTV của MBMC chủ yếu tạo ra giá trị ở đâu?",
  challenge:
    "Có điều gì về cách MBMC hoạt động khiến bạn chưa rõ hoặc chưa đồng ý không?",
};

export function CtvApplicationForm() {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [answers, setAnswers] = useState(emptyAnswers);
  const [captcha, setCaptcha] = useState<CtvCaptcha | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [submissionKey] = useState(() => crypto.randomUUID());
  const [state, setState] = useState<"idle" | "busy" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null");
        if (!draft) return;
        setDisplayName(draft.displayName ?? "");
        setPhone(draft.phone ?? "");
        setProfileUrl(draft.profileUrl ?? "");
        setAnswers({ ...emptyAnswers, ...(draft.answers ?? {}) });
      } catch {}
    });
    void issueCtvCaptcha()
      .then(setCaptcha)
      .catch(() => setState("error"));
  }, []);

  useEffect(() => {
    if (state !== "success")
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ displayName, phone, profileUrl, answers }),
      );
  }, [displayName, phone, profileUrl, answers, state]);

  if (state === "success")
    return (
      <section className="ctv-success" aria-live="polite">
        <h2>Đã gửi đăng ký.</h2>
        <p>MBMC sẽ xem phần trả lời và chủ động liên hệ nếu phù hợp.</p>
      </section>
    );

  return (
    <form
      className="ctv-application-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!captcha) return;
        setState("busy");
        try {
          await submitCtvApplication({
            schemaVersion: CTV_APPLICATION_SCHEMA,
            submissionKey,
            displayName,
            submittedPhone: phone,
            profileUrl,
            answers: { schemaVersion: CTV_ANSWERS_SCHEMA, ...answers },
            captchaChallengeId: captcha.challengeId,
            captchaResponse: captchaAnswer,
          });
          sessionStorage.removeItem(DRAFT_KEY);
          setState("success");
        } catch {
          setState("error");
          setCaptchaAnswer("");
          void issueCtvCaptcha()
            .then(setCaptcha)
            .catch(() => setCaptcha(null));
        }
      }}
    >
      <fieldset>
        <legend>Thông tin liên hệ</legend>
        <label>
          Tên hiển thị
          <input
            required
            maxLength={120}
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        <label>
          Số điện thoại / Zalo
          <input
            required
            maxLength={40}
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <label>
          Facebook / trang cá nhân
          <input
            required
            maxLength={500}
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={profileUrl}
            onChange={(event) => setProfileUrl(event.target.value)}
          />
        </label>
      </fieldset>
      {CTV_QUESTION_IDS.map((id, index) => (
        <section className="ctv-question" key={id}>
          <label htmlFor={id}>
            <strong>
              {index + 1}. {prompts[id]}
            </strong>
          </label>
          {id === "mbmc_exploration" && (
            <div className="ctv-exploration-task">
              <p>
                Hãy thử đặt mình vào vai một người đang có ý định mua MacBook cũ
                và trải nghiệm website MBMC.
              </p>
              <a
                href="https://mbmc.vn/?experience=ctv-join"
                target="_blank"
                rel="noopener noreferrer"
              >
                Trải nghiệm mbmc.vn ↗
              </a>
              <p>
                Website sẽ mở trong tab mới. Khi trải nghiệm xong, quay lại tab
                này và chia sẻ những gì bạn nhận thấy.
              </p>
            </div>
          )}
          <textarea
            id={id}
            required
            maxLength={4000}
            rows={5}
            value={answers[id]}
            onChange={(event) =>
              setAnswers((current) => ({
                ...current,
                [id]: event.target.value,
              }))
            }
          />
          {id === "mbmc_exploration" && (
            <small>
              Không có đáp án đúng. Bạn có thể nói về bất cứ điều gì thấy hữu
              ích, khó hiểu, chưa hợp lý hoặc khiến bạn chú ý.
            </small>
          )}
          {id === "challenge" && (
            <small>Bạn có thể không đồng ý và nói rõ lý do.</small>
          )}
        </section>
      ))}
      <label className="ctv-captcha">
        Xác nhận: <strong>{captcha?.representation ?? "…"}</strong>
        <input
          required
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          aria-label="Nhập bốn số xác nhận"
          value={captchaAnswer}
          onChange={(event) =>
            setCaptchaAnswer(event.target.value.replace(/\D/g, "").slice(0, 4))
          }
        />
      </label>
      {state === "error" && (
        <p className="ctv-error" role="alert">
          Chưa thể gửi. Hãy kiểm tra thông tin, câu trả lời và 4 số xác nhận rồi
          thử lại.
        </p>
      )}
      <button disabled={state === "busy" || !captcha}>
        {state === "busy" ? "Đang gửi…" : "Gửi đăng ký"}
      </button>
    </form>
  );
}
