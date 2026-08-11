import { choices } from "./quiz-questions";
import type { Budget, StretchBudget } from "./quiz-types";

export function BudgetQuestion({ budget, stretchBudget, onBudget, onStretch }: {
  budget?: Budget;
  stretchBudget?: StretchBudget;
  onBudget: (value: Budget) => void;
  onStretch: (value: StretchBudget) => void;
}) {
  const hasConcreteBudget = Boolean(budget && budget !== "unknown");
  return (
    <div>
      <div className="quiz-options" role="radiogroup" aria-label="Khoảng giá thoải mái">
        {choices.budget.map((choice) => (
          <button
            type="button"
            className="quiz-option"
            role="radio"
            aria-checked={budget === choice.value}
            data-selected={budget === choice.value}
            key={choice.value}
            onClick={() => onBudget(choice.value as Budget)}
          >
            <span className="quiz-option-marker" aria-hidden="true">{budget === choice.value ? "✓" : ""}</span>
            <span><strong>{choice.label}</strong></span>
          </button>
        ))}
      </div>
      {hasConcreteBudget && (
        <div className="usage-branch">
          <p>Nếu có lựa chọn đáng tiền hơn rõ rệt, bạn có thể cố thêm không?</p>
          <small className="usage-branch-support">Chỉ để hiểu khoảng giá bạn có thể cân nhắc, không làm thay đổi cấu hình phù hợp.</small>
          <div className="usage-branch-options" role="radiogroup" aria-label="Khoảng giá có thể cố thêm">
            {choices.stretch.map((choice) => (
              <button
                type="button"
                className="usage-branch-option"
                role="radio"
                aria-checked={stretchBudget === choice.value}
                data-selected={stretchBudget === choice.value}
                key={choice.value}
                onClick={() => onStretch(choice.value as StretchBudget)}
              >
                <strong>{choice.label}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
