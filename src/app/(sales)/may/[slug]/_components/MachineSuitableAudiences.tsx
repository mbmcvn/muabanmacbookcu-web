import type { PublicSuitableAudienceV0 } from "@/models";
import { presentSuitableAudiences } from "./machine-suitable-audiences-presentation";

function SuitableAudienceIcon({ code }: { code: PublicSuitableAudienceV0 }) {
  const path = {
    general: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    developer: <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />,
    creative: (
      <>
        <path d="m15 4 5 5L9 20H4v-5Z" />
        <path d="m13 6 5 5M6 14l4 4M5 3v4M3 5h4M19 16v5M16.5 18.5h5" />
      </>
    ),
    heavy: (
      <>
        <path d="M4 18a8 8 0 1 1 16 0" />
        <path d="m12 14 4-4M7 18h10" />
      </>
    ),
    storage_heavy: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
      </>
    ),
  } satisfies Record<PublicSuitableAudienceV0, React.ReactNode>;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path[code]}
    </svg>
  );
}

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
        <p>
          Dựa trên cấu hình của máy và các tác vụ phổ biến, đây là những nhóm
          nhu cầu phù hợp nhất.
        </p>
      </header>
      <ul className="suitable-audience-grid">
        {presentation.map((audience) => (
          <li className="suitable-audience-card" key={audience.code}>
            <div className="suitable-audience-card__heading">
              <div className="suitable-audience-card__icon">
                <SuitableAudienceIcon code={audience.code} />
              </div>
              <div className="suitable-audience-card__heading-copy">
                <h3>{audience.title}</h3>
                <span className="suitable-audience-card__badge">Phù hợp</span>
              </div>
            </div>
            <p className="suitable-audience-card__intro">{audience.intro}</p>
            <ul className="suitable-audience-card__checklist">
              {audience.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="suitable-audience-card__footer">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="10" cy="10" r="7" />
                <path d="m7 10 2 2 4-4" />
              </svg>
              <span>{audience.footer}</span>
            </p>
          </li>
        ))}
      </ul>
      <div className="suitable-audience-note" role="note">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="7.25" />
          <path d="M10 9v4M10 6.5h.01" />
        </svg>
        <div>
          <strong>Lưu ý</strong>
          <p>
            Trải nghiệm còn phụ thuộc vào phần mềm, workflow và nhu cầu cụ thể
            của bạn.
          </p>
        </div>
      </div>
    </section>
  );
}
