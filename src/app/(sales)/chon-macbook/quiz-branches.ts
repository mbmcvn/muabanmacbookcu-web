import type { DesignWorkload, DevelopmentWorkload, SpecializedWorkload, VideoWorkload } from "./quiz-types";

export interface BranchChoice<T extends string> {
  value: T;
  label: string;
  detail: string;
}

export const videoBranch = {
  prompt: "Video là việc thỉnh thoảng hay diễn ra thường xuyên?",
  support: "Tần suất giúp phân biệt một dự án 4K hiếm khi làm với việc chỉnh sửa và xuất video kéo dài hằng ngày.",
  choices: [
    { value: "short_social", label: "Canva, CapCut, TikTok, Reel", detail: "Video ngắn, chỉnh sửa cơ bản." },
    { value: "long_rare", label: "Video dài hoặc 4K, khoảng mỗi tháng", detail: "Dự án nặng chỉ xuất hiện hiếm khi." },
    { value: "long_regular", label: "Video dài hoặc 4K hằng tuần", detail: "Chỉnh sửa và xuất video đều đặn, nhưng không kéo dài gần như mỗi ngày." },
    { value: "sustained_daily", label: "Chỉnh sửa, render hoặc xuất video gần như hằng ngày", detail: "Công việc video nặng và kéo dài xuất hiện thường xuyên." },
  ] satisfies BranchChoice<VideoWorkload>[],
};

export const designBranch = {
  prompt: "Chọn mức gần với công việc bạn làm thường xuyên nhất.",
  support: "Nếu chỉ thỉnh thoảng mới làm nặng, hãy chọn mức bạn dùng hằng ngày.",
  choices: [
    { value: "light", label: "Canva, Figma, chỉnh ảnh cơ bản", detail: "Thiết kế nhẹ, tệp vừa." },
    { value: "photoshop_standard", label: "Photoshop thông thường", detail: "Chỉnh sửa thường ngày, tệp không quá lớn hoặc nhiều layer." },
    { value: "professional", label: "Photoshop file lớn, nhiều layer", detail: "Công việc chuyên nghiệp nhưng không chạy tải nặng liên tục." },
    { value: "professional_sustained", label: "Thiết kế nặng và kéo dài thường xuyên", detail: "Dự án chuyên sâu, xuất file hoặc xử lý nặng liên tục." },
  ] satisfies BranchChoice<DesignWorkload>[],
};

export const developmentBranch = {
  prompt: "Bạn thường lập trình ở mức nào?",
  choices: [
    {
      value: "development_basic",
      label: "Code và chạy dự án cơ bản",
      detail: "Web/app cơ bản, ít service, không dùng Docker hay máy ảo thường xuyên.",
    },
    {
      value: "docker_rare",
      label: "Docker hoặc máy ảo nhưng chỉ thỉnh thoảng",
      detail: "Đôi lúc cần thêm môi trường, không phải quy trình làm việc hằng tuần.",
    },
    {
      value: "docker_regular",
      label: "Docker, cơ sở dữ liệu cục bộ hoặc nhiều dịch vụ hằng tuần",
      detail: "Chạy nhiều môi trường đều đặn trong công việc.",
    },
    {
      value: "development_sustained",
      label: "Nhiều container, VM hoặc build gần như hằng ngày",
      detail: "Tải kỹ thuật nặng và kéo dài xuất hiện thường xuyên.",
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
      label: "Phần mềm nặng hoặc dự án phức tạp",
      detail: "Cần RAM cao hơn nhưng chưa đủ dữ kiện để tự chọn Pro.",
    },
    {
      value: "specialized_sustained",
      label: "Phần mềm nặng và chạy tải kéo dài thường xuyên",
      detail: "Dự án phức tạp và tác vụ chuyên môn duy trì lâu.",
    },
  ] satisfies BranchChoice<SpecializedWorkload>[],
};
