import type { PublicMachineCard } from "@/models";
import { MachineCard } from "./MachineCard";

export function MachineCatalog({ machines }: { machines: PublicMachineCard[] }) {
  return <section className="machine-catalog" aria-label="Danh sách máy">{machines.map((machine) => <MachineCard key={machine.slug} machine={machine} />)}</section>;
}
