import type { Choice } from "./quiz-questions";
import { quizIllustrations } from "./_lib/quiz-illustrations";
import { QuizIllustration } from "./QuizIllustration";

export function QuestionCard({ choices, selected, multiple = false, illustrated = false, onSelect }: {
  choices: Choice[]; selected: string[]; multiple?: boolean; illustrated?: boolean; onSelect: (value: string) => void;
}) {
  return (
    <div className={`quiz-options${illustrated ? " quiz-options-illustrated" : ""}`} role={multiple ? "group" : "radiogroup"}>
      {choices.map((choice) => {
        const active = selected.includes(choice.value);
        const illustration = choice.value === "frequent"
          ? quizIllustrations.portability.frequent
          : choice.value === "stationary"
            ? quizIllustrations.portability.stationary
            : undefined;
        return (
          <button
            type="button" className="quiz-option" key={choice.value}
            role={multiple ? undefined : "radio"} aria-checked={multiple ? undefined : active}
            aria-pressed={multiple ? active : undefined} data-selected={active}
            onClick={() => onSelect(choice.value)}
          >
            {illustrated && illustration && (
              <QuizIllustration
                className="quiz-option-image"
                src={illustration}
                alt={choice.value === "frequent" ? "Mang MacBook theo khi di chuyển hàng ngày" : "Dùng MacBook tại không gian làm việc cố định"}
                sizes="(max-width: 600px) calc(100vw - 4rem), 22rem"
              />
            )}
            <span className="quiz-option-marker" aria-hidden="true">{active ? "✓" : ""}</span>
            <span><strong>{choice.label}</strong>{choice.detail && <small>{choice.detail}</small>}</span>
          </button>
        );
      })}
    </div>
  );
}
