export type PaymentMethod = "full" | "installment" | "both";
export type Budget = "under-12" | "12-16" | "16-22" | "22-30" | "over-30" | "unknown";
export type RangeAnswer = "low" | "medium" | "high" | "unknown";
export type MainUse = "office" | "design" | "video" | "development" | "specialized" | "personal" | "unclear";
export type VideoWorkload = "short_social" | "long_high_quality";
export type DesignWorkload = "light" | "professional";
export type DevelopmentWorkload = "development_basic" | "development_heavy";
export type SpecializedWorkload = "specialized_basic" | "specialized_heavy";
export type ProductFamilyFit = "air_preferred" | "pro_preferred" | "air_or_pro";
export type ProductModel = "air-13" | "pro-13" | "air-15" | "pro-14" | "pro-16";
export type Portability = "frequent" | "stationary";
export type ScreenPreference = "compact" | "large";
export type Fulfilment = "showroom" | "hanoi-delivery" | "province" | "unknown";

export interface QuizAnswers {
  payment?: PaymentMethod;
  budget?: Budget;
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

export interface RecommendationOption {
  label: string;
  configuration: string;
  note: string;
}

export interface TechnicalProfile {
  minimumRamGb: 8 | 16;
  storageGb: 256 | 512;
  sustainedPerformanceRequired: boolean;
  fanPreferred: boolean;
  sizePreference: "compact" | "large";
  budgetBand?: Budget;
}

export interface Recommendation {
  family: "MacBook Air" | "MacBook Pro";
  size: "13 inch" | "15 inch" | "14 inch" | "16 inch";
  model: ProductModel;
  productFamilyFit: ProductFamilyFit;
  requiresAppleSilicon: true;
  requiresSustainedPerformance: boolean;
  technicalProfile: TechnicalProfile;
  minimumRam: 8 | 16;
  preferredStorage: "256GB" | "512GB";
  storageGuidance: string;
  needsVerification: boolean;
  budgetConflict: boolean;
  explanation: string;
  reasons: string[];
  bestFit: RecommendationOption;
  cheaper?: RecommendationOption;
  upgrade: RecommendationOption;
}

export const EMPTY_ANSWERS: QuizAnswers = { uses: [] };
