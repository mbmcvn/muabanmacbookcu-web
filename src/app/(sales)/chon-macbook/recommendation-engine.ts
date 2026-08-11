import type {
  Budget,
  DesignWorkload,
  DevelopmentWorkload,
  MainUse,
  NormalizedSignals,
  ProductModel,
  QuizAnswers,
  Recommendation,
  RecommendationOption,
  RecommendationPresentation,
  RecommendationProfile,
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
  unclear: "Nhu cầu chưa xác định rõ",
};

export const VIDEO_LABELS: Record<VideoWorkload, string> = {
  short_social: "Nội dung ngắn bằng Canva, CapCut, TikTok hoặc Reel",
  long_rare: "Video dài hoặc 4K thỉnh thoảng, khoảng mỗi tháng",
  long_regular: "Video dài hoặc 4K đều đặn hằng tuần",
  sustained_daily: "Chỉnh sửa, render hoặc xuất video kéo dài gần như hằng ngày",
};

export const DESIGN_LABELS: Record<DesignWorkload, string> = {
  light: "Canva, Figma hoặc chỉnh ảnh cơ bản",
  photoshop_standard: "Photoshop thông thường",
  professional: "Photoshop file lớn, nhiều layer hoặc thiết kế chuyên nghiệp",
  professional_sustained: "Thiết kế nặng và kéo dài thường xuyên",
};

export const DEVELOPMENT_LABELS: Record<DevelopmentWorkload, string> = {
  development_basic: "Code và chạy dự án cơ bản",
  docker_rare: "Docker hoặc máy ảo chỉ thỉnh thoảng",
  docker_regular: "Docker, cơ sở dữ liệu cục bộ hoặc nhiều dịch vụ hằng tuần",
  development_sustained: "Nhiều container, VM hoặc build kéo dài gần như hằng ngày",
};

export const SPECIALIZED_LABELS: Record<SpecializedWorkload, string> = {
  specialized_basic: "Phần mềm chuyên ngành cơ bản hoặc chưa rõ độ nặng",
  specialized_heavy: "Phần mềm nặng hoặc dự án phức tạp",
  specialized_sustained: "Phần mềm nặng và chạy tải kéo dài thường xuyên",
};

const BUDGET_RANGES: Record<Budget, { min?: number; max?: number } | undefined> = {
  "under-12": { max: 12 },
  "12-16": { min: 12, max: 16 },
  "16-22": { min: 16, max: 22 },
  "22-30": { min: 22, max: 30 },
  "over-30": { min: 30 },
  unknown: undefined,
};

const BUDGET_LABELS: Record<Budget, string> = {
  "under-12": "Dưới 12 triệu",
  "12-16": "12–16 triệu",
  "16-22": "16–22 triệu",
  "22-30": "22–30 triệu",
  "over-30": "Trên 30 triệu",
  unknown: "Chưa xác định",
};

function formatUseSummary(answers: QuizAnswers): string {
  return answers.uses.map((use) => {
    if (use === "video" && answers.videoWorkload) return VIDEO_LABELS[answers.videoWorkload];
    if (use === "design" && answers.designWorkload) return DESIGN_LABELS[answers.designWorkload];
    if (use === "development" && answers.developmentWorkload) return DEVELOPMENT_LABELS[answers.developmentWorkload];
    if (use === "specialized" && answers.specializedWorkload) return SPECIALIZED_LABELS[answers.specializedWorkload];
    return USE_LABELS[use];
  }).join("; ") || "Chưa xác định rõ";
}

function confidenceFor(use: MainUse, answers: QuizAnswers): "high" | "medium" | "low" {
  if (use === "development" || use === "video") return "medium";
  if (use === "specialized" || use === "unclear") return "low";
  if (use === "design" && !answers.designWorkload) return "medium";
  return "high";
}

