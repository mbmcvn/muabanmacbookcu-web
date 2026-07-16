import type { MachineDetail } from "@/models";
import { MachineAvailability } from "./MachineAvailability";
import { MachinePrice } from "./MachinePrice";

export function MachineSummary({ machine }: { machine: MachineDetail }) { return <header className="section"><h1>{machine.displayName}</h1><MachineAvailability availability={machine.availability} /><MachinePrice price={machine.price} /></header>; }
