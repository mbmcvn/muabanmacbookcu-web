import type { PublicSuitableAudienceV0 } from "@/models";

export type SuitableAudiencePresentation = {
  code: PublicSuitableAudienceV0;
  title: string;
  intro: string;
  checklist: readonly string[];
  footer: string;
};

const SUITABLE_AUDIENCE_CARDS = {
  general: {
    title: "Phổ thông – Văn phòng",
    intro: "Phù hợp cho công việc, học tập và các tác vụ hằng ngày.",
    checklist: [
      "Office, Google Workspace",
      "Học tập, web, họp online",
      "Xem phim, nghe nhạc",
    ],
    footer: "Hiệu năng dư dả cho nhu cầu hằng ngày.",
  },
  developer: {
    title: "Lập trình – Developer",
    intro: "Phù hợp với các workflow lập trình phổ biến.",
    checklist: [
      "VS Code, IntelliJ, WebStorm",
      "Git, Terminal, SSH",
      "Frontend & backend phổ biến",
    ],
    footer: "Phù hợp với workflow lập trình phổ biến.",
  },
  creative: {
    title: "Sáng tạo – Nội dung",
    intro: "Phù hợp với sáng tạo nội dung ở mức cơ bản đến vừa.",
    checklist: [
      "Canva, Figma",
      "Chỉnh sửa ảnh",
      "Edit video ngắn",
    ],
    footer: "Phù hợp với creator bán chuyên.",
  },
  heavy: {
    title: "Tác vụ nặng",
    intro: "Phù hợp với workload kéo dài hoặc cần nhiều tài nguyên hơn.",
    checklist: [
      "Workflow đa nhiệm nặng",
      "Project yêu cầu tài nguyên cao",
      "Khối lượng công việc kéo dài",
    ],
    footer: "Dành cho nhu cầu cần nhiều tài nguyên hơn.",
  },
  storage_heavy: {
    title: "Lưu trữ nhiều",
    intro:
      "Phù hợp khi thường xuyên lưu nhiều file và project trực tiếp trên máy.",
    checklist: [
      "Thư viện ảnh và video lớn",
      "Project có nhiều tài nguyên",
      "Nhu cầu lưu trữ cục bộ thường xuyên",
    ],
    footer: "Phù hợp khi dung lượng lưu trữ là ưu tiên.",
  },
} as const satisfies Record<
  PublicSuitableAudienceV0,
  Omit<SuitableAudiencePresentation, "code">
>;

export function presentSuitableAudiences(
  audiences: readonly PublicSuitableAudienceV0[] | undefined,
): SuitableAudiencePresentation[] {
  return (audiences ?? []).map((code) => ({
    code,
    ...SUITABLE_AUDIENCE_CARDS[code],
  }));
}
