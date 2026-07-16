export function imageTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    cover: "Ảnh chính",
    exterior: "Ngoại hình",
    screen: "Màn hình",
    keyboard: "Bàn phím",
    bottom: "Mặt đáy",
    charger: "Sạc",
    defect: "Điểm cần lưu ý",
    other: "Ảnh khác",
  };

  return type ? (labels[type] ?? type) : "Ảnh thực tế";
}
