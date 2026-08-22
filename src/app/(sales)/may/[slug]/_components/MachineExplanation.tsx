import type { PublicMachineExplanationV0 } from "@/models";
import { presentMachineExplanation } from "./machine-explanation-presentation";

export function MachineExplanation({
  explanation,
}: {
  explanation: PublicMachineExplanationV0 | undefined;
}) {
  const presentation = presentMachineExplanation(explanation);
  if (!presentation) return null;

  return (
    <section
      className="detail-section machine-explanation"
      aria-labelledby="machine-explanation-heading"
    >
      <header>
        <p className="eyebrow">
          Đánh giá theo nhu cầu: {presentation.audienceLabel}
        </p>
        <p className="machine-explanation__audience-description">
          {presentation.audienceDescription}
        </p>
        <h2 id="machine-explanation-heading">
          MBMC giải thích về chiếc máy này
        </h2>
      </header>
      <ol className="machine-explanation__blocks">
        {presentation.blocks.map((block, index) => (
          <li key={`${block.domainLabel}-${index}`}>
            <p className="machine-explanation__domain">{block.domainLabel}</p>
            <p>{block.text}</p>
          </li>
        ))}
      </ol>
      {presentation.notes.length ? (
        <aside
          className="machine-explanation__notes"
          aria-label="Thông tin cần biết"
        >
          <h3>Thông tin cần biết</h3>
          <ul>
            {presentation.notes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </aside>
      ) : null}
    </section>
  );
}
