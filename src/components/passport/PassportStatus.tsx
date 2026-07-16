import type { PassportStatus as PassportStatusModel } from "@/models";
import { formatMachineAvailability, formatPublicDate } from "@/lib/presentation";

export function PassportStatus({ status }: { status: PassportStatusModel }) {
  return (
    <section>
      <h3>Trạng thái</h3>
      <p>{formatMachineAvailability(status.availability)}</p>
      <p>Xác minh ngày {formatPublicDate(status.verifiedAt)}</p>
    </section>
  );
}
