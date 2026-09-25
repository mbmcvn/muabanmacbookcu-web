import type { PublicMachineSummaryV2 } from "@/models";
import { MachineCard } from "./MachineCard";

export function MachineCatalog({ machines }: { machines: PublicMachineSummaryV2[] }) {
  return <section className="machine-catalog" aria-label="Danh sách máy">{machines.map((machine) => <MachineCard key={machine.slug} machine={machine} />)}</section>;
}
