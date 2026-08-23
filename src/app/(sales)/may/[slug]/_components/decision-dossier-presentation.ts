import type { PublicMachineDetailV2 } from "@/models";

export function buildPublicLimitations(
  machine: PublicMachineDetailV2,
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
