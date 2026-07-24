import type { DesignWorkload, MainUse, Recommendation, VideoWorkload } from "../quiz-types";

export const quizIllustrations = {
  intro: {
    hero: "/images/chon-macbook/intro/intro-hero.webp",
  },
  usage: {
    office: "/images/chon-macbook/main-usage/office-study-sales.webp",
    design: "/images/chon-macbook/main-usage/design-image.webp",
    video: "/images/chon-macbook/main-usage/video-content.webp",
    development: "/images/chon-macbook/main-usage/development.webp",
    specialized: "/images/chon-macbook/main-usage/specialized-software.webp",
    personal: "/images/chon-macbook/main-usage/personal-entertainment.webp",
  },
  branches: {
    designLight: "/images/chon-macbook/branches/design-light.webp",
    designProfessional: "/images/chon-macbook/branches/design-pro.webp",
    videoShortSocial: "/images/chon-macbook/branches/video-light.webp",
    videoLongHighQuality: "/images/chon-macbook/branches/video-heavy.webp",
  },
  portability: {
    frequent: "/images/chon-macbook/portability/daily-portable.webp",
    stationary: "/images/chon-macbook/portability/stationary-large-screen.webp",
  },
  results: {
    air13: "/images/chon-macbook/result-states/air-13.webp",
    air15: "/images/chon-macbook/result-states/air-15.webp",
    pro14: "/images/chon-macbook/result-states/pro-14.webp",
    pro16: "/images/chon-macbook/result-states/pro-16.webp",
  },
} as const;

export type UsageIllustrationKey = Exclude<MainUse, "unclear">;

export const usageIllustrationAlt: Record<UsageIllustrationKey, string> = {
  office: "Không gian học tập và làm việc văn phòng với MacBook",
  design: "Công việc thiết kế hình ảnh trên MacBook",
  video: "Dựng video và sáng tạo nội dung trên MacBook",
  development: "Lập trình và làm việc công nghệ trên MacBook",
  specialized: "Công việc kỹ thuật và phần mềm chuyên ngành trên MacBook",
  personal: "Sử dụng MacBook cho nhu cầu cá nhân và giải trí",
};

export function usageIllustration(use?: MainUse) {
  if (!use || use === "unclear") {
    return { src: quizIllustrations.intro.hero, alt: "MacBook trong không gian làm việc gần gũi của MBMC" };
  }
  return { src: quizIllustrations.usage[use], alt: usageIllustrationAlt[use] };
}

export function branchIllustration(kind: "video", value: VideoWorkload): string | undefined;
export function branchIllustration(kind: "design", value: DesignWorkload): string | undefined;
export function branchIllustration(kind: "video" | "design", value: VideoWorkload | DesignWorkload): string | undefined {
  if (kind === "video") {
    if (value === "short_social") return quizIllustrations.branches.videoShortSocial;
    return quizIllustrations.branches.videoLongHighQuality;
  }
  if (value === "light") return quizIllustrations.branches.designLight;
  return quizIllustrations.branches.designProfessional;
}

export function resultIllustration(result: Pick<Recommendation, "family" | "size">): string {
  if (result.family === "MacBook Air") {
    return result.size === "15 inch" ? quizIllustrations.results.air15 : quizIllustrations.results.air13;
  }
  // The approved asset set has no Pro 13 image yet; Pro 14 is the closest neutral Pro fallback.
  return result.size === "16 inch" ? quizIllustrations.results.pro16 : quizIllustrations.results.pro14;
}
