import type { PublicSuitableAudienceV0 } from "@/models";
import { presentSuitableAudiences } from "./machine-suitable-audiences-presentation";

export function MachineSuitableAudiences({
  audiences,
}: {
  audiences: readonly PublicSuitableAudienceV0[] | undefined;
}) {
  const presentation = presentSuitableAudiences(audiences);
  if (presentation.length === 0) return null;

  return (
    <section
      className="detail-section machine-suitable-audiences"
      aria-labelledby="machine-suitable-audiences-heading"
    >
      <header>
        <h2 id="machine-suitable-audiences-heading">
          Phù hợp với nhu cầu nào?
        </h2>
      </header>
      <ul>
        {presentation.map((audience) => (
          <li key={audience.code}>
            <h3>{audience.label}</h3>
            <p>{audience.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
