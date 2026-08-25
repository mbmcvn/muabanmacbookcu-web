import Image from "next/image";
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
        <p>
          Dựa trên cấu hình của máy và các tác vụ phổ biến, đây là những nhóm
          nhu cầu phù hợp nhất.
        </p>
      </header>
      <ul className="suitable-audience-grid">
        {presentation.map((audience) => (
          <li className="suitable-audience-card" key={audience.code}>
            <div className="suitable-audience-card__visual">
              <Image
                src={audience.imageSrc}
                alt={audience.imageAlt}
                width={1448}
                height={1086}
                sizes="(min-width: 56rem) 19rem, (min-width: 40rem) 45vw, 100vw"
              />
            </div>
            <header className="suitable-audience-card__heading">
              <h3>{audience.title}</h3>
              <span className="suitable-audience-card__badge">Phù hợp</span>
            </header>
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
