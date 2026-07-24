"use client";

import Link from "next/link";
import { buildZaloSummary } from "./recommendation-engine";
import { getRecommendationOptionTitles, getRecommendationTitle, getResultCtaCopy } from "./result-cta";
import type { QuizAnswers, Recommendation, RecommendationOption } from "./quiz-types";
import { resultIllustration } from "./_lib/quiz-illustrations";
import { QuizIllustration } from "./QuizIllustration";

function Option({ title, option }: { title: string; option: RecommendationOption }) {
  return <article className="recommendation-option"><p>{title}</p><h3>{option.label}</h3><strong>{option.configuration}</strong><span>{option.note}</span></article>;
}

export function RecommendationView({ answers, result, onRestart }: { answers: QuizAnswers; result: Recommendation; onRestart: () => void }) {
  const summary = buildZaloSummary(answers, result);
  const cta = getResultCtaCopy(result);
  const optionTitles = getRecommendationOptionTitles(result);
  const openZalo = async () => {
    try { await navigator.clipboard.writeText(summary); } catch {}
    window.location.href = "https://zalo.me/0326147088";
  };
  return (
    <section className="quiz-result" aria-labelledby="recommendation-title">
      <div className="result-hero">
        <div>
          <p className="quiz-eyebrow">Gợi ý dành cho bạn</p>
          <h1 id="recommendation-title">{getRecommendationTitle(result)}</h1>
          <p className="result-lead">{result.explanation}</p>
          <div className="result-specs">
            <div><span>RAM tối thiểu</span><strong>{result.minimumRam}GB</strong></div>
            <div><span>Lưu trữ</span><strong>{result.storageGuidance}</strong></div>
          </div>
        </div>
        <QuizIllustration
          src={resultIllustration(result)}
          alt={`Gợi ý ${result.family} ${result.size} từ MBMC`}
          className="result-hero-image"
          sizes="(max-width: 720px) calc(100vw - 2rem), 34vw"
        />
      </div>
      {result.productFamilyFit === "air_or_pro" && (
        <section className="family-preference">
          <p className="quiz-eyebrow">Air hay Pro đều phù hợp</p>
          <p>Chọn Air nếu bạn thích máy mỏng, tối giản và không quan tâm Touch Bar.</p>
          <p>Chọn Pro nếu bạn thích Touch Bar hoặc muốn có quạt khi chạy tải lâu.</p>
        </section>
      )}
      {result.budgetConflict && <aside className="quiz-warning"><strong>Vẫn có cách đưa cấu hình về gần ngân sách</strong><p>MBMC sẽ ưu tiên đổi thế hệ chip, dung lượng lưu trữ hoặc mức ngoại hình trước khi giảm RAM tối thiểu. Khi xem máy đang có, hãy giữ bộ lọc RAM ở mức {result.minimumRam}GB rồi so sánh các phần còn lại.</p></aside>}
      {answers.specializedSoftware?.trim() && <aside className="quiz-warning"><strong>Cần xác nhận thêm một chi tiết</strong><p>MBMC sẽ kiểm tra cách chạy phần mềm này trên đúng dòng máy trước khi bạn mua.</p></aside>}
      <div className="recommendation-reasons"><p className="quiz-eyebrow">Vì sao MBMC gợi ý như vậy</p><ul>{result.reasons.map((reason) => { const [answer, conclusion] = reason.split("\n"); return <li key={reason}><span>{answer}</span><strong>{conclusion}</strong></li>; })}</ul></div>
      <div className="recommendation-options">
        <Option title={optionTitles.bestFit} option={result.bestFit} />
        {result.cheaper && <Option title={optionTitles.cheaper} option={result.cheaper} />}
        <Option title={optionTitles.upgrade} option={result.upgrade} />
      </div>
      <div className="result-actions">
        {cta.primaryDestination === "inventory"
          ? <Link className="quiz-primary" href="/may-dang-co">{cta.primary}</Link>
          : <button className="quiz-primary" type="button" onClick={openZalo}>{cta.primary}</button>}
        {cta.secondary && <button className="quiz-secondary" type="button" onClick={openZalo}>{cta.secondary}</button>}
      </div>
      <details className="zalo-summary"><summary>Xem nội dung tóm tắt gửi cho MBMC</summary><pre>{summary}</pre></details>
      <button className="quiz-text-action" type="button" onClick={onRestart}>Làm lại từ đầu</button>
    </section>
  );
}
