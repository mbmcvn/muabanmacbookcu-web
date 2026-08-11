"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { choices, getQuestionFlow, questionCopy, type Choice } from "./quiz-questions";
import { clearQuiz, freshAnswers, loadQuiz, saveQuiz } from "./quiz-storage";
import { recommendMacBook } from "./recommendation-engine";
import { isUsageAnswerComplete, setComfortBudget, toggleUsageAnswer } from "./quiz-state";
import type { DesignWorkload, DevelopmentWorkload, MainUse, QuestionId, QuizAnswers, SpecializedWorkload, VideoWorkload } from "./quiz-types";
import { QuestionCard } from "./QuestionCard";
import { QuizProgress } from "./QuizProgress";
import { RecommendationView } from "./RecommendationView";
import { UsageQuestion } from "./UsageQuestion";
import { quizIllustrations } from "./_lib/quiz-illustrations";
import { QuizIllustration } from "./QuizIllustration";
import { BudgetQuestion } from "./BudgetQuestion";

type Stage = "intro" | "questions" | "processing" | "result";

function valueFor(answers: QuizAnswers, id: QuestionId): string[] {
  if (id === "uses") return answers.uses;
  if (id === "monthly-payment") return answers.monthlyPayment ? [answers.monthlyPayment] : [];
  const value = answers[id as keyof QuizAnswers];
  return typeof value === "string" ? [value] : [];
}

function optionsFor(id: QuestionId): Choice[] {
  if (id === "monthly-payment") return choices.monthly;
  return choices[id as keyof typeof choices] as Choice[];
}

