import type {
  DesignWorkload,
  DevelopmentWorkload,
  MainUse,
  QuizAnswers,
  Recommendation,
  RecommendationOption,
  SpecializedWorkload,
  VideoWorkload,
} from "./quiz-types";

export const USE_LABELS: Record<MainUse, string> = {
  office: "Học tập, văn phòng, bán hàng",
  design: "Thiết kế hình ảnh",
  video: "Dựng video, làm nội dung",
  development: "Lập trình, công nghệ",
  specialized: "Kỹ thuật, kiến trúc, phần mềm chuyên ngành",
  personal: "Dùng cá nhân, giải trí",
  unclear: "Một chiếc máy dùng ổn định lâu dài",
};

export const VIDEO_LABELS: Record<VideoWorkload, string> = {
  short_social: "Nội dung ngắn bằng Canva, CapCut, TikTok hoặc Reel",
  long_high_quality: "Video dài hoặc 4K",
};

export const DESIGN_LABELS: Record<DesignWorkload, string> = {
  light: "Canva, Figma hoặc chỉnh ảnh cơ bản",
  professional: "Photoshop file lớn, nhiều layer hoặc thiết kế chuyên nghiệp",
};

export const DEVELOPMENT_LABELS: Record<DevelopmentWorkload, string> = {
  development_basic: "Code và chạy project cơ bản",
  development_heavy: "Docker, máy ảo hoặc nhiều service cùng lúc",
};

export const SPECIALIZED_LABELS: Record<SpecializedWorkload, string> = {
  specialized_basic: "Phần mềm tương đối cơ bản hoặc chưa quá nặng",
  specialized_heavy: "Phần mềm nặng, chuyên sâu hoặc cần xác minh kỹ",
};

function option(label: string, configuration: string, note: string): RecommendationOption {
  return { label, configuration, note };
}

function formatUseSummary(answers: QuizAnswers): string {
  return answers.uses.map((use) => {
    if (use === "video" && answers.videoWorkload) return VIDEO_LABELS[answers.videoWorkload];
    if (use === "design" && answers.designWorkload) return DESIGN_LABELS[answers.designWorkload];
    if (use === "development" && answers.developmentWorkload) return DEVELOPMENT_LABELS[answers.developmentWorkload];
    if (use === "specialized" && answers.specializedWorkload) return SPECIALIZED_LABELS[answers.specializedWorkload];
    return USE_LABELS[use];
  }).join("; ") || "Chưa xác định rõ";
}

