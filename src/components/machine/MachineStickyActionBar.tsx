import type { ContactChannel, MachineDetail } from "@/models";
import { formatCurrencyVnd } from "@/lib/presentation";

export function MachineStickyActionBar({
  machine,
  primaryChannel,
}: {
  machine: MachineDetail;
  primaryChannel: ContactChannel;
}) {
  return (
    <aside className="machine-sticky-action" aria-label="Liên hệ về máy này">
      <span>{machine.displayName}</span>
      <strong>{formatCurrencyVnd(machine.price)}</strong>
      <a href={primaryChannel.href}>{primaryChannel.label}</a>
    </aside>
  );
}
