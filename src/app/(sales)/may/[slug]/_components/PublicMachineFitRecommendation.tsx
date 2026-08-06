import type { PublicMachineDetailV1 } from "@/models";
import {
  buildMachineFitRecommendation,
  hasMachineFitRecommendation,
  type FitStatement,
  type MachineFitRecommendation,
} from "@/lib/public-machine-fit-recommendation";

export function fitRecommendationForMachine(machine: PublicMachineDetailV1) {
  return buildMachineFitRecommendation({
    ramGb: machine.summary.ramGb,
    ssdGb: machine.summary.ssdGb,
    manualSuitable: machine.suitableFor,
    manualCaution: machine.notSuitableFor,
  });
}

function recommendationHeading(recommendation: MachineFitRecommendation): string {
  if (recommendation.suitable.length && recommendation.caution.length) {
    return "Cấu hình này phù hợp với ai?";
  }
  if (recommendation.suitable.length) return "Cấu hình này phù hợp nếu bạn";
  return "Điểm cần cân nhắc với cấu hình này";
}

function FitGroup({ kind, statements }: { kind: "suitable" | "caution"; statements: FitStatement[] }) {
  if (!statements.length) return null;
  const label = kind === "suitable" ? "Điểm phù hợp" : "Điểm cần cân nhắc";
  return <section className={`machine-fit-recommendation__group machine-fit-recommendation__group--${kind}`} aria-label={label}><ul>{statements.map((statement) => <li key={statement.id}><span className="machine-fit-recommendation__icon" aria-hidden="true">{kind === "suitable" ? "✓" : "→"}</span><span>{statement.text}</span></li>)}</ul></section>;
}

export function PublicMachineFitRecommendation({ machine }: { machine: PublicMachineDetailV1 }) {
  const recommendation = fitRecommendationForMachine(machine);
  if (!hasMachineFitRecommendation(recommendation)) return null;
  const hasBothGroups = recommendation.suitable.length > 0 && recommendation.caution.length > 0;

  return <section className={`detail-section machine-fit-recommendation${hasBothGroups ? " machine-fit-recommendation--split" : ""}`} aria-labelledby="machine-fit-heading">
    <header><p className="eyebrow">MBMC ĐÁNH GIÁ CẤU HÌNH</p><h2 id="machine-fit-heading">{recommendationHeading(recommendation)}</h2></header>
    <div className="machine-fit-recommendation__groups">
      <FitGroup kind="suitable" statements={recommendation.suitable} />
      <FitGroup kind="caution" statements={recommendation.caution} />
    </div>
  </section>;
}