export function recommendMacBook(answers: QuizAnswers): Recommendation {
  const longVideo = answers.uses.includes("video") && answers.videoWorkload === "long_high_quality";
  const professionalDesign = answers.uses.includes("design") && answers.designWorkload === "professional";
  const heavyDevelopment = answers.uses.includes("development") && answers.developmentWorkload === "development_heavy";
  const heavySpecialized = answers.uses.includes("specialized") && answers.specializedWorkload === "specialized_heavy";
  const sustainedHeavy = heavyDevelopment || heavySpecialized;
  const minimumRam: 8 | 16 = longVideo || professionalDesign || heavyDevelopment || heavySpecialized ? 16 : 8;
  const preferredStorage: "256GB" | "512GB" = longVideo || professionalDesign ? "512GB" : "256GB";
  const storageGuidance = longVideo
    ? "512GB nên ưu tiên"
    : professionalDesign
      ? "512GB đáng cân nhắc"
      : "256GB là đủ";
  const storageConfiguration = preferredStorage === "512GB" ? "512GB SSD" : "256GB SSD";
  const wantsLarge = answers.screen === "large" && answers.portability === "stationary";
  const strongPortability = answers.portability === "frequent" && answers.screen === "compact";
  const productFamilyFit: Recommendation["productFamilyFit"] = sustainedHeavy
    ? "pro_preferred"
    : wantsLarge || strongPortability
      ? "air_preferred"
      : "air_or_pro";
  const family: Recommendation["family"] = productFamilyFit === "pro_preferred" ? "MacBook Pro" : "MacBook Air";
  const size: Recommendation["size"] = family === "MacBook Air"
    ? (wantsLarge ? "15 inch" : "13 inch")
    : (wantsLarge ? "14 inch" : "13 inch");
  const productName = `${family} ${size}`;
  const model: Recommendation["model"] = family === "MacBook Air"
    ? (size === "15 inch" ? "air-15" : "air-13")
    : size === "14 inch"
      ? "pro-14"
      : "pro-13";
  const needsVerification = heavySpecialized || Boolean(answers.specializedSoftware?.trim());
  const lowBudget = answers.budget === "under-12" || answers.budget === "12-16";
  const budgetConflict = lowBudget && (family === "MacBook Pro" || minimumRam === 16);

  const reasons: string[] = [];
  if (longVideo) {
    reasons.push("Video dài hoặc 4K, nhiều layer.\n→ 16GB RAM là mức khởi đầu hợp lý.");
  } else if (professionalDesign) {
    reasons.push("Photoshop file lớn và nhiều layer.\n→ 16GB RAM là mức khởi đầu an toàn.");
  } else if (heavyDevelopment) {
    reasons.push("Docker, máy ảo hoặc nhiều service cùng lúc.\n→ 16GB RAM là mức khởi đầu an toàn.");
  } else if (heavySpecialized) {
    reasons.push("Phần mềm nặng hoặc project chuyên sâu.\n→ Cần ít nhất 16GB RAM và nên xác minh phần mềm.");
  } else if (sustainedHeavy) {
    reasons.push("Bạn có tải nặng kéo dài.\n→ 16GB RAM là mức khởi đầu an toàn.");
  } else if (answers.videoWorkload === "short_social" && answers.uses.includes("video")) {
    reasons.push("Canva, CapCut và nội dung ngắn.\n→ 8GB RAM đã đủ cho nhu cầu hiện tại.");
  } else if (answers.designWorkload === "light" && answers.uses.includes("design")) {
    reasons.push("Canva, Figma và chỉnh ảnh cơ bản.\n→ 8GB RAM đã đủ cho nhu cầu hiện tại.");
  } else {
    reasons.push(`${formatUseSummary(answers)}.\n→ 8GB RAM đã đủ cho nhu cầu hiện tại.`);
  }

  if (longVideo) {
    reasons.push("Video dài hoặc 4K tạo nhiều tệp lớn.\n→ Nên ưu tiên 512GB SSD.");
  } else if (professionalDesign) {
    reasons.push("File thiết kế nhiều layer và phiên bản.\n→ 512GB SSD đáng cân nhắc.");
  } else {
    reasons.push("Chưa có nhu cầu lưu nhiều project lớn.\n→ 256GB SSD là đủ.");
  }

  reasons.push(productFamilyFit === "pro_preferred"
    ? "Bạn có tải nặng kéo dài.\n→ Dòng Pro có quạt và giữ hiệu năng ổn định hơn."
    : productFamilyFit === "air_preferred"
      ? "Ưu tiên máy gọn, tối giản và không có tải nặng kéo dài.\n→ MacBook Air là lựa chọn tự nhiên hơn."
      : "Không có tải nặng kéo dài.\n→ Cả Air và Pro 13 inch đều có thể đáp ứng tốt.");
  if (productFamilyFit === "air_or_pro") {
    reasons.push("Khác biệt chính nằm ở thiết kế, Touch Bar và quạt.\n→ Có thể chọn theo sở thích và tình trạng máy thực tế.");
  }
  reasons.push(wantsLarge
    ? `Bạn ưu tiên màn hình rộng và dùng tại một chỗ.\n→ ${productName} cho không gian làm việc rộng hơn.`
    : family === "MacBook Pro"
      ? "Bạn vẫn ưu tiên máy nhỏ gọn.\n→ MacBook Pro 13 inch hợp lý hơn việc nhảy thẳng lên Pro 14 inch."
      : `Bạn ưu tiên di chuyển hoặc máy nhỏ gọn.\n→ ${productName} nhẹ và dễ mang hơn.`);
  if (budgetConflict) {
    reasons.push("Ngân sách bạn chọn thấp hơn cấu hình tối thiểu.\n→ Nên đổi đời chip, dung lượng hoặc mức ngoại hình trước khi giảm RAM.");
  }

  let bestFit: RecommendationOption;
  let cheaper: RecommendationOption;
  let upgrade: RecommendationOption = option(
    "MacBook Air 15 inch",
    `${minimumRam}GB RAM · ${storageConfiguration}`,
    "Phương án màn hình rộng hơn nếu không gian hiển thị quan trọng hơn độ gọn.",
  );
  if (productFamilyFit === "air_or_pro") {
    bestFit = option(
      "MacBook Air 13 inch",
      `${minimumRam}GB RAM · ${storageConfiguration}`,
      "Mỏng, tối giản và không dùng quạt; phù hợp khi bạn ưu tiên thiết kế gọn nhẹ.",
    );
    cheaper = option(
      "MacBook Pro 13 inch",
      `${minimumRam}GB RAM · ${storageConfiguration}`,
      "Cùng mức cấu hình tối thiểu; phù hợp nếu bạn thích Touch Bar hoặc muốn có quạt khi chạy tải lâu.",
    );
    upgrade = option(
      "MacBook Air 15 inch",
      `${minimumRam}GB RAM · ${storageConfiguration}`,
      "Phương án màn hình rộng hơn nếu không gian hiển thị quan trọng hơn độ gọn.",
    );
  } else {
    bestFit = option(
      productName,
      `${minimumRam}GB RAM · ${storageConfiguration}`,
      "Điểm bắt đầu cân bằng nhất theo nhu cầu bạn đã chọn.",
    );
    const cheaperStorage = longVideo ? "512GB SSD" : "256GB SSD";
    cheaper = option(
      `${productName} · đời chip cũ hơn`,
      `${minimumRam}GB RAM · ${cheaperStorage}`,
      professionalDesign
        ? `Giữ nguyên tối thiểu ${minimumRam}GB RAM; giảm xuống 256GB SSD và đổi sang chip đời cũ hơn hoặc mức ngoại hình thấp hơn.`
        : `Giữ nguyên tối thiểu ${minimumRam}GB RAM; đổi sang chip đời cũ hơn hoặc mức ngoại hình thấp hơn để giảm chi phí.`,
    );
  }

  if (productFamilyFit !== "air_or_pro" && family === "MacBook Air" && size === "13 inch") {
    upgrade = option(
      "MacBook Air 15 inch",
      `${minimumRam}GB RAM · ${storageConfiguration}`,
      "Màn hình rộng hơn giúp chia cửa sổ và làm việc lâu thoải mái hơn, trong khi vẫn giữ đặc tính êm và nhẹ của Air.",
    );
  } else if (productFamilyFit !== "air_or_pro" && family === "MacBook Air") {
    upgrade = option(
      "MacBook Pro 14 inch",
      `${Math.max(16, minimumRam)}GB RAM · ${storageConfiguration}`,
      "Chỉ đáng nâng cấp nếu công việc nặng kéo dài xuất hiện thường xuyên: Pro duy trì hiệu năng tốt hơn khi render hoặc chạy tải liên tục.",
    );
  } else if (productFamilyFit !== "air_or_pro" && family === "MacBook Pro" && size === "13 inch") {
    upgrade = option(
      "MacBook Pro 14 inch",
      `${minimumRam}GB RAM · ${storageConfiguration}`,
      "Dành cho workload nặng hơn rõ rệt hoặc khi bạn muốn màn hình và dư địa hiệu năng lớn hơn.",
    );
  } else if (productFamilyFit !== "air_or_pro") {
    upgrade = option(
      "MacBook Pro 14 inch · RAM cao hơn",
      `${Math.max(32, minimumRam)}GB RAM · ${storageConfiguration}`,
      "Thêm dư địa cho dự án rất lớn, nhiều dịch vụ hoặc nhiều ứng dụng chuyên môn chạy đồng thời.",
    );
  }

  return {
    family,
    size,
    model,
    productFamilyFit,
    requiresAppleSilicon: true,
    requiresSustainedPerformance: sustainedHeavy,
    technicalProfile: {
      minimumRamGb: minimumRam,
      storageGb: preferredStorage === "512GB" ? 512 : 256,
      sustainedPerformanceRequired: sustainedHeavy,
      fanPreferred: sustainedHeavy,
      sizePreference: wantsLarge ? "large" : "compact",
      budgetBand: answers.budget,
    },
    minimumRam,
    preferredStorage,
    storageGuidance,
    needsVerification,
    budgetConflict,
    explanation: productFamilyFit === "air_or_pro"
      ? `Cả MacBook Air và MacBook Pro 13 inch đều đáp ứng tốt nhu cầu hiện tại với tối thiểu ${minimumRam}GB RAM và ${storageGuidance}.`
      : `${productName} với tối thiểu ${minimumRam}GB RAM và ${storageGuidance} là điểm bắt đầu hợp lý. RAM phản ánh độ nặng của công việc; lưu trữ phản ánh lượng tệp cần giữ trên máy.`,
    reasons,
    bestFit,
    cheaper,
    upgrade,
  };
}

