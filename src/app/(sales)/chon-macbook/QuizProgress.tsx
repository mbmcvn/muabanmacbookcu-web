export function QuizProgress({ completed }: { completed: number }) {
  return (
    <div className="quiz-progress" aria-label={`Đã hoàn thành ${completed}%`}>
      <div className="quiz-progress-label"><span>Hồ sơ nhu cầu</span><span>{completed}%</span></div>
      <div className="quiz-progress-track"><span style={{ width: `${completed}%` }} /></div>
    </div>
  );
}
