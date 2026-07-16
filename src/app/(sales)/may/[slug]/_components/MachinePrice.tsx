import type { Money } from "@/models";
import { formatCurrencyVnd } from "@/lib/presentation";

export function MachinePrice({ price }: { price: Money }) { return <p><strong>{formatCurrencyVnd(price)}</strong></p>; }
