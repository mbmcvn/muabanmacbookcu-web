import type { PublicSuitableAudienceV0 } from "@/models";

export type SuitableAudiencePresentation = {
  code: PublicSuitableAudienceV0;
  title: string;
  imageSrc: string;
  imageAlt: string;
  intro: string;
  checklist: readonly string[];
  footer: string;
};

const SUITABLE_AUDIENCE_CARDS = {
  general: {
    title: "Phổ thông – Văn phòng",
    imageSrc: "/images/suitability/01-pho-thong-native-icons.png",
    imageAlt: "Minh hoạ các ứng dụng văn phòng và nhu cầu sử dụng hằng ngày",
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
    imageSrc: "/images/suitability/02-lap-trinh-native-icons.png",
    imageAlt: "Minh hoạ bộ công cụ dành cho lập trình viên",
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
    imageSrc: "/images/suitability/03-sang-tao-native-icons.png",
    imageAlt: "Minh hoạ các ứng dụng sáng tạo và sản xuất nội dung",
    intro: "Phù hợp với sáng tạo nội dung ở mức cơ bản đến vừa.",
    checklist: ["Canva, Figma", "Chỉnh sửa ảnh", "Edit video ngắn"],
    footer: "Phù hợp với creator bán chuyên.",
  },
  heavy: {
    title: "Tác vụ nặng",
    imageSrc: "/images/suitability/04-tac-vu-nang-native-icons.png",
    imageAlt: "Minh hoạ các công cụ cho tác vụ cần nhiều tài nguyên",
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
    imageSrc: "/images/suitability/05-luu-tru-nhieu-native-icons.png",
    imageAlt: "Minh hoạ nhu cầu lưu trữ nhiều tệp và dự án trên máy",
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
