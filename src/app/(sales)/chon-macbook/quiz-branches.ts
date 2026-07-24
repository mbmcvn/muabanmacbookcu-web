import type { DesignWorkload, DevelopmentWorkload, SpecializedWorkload, VideoWorkload } from "./quiz-types";

export interface BranchChoice<T extends string> {
  value: T;
  label: string;
  detail: string;
}

export const videoBranch = {
  prompt: "Chọn mức gần với công việc bạn làm thường xuyên nhất.",
  support: "Nếu chỉ thỉnh thoảng mới làm nặng, hãy chọn mức bạn dùng hằng ngày.",
  choices: [
    { value: "short_social", label: "Canva, CapCut, TikTok, Reel", detail: "Video ngắn, chỉnh sửa cơ bản." },
    { value: "long_high_quality", label: "Dựng video dài hoặc 4K", detail: "Video dài, nhiều layer hoặc hiệu ứng." },
  ] satisfies BranchChoice<VideoWorkload>[],
};

export const designBranch = {
  prompt: "Chọn mức gần với công việc bạn làm thường xuyên nhất.",
  support: "Nếu chỉ thỉnh thoảng mới làm nặng, hãy chọn mức bạn dùng hằng ngày.",
  choices: [
    { value: "light", label: "Canva, Figma, chỉnh ảnh cơ bản", detail: "Thiết kế nhẹ, tệp vừa." },
    { value: "professional", label: "Photoshop file lớn, nhiều layer hoặc làm chuyên nghiệp", detail: "Tệp lớn, nhiều lớp hoặc dự án chuyên sâu." },
  ] satisfies BranchChoice<DesignWorkload>[],
};

export const developmentBranch = {
  prompt: "Bạn thường lập trình ở mức nào?",
  choices: [
    {
      value: "development_basic",
      label: "Code và chạy project cơ bản",
      detail: "Web/app cơ bản, ít service, không dùng Docker hay máy ảo thường xuyên.",
    },
    {
      value: "development_heavy",
      label: "Docker, máy ảo hoặc nhiều service cùng lúc",
      detail: "Chạy nhiều môi trường, backend/service hoặc workflow kỹ thuật nặng hơn.",
    },
  ] satisfies BranchChoice<DevelopmentWorkload>[],
};

export const specializedBranch = {
  prompt: "Phần mềm của bạn thuộc mức nào?",
  choices: [
    {
      value: "specialized_basic",
      label: "Phần mềm tương đối cơ bản hoặc chưa quá nặng",
      detail: "Tác vụ vừa phải, chưa chắc cần cấu hình cao.",
    },
    {
      value: "specialized_heavy",
      label: "Phần mềm nặng, chuyên sâu hoặc cần xác minh kỹ",
      detail: "Mô hình lớn, project phức tạp hoặc cần MBMC kiểm tra kỹ khả năng tương thích.",
    },
  ] satisfies BranchChoice<SpecializedWorkload>[],
};
