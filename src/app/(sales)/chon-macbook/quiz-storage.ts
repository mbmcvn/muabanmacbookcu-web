import { EMPTY_ANSWERS, type QuizAnswers } from "./quiz-types";
import { normalizeStoredAnswers } from "./quiz-state";
import { getQuestionFlow } from "./quiz-questions";

const STORAGE_KEY = "mbmc:chon-macbook:v1";

export interface StoredQuiz { started: boolean; questionIndex: number; answers: QuizAnswers }

export function loadQuiz(): StoredQuiz | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as StoredQuiz;
    if (!parsed.answers || !Array.isArray(parsed.answers.uses)) return null;
    const answers = normalizeStoredAnswers(parsed.answers);
    const maxIndex = Math.max(0, getQuestionFlow(answers).length - 1);
    const questionIndex = Number.isInteger(parsed.questionIndex)
      ? Math.min(Math.max(0, parsed.questionIndex), maxIndex)
      : 0;
    return { started: parsed.started === true, questionIndex, answers };
  } catch { return null; }
}

export function saveQuiz(value: StoredQuiz): void {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch {}
}

export function clearQuiz(): void {
  try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function freshAnswers(): QuizAnswers {
  return { ...EMPTY_ANSWERS, uses: [] };
}
