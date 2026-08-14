"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildZaloSummary } from "./recommendation-engine";
import { loadInventoryMatches } from "./inventory-match.actions";
import {
  inventoryZaloLine,
  type InventoryMatchViewState,
} from "./inventory-match-presentation";
import { InventoryMatchSection } from "./InventoryMatchSection";
import {
  getRecommendationOptionTitles,
  getRecommendationTitle,
  getResultCtaCopy,
} from "./result-cta";
import type {
  QuizAnswers,
  Recommendation,
  RecommendationOption,
} from "./quiz-types";
import { resultIllustration } from "./_lib/quiz-illustrations";
import { QuizIllustration } from "./QuizIllustration";
import { useContactChannel } from "@/hooks/useContactChannel";
import { DemandCaptureForm } from "@/components/demand/DemandCaptureForm";
import {
  INVENTORY_CONTEXT_SCHEMA,
  REQUIREMENT_SNAPSHOT_SCHEMA,
} from "@/lib/demand-contract";

function Option({
  title,
  option,
}: {
  title: string;
  option: RecommendationOption;
}) {
  return (
    <article className="recommendation-option">
      <p>{title}</p>
      <h3>{option.label}</h3>
      <strong>{option.configuration}</strong>
      <span>{option.note}</span>
    </article>
  );
}

export function RecommendationView({
  answers,
  result,
  onRestart,
}: {
  answers: QuizAnswers;
  result: Recommendation;
  onRestart: () => void;
}) {
  const { contactUrl, referralEvidence } = useContactChannel();
  const [capturingDemand, setCapturingDemand] = useState(false);
  const [inventoryState, setInventoryState] =
    useState<InventoryMatchViewState | null>(null);
  useEffect(() => {
    let current = true;
    loadInventoryMatches(result.profile)
      .then((state) => {
        if (current) setInventoryState(state);
      })
      .catch(() => {
        if (current) setInventoryState({ status: "failed" });
      });
    return () => {
      current = false;
    };
  }, [result.profile]);
  const inventoryLine = inventoryState
    ? inventoryZaloLine(inventoryState)
    : null;
  const summary = [buildZaloSummary(answers, result), inventoryLine]
    .filter(Boolean)
    .join("\n");
  const cta = getResultCtaCopy(result);
  const optionTitles = getRecommendationOptionTitles(result);
  const { profile, presentation } = result;
  const openZalo = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {}
    window.location.href = contactUrl;
  };
  return (
    <section className="quiz-result" aria-labelledby="recommendation-title">
      <div className="result-hero">
        <div>
          <p className="quiz-eyebrow">Gợi ý dành cho bạn</p>
          <h1 id="recommendation-title">{getRecommendationTitle(result)}</h1>
          <p className="result-lead">{presentation.explanation}</p>
          <div className="result-specs">
            <div>
              <span>RAM tối thiểu</span>
              <strong>{profile.technical.minimumRamGb}GB</strong>
            </div>
            <div>
              <span>Lưu trữ</span>
              <strong>{presentation.storageGuidance}</strong>
            </div>
          </div>
        </div>
        <QuizIllustration
          src={resultIllustration(presentation)}
          alt={`Gợi ý ${presentation.title} từ MBMC`}
          className="result-hero-image"
          sizes="(max-width: 720px) calc(100vw - 2rem), 34vw"
        />
      </div>
      {!profile.family.preferred && (
        <section className="family-preference">
          <p className="quiz-eyebrow">Air hay Pro đều phù hợp</p>
          <p>
            Chọn Air nếu bạn thích máy mỏng, tối giản và không quan tâm Touch
            Bar.
          </p>
          <p>
            Chọn Pro nếu bạn thích Touch Bar hoặc muốn có quạt khi chạy tải lâu.
          </p>
        </section>
      )}
      {profile.financial.status === "conflict" && (
        <aside className="quiz-warning">
          <strong>Ngân sách cần được cân lại</strong>
          <p>
            Yêu cầu kỹ thuật vẫn được giữ nguyên; ngân sách chỉ được đánh giá
            sau khi có một máy và mức giá cụ thể.
          </p>
        </aside>
      )}
      {profile.verification.required && (
        <aside className="quiz-warning">
          <strong>Kết quả này còn sơ bộ</strong>
          <p>{profile.verification.reasons.join(" ")}</p>
        </aside>
      )}
      <div className="recommendation-reasons">
        <p className="quiz-eyebrow">Vì sao MBMC gợi ý như vậy</p>
        <ul>
          {presentation.reasons.map((reason) => {
            const [answer, conclusion] = reason.split("\n");
            return (
              <li key={reason}>
                <span>{answer}</span>
                <strong>{conclusion}</strong>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="recommendation-options">
        <Option title={optionTitles.bestFit} option={presentation.bestFit} />
        {presentation.alternative && (
          <Option
            title={optionTitles.alternative}
            option={presentation.alternative}
          />
        )}
        {presentation.upgrade && (
          <Option title={optionTitles.upgrade} option={presentation.upgrade} />
        )}
      </div>
      <InventoryMatchSection state={inventoryState} />
      {inventoryState?.status === "empty" && (
        <section className="family-preference">
          <p className="quiz-eyebrow">Chưa có máy phù hợp đang sẵn tại MBMC.</p>
          <p>
            MBMC có thể ghi nhận nhu cầu này và liên hệ khi tìm được máy phù
            hợp.
          </p>
          {capturingDemand ? (
            <DemandCaptureForm
              sourceRoute="chon_macbook"
              referralEvidence={referralEvidence}
              requirementSnapshot={{
                schemaVersion: REQUIREMENT_SNAPSHOT_SCHEMA,
                recommendationContractVersion: "chon-macbook.v1",
                normalizedQuizAnswers: answers,
                recommendationProfile: result.profile,
              }}
              inventoryContextSnapshot={{
                schemaVersion: INVENTORY_CONTEXT_SCHEMA,
                sourceRoute: "chon_macbook",
                capturedAt: new Date().toISOString(),
                matcherState: "empty",
              }}
              onCancel={() => setCapturingDemand(false)}
            />
          ) : (
            <button
              className="quiz-primary"
              type="button"
              onClick={() => setCapturingDemand(true)}
            >
              Báo mình khi có máy phù hợp
            </button>
          )}
        </section>
      )}
      <div className="result-actions">
        {cta.primaryDestination === "inventory" ? (
          <Link className="quiz-primary" href="/may-dang-co">
            {cta.primary}
          </Link>
        ) : (
          <button className="quiz-primary" type="button" onClick={openZalo}>
            {cta.primary}
          </button>
        )}
        {cta.secondary && (
          <button className="quiz-secondary" type="button" onClick={openZalo}>
            {cta.secondary}
          </button>
        )}
      </div>
      <details className="zalo-summary">
        <summary>Xem nội dung tóm tắt gửi cho MBMC</summary>
        <pre>{summary}</pre>
      </details>
      <button className="quiz-text-action" type="button" onClick={onRestart}>
        Làm lại từ đầu
      </button>
    </section>
  );
}
