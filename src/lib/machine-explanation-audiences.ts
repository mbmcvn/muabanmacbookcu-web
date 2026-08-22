export const MACHINE_EXPLANATION_AUDIENCES = {
  general: {
    label: "Phổ thông",
    description:
      "Làm văn phòng, Office, học tập cơ bản, lướt web, xem YouTube, Zalo và các tác vụ hằng ngày.",
  },
  developer: {
    label: "Lập trình",
    description:
      "IDE, trình duyệt nhiều tab, terminal, local development và các workflow lập trình phổ biến.",
  },
  creative: {
    label: "Sáng tạo",
    description:
      "Canva, CapCut, chỉnh ảnh/video và các project sáng tạo ở mức vừa phải; workload nặng hơn có thể cần cấu hình cao hơn.",
  },
  heavy: {
    label: "Tác vụ nặng",
    description:
      "Các workload kéo dài hoặc dùng nhiều tài nguyên, như dựng video nặng, project lớn và đa nhiệm nặng.",
  },
  storage_heavy: {
    label: "Lưu trữ nhiều",
    description:
      "Thường xuyên giữ nhiều file, media hoặc project trực tiếp trên máy và cần nhiều dung lượng lưu trữ cục bộ.",
  },
} as const;