export function normalizeRecommendationSignals(answers: QuizAnswers): NormalizedSignals {
  const ram16 = answers.uses.some((use) => {
    if (use === "design") return answers.designWorkload === "professional" || answers.designWorkload === "professional_sustained";
    if (use === "video") return answers.videoWorkload === "long_regular" || answers.videoWorkload === "sustained_daily";
    if (use === "development") return answers.developmentWorkload === "docker_regular" || answers.developmentWorkload === "development_sustained";
    if (use === "specialized") return answers.specializedWorkload === "specialized_heavy" || answers.specializedWorkload === "specialized_sustained";
    return false;
  });
  const sustainedPerformance =
    (answers.uses.includes("design") && answers.designWorkload === "professional_sustained")
    || (answers.uses.includes("video") && answers.videoWorkload === "sustained_daily")
    || (answers.uses.includes("development") && answers.developmentWorkload === "development_sustained")
    || (answers.uses.includes("specialized") && answers.specializedWorkload === "specialized_sustained");
  const softwareName = answers.uses.includes("specialized") ? answers.specializedSoftware?.trim() || undefined : undefined;
  const verificationReasons: string[] = [];
  if (softwareName) verificationReasons.push(`Bạn đang dùng ${softwareName}. MBMC cần kiểm tra thêm cách bạn sử dụng phần mềm này trước khi chốt chính xác dòng máy.`);
  if (answers.uses.includes("specialized") && !softwareName) verificationReasons.push("Bạn chưa cho biết tên phần mềm chuyên ngành. MBMC cần thêm thông tin này trước khi chốt chính xác dòng máy.");

  const portableHigh = answers.portability === "frequent";
  const screenLarge = answers.screen === "large";
  const sizeTradeoff = portableHigh && screenLarge;
  const preferredSizeClasses: ("13" | "14" | "15" | "16")[] = sizeTradeoff
    ? ["13", "14", "15", "16"]
    : screenLarge
      ? ["15", "16", "14"]
      : answers.screen === "compact" || portableHigh
        ? ["13", "14"]
        : ["13", "14", "15", "16"];
  const confidenceByDomain = Object.fromEntries(
    answers.uses.map((use) => [use, confidenceFor(use, answers)]),
  ) as NormalizedSignals["confidenceByDomain"];

  return {
    minimumRamGb: ram16 ? 16 : 8,
    sustainedPerformance,
    allowedFamilies: ["air", "pro"],
    preferredFamily: sustainedPerformance ? "pro" : undefined,
    preferredSizeClasses,
    sizeTradeoff,
    verificationReasons,
    softwareName,
    confidenceByDomain,
    evidence: answers.uses.map((use) => {
      if (use === "video" && answers.videoWorkload) return VIDEO_LABELS[answers.videoWorkload];
      if (use === "design" && answers.designWorkload) return DESIGN_LABELS[answers.designWorkload];
      if (use === "development" && answers.developmentWorkload) return DEVELOPMENT_LABELS[answers.developmentWorkload];
      if (use === "specialized" && answers.specializedWorkload) return SPECIALIZED_LABELS[answers.specializedWorkload];
      return USE_LABELS[use];
    }),
  };
}

function confidence(signals: NormalizedSignals): RecommendationProfile["confidence"] {
  const entries = Object.entries(signals.confidenceByDomain);
  const weakDomains = entries.filter(([, value]) => value !== "high").map(([domain]) => domain);
  const overall = entries.some(([, value]) => value === "low")
    ? "low"
    : entries.some(([, value]) => value === "medium")
      ? "medium"
      : "high";
  return { overall, weakDomains };
}