export function MacBookQuiz() {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<QuizAnswers>(freshAnswers);
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flow = useMemo(() => getQuestionFlow(answers), [answers]);
  const questionId = flow[Math.min(index, flow.length - 1)];
  const completed = stage === "result" ? 100 : Math.round((Math.min(index, flow.length) / flow.length) * 100);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = loadQuiz();
      if (saved) { setAnswers(saved.answers); setIndex(saved.questionIndex); if (saved.started) setStage("questions"); }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (hydrated && (stage === "questions" || stage === "processing")) saveQuiz({ started: true, questionIndex: index, answers });
  }, [answers, hydrated, index, stage]);
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  const finishOrAdvance = (nextAnswers = answers) => {
    if (index >= getQuestionFlow(nextAnswers).length - 1) {
      setStage("processing");
      window.setTimeout(() => setStage("result"), 800);
    } else setIndex((current) => current + 1);
  };
  const selectSingle = (value: string) => {
    const next = { ...answers } as QuizAnswers;
    if (questionId === "monthly-payment") next.monthlyPayment = value as QuizAnswers["monthlyPayment"];
    else if (questionId === "payment") next.payment = value as QuizAnswers["payment"];
    else if (questionId === "budget") next.budget = value as QuizAnswers["budget"];
    else if (questionId === "deposit") next.deposit = value as QuizAnswers["deposit"];
    else if (questionId === "portability") next.portability = value as QuizAnswers["portability"];
    else if (questionId === "screen") next.screen = value as QuizAnswers["screen"];
    else if (questionId === "fulfilment") {
      next.fulfilment = value as QuizAnswers["fulfilment"];
      if (value !== "province") next.province = undefined;
    }
    if (questionId === "payment") {
      if (value === "installment") { next.budget = undefined; next.stretchBudget = undefined; }
      if (value === "full") { next.deposit = undefined; next.monthlyPayment = undefined; }
    }
    setAnswers(next);
    if (questionId === "fulfilment" && value === "province") return;
    advanceTimer.current = setTimeout(() => finishOrAdvance(next), 200);
  };
  const toggleUse = (value: MainUse) => setAnswers((current) => toggleUsageAnswer(current, value));
  const restart = () => { clearQuiz(); setAnswers(freshAnswers()); setIndex(0); setStage("intro"); };

  if (!hydrated) return <div className="quiz-page"><div className="quiz-card quiz-loading" /></div>;
  if (stage === "intro") return (
    <div className="quiz-page quiz-page-intro"><section className="quiz-intro">
      <div className="quiz-intro-copy">
        <p className="quiz-eyebrow">MBMC · Trợ giúp chọn máy</p>
        <h1>Chọn MacBook mà không cần biết về MacBook</h1>
        <p>Bạn chỉ cần cho MBMC biết cách bạn sử dụng máy, khoảng ngân sách và cách bạn muốn mua. Phần cấu hình khó hiểu để MBMC xử lý.</p>
        <button type="button" className="quiz-primary" onClick={() => { setStage("questions"); setIndex(0); }}>Bắt đầu chọn máy</button>
        <small>Khoảng 2 phút · Không cần đăng nhập · Có thể quay lại bất kỳ lúc nào</small>
      </div>
      <QuizIllustration
        className="quiz-intro-illustration"
        src={quizIllustrations.intro.hero}
        alt="MacBook trong không gian làm việc gần gũi của MBMC"
        sizes="(max-width: 720px) calc(100vw - 2rem), 34vw"
        priority
      />
    </section></div>
  );
  if (stage === "processing") return <div className="quiz-page"><section className="quiz-processing" aria-live="polite"><span /><p>MBMC đang nối các câu trả lời thành một gợi ý rõ ràng…</p></section></div>;
  if (stage === "result") return <div className="quiz-page quiz-page-result"><RecommendationView answers={answers} result={recommendMacBook(answers)} onRestart={restart} /></div>;

  const copy = questionCopy[questionId];
  const isUses = questionId === "uses";
  const isBudget = questionId === "budget";
  const needsProvince = questionId === "fulfilment" && answers.fulfilment === "province";
  const canContinue = isUses
    ? isUsageAnswerComplete(answers)
    : isBudget
      ? Boolean(answers.budget && (answers.budget === "unknown" || answers.stretchBudget))
      : needsProvince;
  return (
    <div className={`quiz-page${isUses ? " quiz-page-usage" : ""}`}>
      <div className="quiz-topbar"><button type="button" onClick={() => index > 0 ? setIndex(index - 1) : setStage("intro")}>← Quay lại</button><button type="button" onClick={restart}>Làm lại</button></div>
      <QuizProgress completed={completed} />
      <section className="quiz-card" key={questionId}>
        <p className="quiz-eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1>
        {copy.hint && <p className="quiz-hint">{copy.hint}</p>}
        {isUses ? (
          <UsageQuestion
            answers={answers}
            onToggle={toggleUse}
            onVideoWorkload={(videoWorkload: VideoWorkload) => setAnswers({
              ...answers, videoWorkload,
            })}
            onDesignWorkload={(designWorkload: DesignWorkload) => setAnswers({
              ...answers, designWorkload,
            })}
            onDevelopmentWorkload={(developmentWorkload: DevelopmentWorkload) => setAnswers({ ...answers, developmentWorkload })}
            onSpecializedWorkload={(specializedWorkload: SpecializedWorkload) => setAnswers({ ...answers, specializedWorkload })}
            onSpecializedSoftware={(specializedSoftware: string) => setAnswers({ ...answers, specializedSoftware })}
          />
        ) : isBudget ? (
          <BudgetQuestion
            budget={answers.budget}
            stretchBudget={answers.stretchBudget}
            onBudget={(budget) => setAnswers(setComfortBudget(answers, budget))}
            onStretch={(stretchBudget) => setAnswers({ ...answers, stretchBudget })}
          />
        ) : (
          <QuestionCard choices={optionsFor(questionId)} selected={valueFor(answers, questionId)} illustrated={questionId === "portability"} onSelect={selectSingle} />
        )}
        {needsProvince && <label className="quiz-field">Tỉnh hoặc thành phố (không bắt buộc)<input value={answers.province ?? ""} onChange={(event) => setAnswers({ ...answers, province: event.target.value })} placeholder="Ví dụ: Đà Nẵng" /></label>}
        {isUses || isBudget
          ? <button type="button" className="quiz-primary quiz-continue" disabled={!canContinue} onClick={() => finishOrAdvance()}>Tiếp tục</button>
          : canContinue && <button type="button" className="quiz-primary quiz-continue" onClick={() => finishOrAdvance()}>Tiếp tục</button>}
      </section>
    </div>
  );
}
