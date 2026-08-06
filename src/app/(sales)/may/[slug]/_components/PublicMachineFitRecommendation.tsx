import type { PublicMachineDetailV1 } from "@/models";
import {
  buildMachineFitRecommendation,
  hasMachineFitRecommendation,
  type FitStatement,
} from "@/lib/public-machine-fit-recommendation";

export function fitRecommendationForMachine(machine: PublicMachineDetailV1) {
  return buildMachineFitRecommendation({
    ramGb: machine.summary.ramGb,
    ssdGb: machine.summary.ssdGb,
    manualSuitable: machine.suitableFor,
    manualCaution: machine.notSuitableFor,
  });
}

function FitGroup({ title, statements }: { title: string; statements: FitStatement[] }) {
  if (!statements.length) return null;
  return <section className="machine-fit-recommendation__group"><h3>{title}</h3><ul>{statements.map((statement) => <li key={statement.id}>{statement.text}</li>)}</ul></section>;
}

export function PublicMachineFitRecommendation({ machine }: { machine: PublicMachineDetailV1 }) {
  const recommendation = fitRecommendationForMachine(machine);
  if (!hasMachineFitRecommendation(recommendation)) return null;

  return <section className="detail-section machine-fit-recommendation" aria-labelledby="machine-fit-heading">
    <header><p className="eyebrow">GỢI Ý PHÙ HỢP</p><h2 id="machine-fit-heading">Chiếc máy này phù hợp với ai?</h2></header>
    <div className="machine-fit-recommendation__groups">
      <FitGroup title="Phù hợp nếu bạn" statements={recommendation.suitable} />
      <FitGroup title="Nên cân nhắc máy khác nếu bạn" statements={recommendation.caution} />
    </div>
  </section>;
}