function buildReasoning(answers: QuizAnswers, signals: NormalizedSignals): string[] {
  const reasoning: string[] = [];
  reasoning.push(signals.minimumRamGb === 16
    ? `${signals.evidence.join("; ")}.\n→ 16GB RAM là mức tối thiểu phù hợp với tần suất và độ nặng đã chọn.`
    : `${signals.evidence.join("; ") || "Nhu cầu chưa đủ chi tiết"}.\n→ 8GB RAM vẫn là mức khởi đầu chấp nhận được.`);
  reasoning.push("Bạn chưa cho thấy nhu cầu lưu nhiều ảnh, video hoặc dự án trực tiếp trên máy.\n→ 256GB SSD là mức mặc định hợp lý.");
  reasoning.push(signals.sustainedPerformance
    ? "Bạn thường xuyên chạy công việc nặng trong thời gian dài.\n→ MacBook Pro sẽ hợp hơn nhờ khả năng giữ hiệu năng ổn định; MacBook Air vẫn là phương án có thể cân nhắc."
    : "Bạn chưa có công việc nặng kéo dài thường xuyên.\n→ Vì vậy cả MacBook Air và Pro đều có thể đáp ứng tốt; chưa cần chọn Pro chỉ vì hiệu năng.");
  if (signals.sizeTradeoff) {
    reasoning.push("Bạn thường xuyên mang máy nhưng cũng thích màn hình rộng.\n→ Máy 13/14 inch sẽ gọn hơn, còn 15/16 inch cho không gian làm việc thoải mái hơn.");
  } else if (answers.screen === "compact" || answers.portability === "frequent") {
    reasoning.push("Bạn ưu tiên độ gọn hoặc thường xuyên mang máy.\n→ Nhóm 13/14 inch được ưu tiên ở lớp kích thước.");
  } else if (answers.screen === "large") {
    reasoning.push("Bạn thích không gian hiển thị rộng.\n→ Nhóm 15/16 inch và Pro 14 inch được ưu tiên; việc ít di chuyển không tự tạo yêu cầu màn hình lớn.");
  }
  if (signals.verificationReasons.length) {
    reasoning.push(`${signals.verificationReasons.join(" ")}\n→ Đây là gợi ý sơ bộ cho đến khi thông tin tương thích được xác nhận.`);
  }
  return reasoning;
}

export function resolveRecommendationProfile(answers: QuizAnswers, signals = normalizeRecommendationSignals(answers)): RecommendationProfile {
  const comfortRange = answers.budget ? BUDGET_RANGES[answers.budget] : undefined;
  const stretchAmount = answers.stretchBudget === "plus-3" ? 3 : answers.stretchBudget === "plus-5" ? 5 : 0;
  return {
    technical: {
      minimumRamGb: signals.minimumRamGb,
      defaultStorageGb: 256,
      minimumStorageGb: signals.storageDemandGb,
      sustainedPerformance: signals.sustainedPerformance,
    },
    family: { allowed: signals.allowedFamilies, preferred: signals.preferredFamily },
    size: { preferredClasses: signals.preferredSizeClasses, hasTradeoff: signals.sizeTradeoff },
    financial: {
      paymentMode: answers.payment,
      comfortRange,
      stretchAmount: stretchAmount > 0 ? stretchAmount as 3 | 5 : undefined,
      stretchMax: comfortRange?.max !== undefined && stretchAmount > 0 ? comfortRange.max + stretchAmount : undefined,
      installment: answers.payment === "installment" || answers.payment === "both"
        ? { deposit: answers.deposit, monthlyPayment: answers.monthlyPayment }
        : undefined,
      // A profile has no machine price. Fit cannot be asserted until a later matcher evaluates a candidate.
      status: "unknown",
    },
    transaction: { fulfilment: answers.fulfilment, province: answers.fulfilment === "province" ? answers.province?.trim() || undefined : undefined },
    verification: {
      required: signals.verificationReasons.length > 0,
      softwareName: signals.softwareName,
      reasons: signals.verificationReasons,
    },
    confidence: confidence(signals),
    reasoning: buildReasoning(answers, signals),
  };
}

function option(model: ProductModel, ram: 8 | 16, label: string, note: string): RecommendationOption {
  return { model, label, configuration: `${ram}GB RAM · 256GB SSD`, note };
}

function modelFamily(model: ProductModel): "MacBook Air" | "MacBook Pro" {
  return model.startsWith("air") ? "MacBook Air" : "MacBook Pro";
}

