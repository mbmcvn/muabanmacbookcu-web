import type { MachineAvailability as Availability } from "@/models";
import { formatMachineAvailability } from "@/lib/presentation";

export function MachineAvailability({ availability }: { availability: Availability }) { return <p>{formatMachineAvailability(availability)}</p>; }
