import type { PublicMachineDetailV1 } from "@/models";

export function hasBalancedSuitability(machine: PublicMachineDetailV1): boolean {
  return machine.suitableFor.length > 0 && machine.notSuitableFor.length > 0;
}

export function buildPublicLimitations(
  machine: PublicMachineDetailV1,
): string[] {
  const limitations: string[] = [];
  if (machine.summary.inspection.status === "not_available") {
    limitations.push("Hồ sơ công khai hiện chưa có kết quả kiểm định.");
  }
  if (machine.summary.warranty.status === "unknown") {
    limitations.push(
      "Hồ sơ công khai hiện chưa có thông tin bảo hành đã được xác định.",
    );
  }
  if (machine.passport.sourceVerification === "unknown") {
    limitations.push(
      "Hồ sơ công khai hiện chưa có dữ liệu xác minh nguồn gốc.",
    );
  }
  if (machine.passport.repairStatus === "unknown") {
    limitations.push(
      "Hồ sơ công khai hiện chưa có kết luận về tình trạng sửa chữa.",
    );
  }
  return limitations;
}