function modelSize(model: ProductModel): RecommendationPresentation["size"] {
  const size = model.split("-")[1];
  return `${size} inch` as RecommendationPresentation["size"];
}

export function presentRecommendation(profile: RecommendationProfile): RecommendationPresentation {
  const ram = profile.technical.minimumRamGb;
  const large = profile.size.preferredClasses[0] === "15" || profile.size.preferredClasses[0] === "16";
  const proPreferred = profile.family.preferred === "pro";
  let bestFit: RecommendationOption;
  let alternative: RecommendationOption | undefined;
  let upgrade: RecommendationOption | undefined;
  let title: string;

  if (profile.size.hasTradeoff) {
    title = proPreferred ? "MacBook Pro: cân bằng độ gọn và màn hình rộng" : "MacBook: cân bằng độ gọn và màn hình rộng";
    bestFit = proPreferred
      ? option("pro-13", ram, "MacBook Pro 13 inch", "Giữ thân máy gọn trong khi vẫn ưu tiên hiệu năng duy trì.")
      : option("air-13", ram, "MacBook Air 13 inch", "Phương án gọn nhẹ cho nhịp di chuyển thường xuyên.");
    alternative = option("air-15", ram, "MacBook Air 15 inch", "Đổi độ gọn lấy không gian hiển thị rộng hơn.");
    upgrade = option("pro-14", ram, "MacBook Pro 14 inch", "Điểm cân bằng khác giữa màn hình, độ gọn và khả năng duy trì hiệu năng.");
  } else if (large) {
    title = proPreferred ? "MacBook Pro 14 hoặc 16 inch" : "MacBook Air 15 hoặc Pro 14/16 inch";
    bestFit = proPreferred
      ? option("pro-14", ram, "MacBook Pro 14 inch", "Ưu tiên hiệu năng duy trì và màn hình rộng hơn trong thân máy vừa phải.")
      : option("air-15", ram, "MacBook Air 15 inch", "Màn hình rộng, trong khi chưa có lý do kỹ thuật để bắt buộc Pro.");
    alternative = proPreferred
      ? option("air-15", ram, "MacBook Air 15 inch", "Air vẫn có thể đáp ứng; bạn cần cân nhắc giữa độ mỏng nhẹ và khả năng chạy công việc nặng lâu hơn.")
      : option("pro-14", ram, "MacBook Pro 14 inch", "Phương án có quạt nếu tải kéo dài xuất hiện về sau.");
    upgrade = option("pro-16", ram, "MacBook Pro 16 inch", "Không gian hiển thị lớn nhất trong các lớp sản phẩm V1.");
  } else {
    title = proPreferred ? "MacBook Pro 13 hoặc 14 inch" : "MacBook Air 13 hoặc Pro 13 inch";
    bestFit = proPreferred
      ? option("pro-13", ram, "MacBook Pro 13 inch", "Ưu tiên hiệu năng duy trì trong lớp máy gọn.")
      : option("air-13", ram, "MacBook Air 13 inch", "Mỏng nhẹ và phù hợp với nhu cầu hiện tại của bạn.");
    alternative = proPreferred
      ? option("pro-14", ram, "MacBook Pro 14 inch", "Thêm không gian màn hình và dư địa hiệu năng trong lớp tương đối gọn.")
      : option("pro-13", ram, "MacBook Pro 13 inch", "Cùng mức tối thiểu; phù hợp nếu bạn muốn quạt hoặc Touch Bar.");
    upgrade = option("air-15", ram, "MacBook Air 15 inch", "Chỉ chọn nếu bạn muốn đổi độ gọn lấy màn hình rộng hơn.");
  }
  const model = bestFit.model;
  const softwareName = profile.verification.required ? profile.verification.softwareName : undefined;
  const storage = profile.technical.minimumStorageGb ?? profile.technical.defaultStorageGb;
  const explanation = softwareName
    ? `Đây là gợi ý sơ bộ. Với mức công việc bạn mô tả, MBMC ưu tiên ${ram}GB RAM và ${storage}GB SSD. Vì bạn đang dùng ${softwareName}, MBMC cần kiểm tra thêm cách bạn sử dụng phần mềm này trước khi chốt chính xác dòng máy. ${profile.family.preferred === "pro"
      ? "Ở thời điểm này, MacBook Pro được ưu tiên hơn cho tải kéo dài, nhưng Air vẫn là phương án có thể cân nhắc."
      : "Ở thời điểm này, cả MacBook Air và Pro vẫn là các phương án có thể cân nhắc."}`
    : profile.family.preferred === "pro"
      ? `MacBook Pro sẽ hợp hơn vì bạn thường xuyên chạy công việc nặng trong thời gian dài. ${ram}GB RAM là mức hợp lý để bắt đầu, còn 256GB SSD là lựa chọn mặc định vì bạn chưa cho thấy nhu cầu lưu trữ lớn trên máy.`
      : `Cả MacBook Air và Pro đều phù hợp với nhu cầu của bạn. ${ram}GB RAM là mức hợp lý để bắt đầu, còn 256GB SSD là lựa chọn mặc định vì bạn chưa cho thấy nhu cầu lưu trữ lớn trên máy.`;
  return {
    title,
    family: profile.family.preferred ? modelFamily(model) : "MacBook Air hoặc Pro",
    size: modelSize(model),
    model,
    explanation,
    storageGuidance: "256GB mặc định",
    reasons: profile.reasoning,
    bestFit,
    alternative,
    upgrade,
  };
}

