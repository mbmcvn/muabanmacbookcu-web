export type PaymentMethod = "full" | "installment" | "both";
export type Budget = "under-12" | "12-16" | "16-22" | "22-30" | "over-30" | "unknown";
export type RangeAnswer = "low" | "medium" | "high" | "unknown";
export type StretchBudget = "none" | "plus-3" | "plus-5";
export type MainUse = "office" | "design" | "video" | "development" | "specialized" | "personal" | "unclear";
export type VideoWorkload = "short_social" | "long_rare" | "long_regular" | "sustained_daily";
export type DesignWorkload = "light" | "photoshop_standard" | "professional" | "professional_sustained";
export type DevelopmentWorkload = "development_basic" | "docker_rare" | "docker_regular" | "development_sustained";
export type SpecializedWorkload = "specialized_basic" | "specialized_heavy" | "specialized_sustained";
export type ProductFamily = "air" | "pro";
export type ProductModel = "air-13" | "pro-13" | "air-15" | "pro-14" | "pro-16";
export type Portability = "frequent" | "stationary";
export type ScreenPreference = "compact" | "large";
export type Fulfilment = "showroom" | "hanoi-delivery" | "province" | "unknown";

export interface QuizAnswers {
  payment?: PaymentMethod;
  budget?: Budget;
  stretchBudget?: StretchBudget;
  deposit?: RangeAnswer;
  monthlyPayment?: RangeAnswer;
  uses: MainUse[];
  videoWorkload?: VideoWorkload;
  designWorkload?: DesignWorkload;
  developmentWorkload?: DevelopmentWorkload;
  specializedWorkload?: SpecializedWorkload;
  specializedSoftware?: string;
  portability?: Portability;
  screen?: ScreenPreference;
  fulfilment?: Fulfilment;
  province?: string;
}

export type QuestionId =
  | "payment" | "budget" | "deposit" | "monthly-payment" | "uses"
  | "portability" | "screen" | "fulfilment";

export interface NormalizedSignals {
  minimumRamGb: 8 | 16;
  storageDemandGb?: 512 | 1024;
  sustainedPerformance: boolean;
  allowedFamilies: ProductFamily[];
  preferredFamily?: ProductFamily;
  preferredSizeClasses: ("13" | "14" | "15" | "16")[];
  sizeTradeoff: boolean;
  verificationReasons: string[];
  softwareName?: string;
  confidenceByDomain: Partial<Record<MainUse, "high" | "medium" | "low">>;
  evidence: string[];
}

export interface RecommendationProfile {
  technical: {
    minimumRamGb: 8 | 16;
    defaultStorageGb: 256;
    minimumStorageGb?: 512 | 1024;
    sustainedPerformance: boolean;
  };
  family: {
    allowed: ProductFamily[];
    preferred?: ProductFamily;
  };
  size: {
    preferredClasses: ("13" | "14" | "15" | "16")[];
    hasTradeoff: boolean;
  };
  financial: {
    paymentMode?: PaymentMethod;
    comfortRange?: { min?: number; max?: number };
    stretchAmount?: 3 | 5;
    stretchMax?: number;
    installment?: { deposit?: RangeAnswer; monthlyPayment?: RangeAnswer };
    status: "fit" | "stretch" | "conflict" | "unknown";
  };
  transaction: {
    fulfilment?: Fulfilment;
    province?: string;
  };
  verification: {
    required: boolean;
    softwareName?: string;
    reasons: string[];
  };
  confidence: {
    overall: "high" | "medium" | "low";
    weakDomains: string[];
  };
  reasoning: string[];
}

export interface RecommendationOption {
  model: ProductModel;
  label: string;
  configuration: string;
  note: string;
}

export interface RecommendationPresentation {
  title: string;
  family: "MacBook Air" | "MacBook Pro" | "MacBook Air hoặc Pro";
  size: "13 inch" | "15 inch" | "14 inch" | "16 inch";
  model: ProductModel;
  explanation: string;
  storageGuidance: string;
  reasons: string[];
  bestFit: RecommendationOption;
  alternative?: RecommendationOption;
  upgrade?: RecommendationOption;
}

export interface Recommendation {
  profile: RecommendationProfile;
  presentation: RecommendationPresentation;
}

export const EMPTY_ANSWERS: QuizAnswers = { uses: [] };