export function buildZaloSummary(answers: QuizAnswers, result: Recommendation): string {
  const familyLines = result.model === "pro-13"
    ? [
        "Nhóm phù hợp: MacBook Pro 13 inch",
        `Cấu hình tối thiểu: ${result.minimumRam}GB RAM, ${result.preferredStorage} SSD`,
        "Lý do chính: cần giữ tải lâu nhưng vẫn ưu tiên máy nhỏ gọn.",
      ]
    : result.productFamilyFit === "air_or_pro"
    ? [
        "Nhóm phù hợp: MacBook 13 inch",
        `Cấu hình tối thiểu: ${result.minimumRam}GB RAM, ${result.preferredStorage} SSD`,
        "Dòng máy: Air hoặc Pro đều phù hợp",
        "Khác biệt chính: Air mỏng và tối giản hơn; Pro có Touch Bar và quạt.",
      ]
    : [
        `Gợi ý phù hợp nhất: ${result.family} ${result.size}`,
        `RAM tối thiểu: ${result.minimumRam}GB`,
        `Lưu trữ: ${result.storageGuidance}`,
      ];
  return [
    "Tóm tắt chọn MacBook từ MBMC",
    ...familyLines,
    `Nhu cầu chính: ${formatUseSummary(answers)}`,
    result.budgetConflict
      ? "Ngân sách đang thấp hơn cấu hình tối thiểu; ưu tiên đổi đời chip, dung lượng hoặc mức ngoại hình trước khi giảm RAM."
      : "",
    answers.specializedSoftware?.trim() ? `Phần mềm cần kiểm tra: ${answers.specializedSoftware.trim()}` : "",
  ].filter(Boolean).join("\n");
}