export function recommendMacBook(answers: QuizAnswers): Recommendation {
  const signals = normalizeRecommendationSignals(answers);
  const profile = resolveRecommendationProfile(answers, signals);
  return { profile, presentation: presentRecommendation(profile) };
}

export function buildZaloSummary(answers: QuizAnswers, result: Recommendation): string {
  const { profile, presentation } = result;
  const payment = profile.financial.paymentMode === "installment"
    ? `Thanh toán: trả góp; trả trước ${answers.deposit ?? "chưa rõ"}; hàng tháng ${answers.monthlyPayment ?? "chưa rõ"}`
    : profile.financial.paymentMode === "both"
      ? "Thanh toán: đang cân nhắc cả trả thẳng và trả góp"
      : profile.financial.paymentMode === "full" ? "Thanh toán: một lần" : "";
  const cashBudget = answers.budget ? `Khoảng giá thấy thoải mái: ${BUDGET_LABELS[answers.budget]}` : "";
  const extraBudget = answers.stretchBudget === "plus-3"
    ? "Có thể cân nhắc thêm: khoảng 2–3 triệu nếu lựa chọn thật sự đáng tiền"
    : answers.stretchBudget === "plus-5"
      ? "Có thể cân nhắc thêm: khoảng 5 triệu nếu lựa chọn thật sự đáng tiền"
      : answers.stretchBudget === "none" ? "Không muốn cố thêm ngoài khoảng giá đã chọn" : "";
  return [
    "Tóm tắt chọn MacBook từ MBMC",
    `Nhóm phù hợp: ${presentation.title}`,
    `RAM tối thiểu: ${profile.technical.minimumRamGb}GB`,
    "Lưu trữ: 256GB mặc định; chưa có tín hiệu cần dung lượng local cao hơn",
    `Nhu cầu chính: ${formatUseSummary(answers)}`,
    profile.confidence.overall === "high" ? "" : "Gợi ý này còn sơ bộ vì nhu cầu cần thêm thông tin để chốt chính xác.",
    payment,
    cashBudget,
    extraBudget,
    profile.verification.softwareName ? `Phần mềm cần kiểm tra: ${profile.verification.softwareName}` : "",
    profile.verification.required ? "Kết quả còn sơ bộ cho đến khi hoàn tất xác minh." : "",
  ].filter(Boolean).join("\n");
}
