import type { MainUse, QuestionId, QuizAnswers } from "./quiz-types";

export interface Choice<T extends string = string> { value: T; label: string; detail?: string }

export const questionCopy: Record<QuestionId, { eyebrow: string; title: string; hint?: string }> = {
  payment: { eyebrow: "Cách bạn muốn mua", title: "Bạn dự định thanh toán thế nào?" },
  budget: { eyebrow: "Khoảng đầu tư", title: "Khoảng nào khiến bạn thấy thoải mái nhất?" },
  deposit: { eyebrow: "Khoản trả trước", title: "Bạn thấy thoải mái với khoản trả trước nào?", hint: "Chỉ dùng để hiểu mức đầu tư, không phải đánh giá hồ sơ trả góp." },
  "monthly-payment": { eyebrow: "Khoản trả hàng tháng", title: "Mỗi tháng bạn muốn chi khoảng bao nhiêu?", hint: "MBMC chưa tính lãi suất hay khả năng được duyệt ở bước này." },
  uses: { eyebrow: "Công việc chính", title: "Bạn sẽ dùng máy nhiều nhất cho việc gì?", hint: "Chọn tối đa 2 việc bạn làm thường xuyên hoặc ảnh hưởng nhiều nhất đến cấu hình máy." },
  portability: { eyebrow: "Nhịp di chuyển", title: "Bạn có thường xuyên mang máy theo không?" },
  screen: { eyebrow: "Không gian làm việc", title: "Bạn ưu tiên kích thước nào hơn?" },
  fulfilment: { eyebrow: "Cách nhận máy", title: "Bạn muốn xem hoặc nhận máy thế nào?" },
};

export const choices = {
  payment: [
    { value: "full", label: "Thanh toán một lần" },
    { value: "installment", label: "Trả góp" },
    { value: "both", label: "Tôi đang cân nhắc cả hai" },
  ],
  budget: [
    { value: "under-12", label: "Dưới 12 triệu" }, { value: "12-16", label: "12–16 triệu" },
    { value: "16-22", label: "16–22 triệu" }, { value: "22-30", label: "22–30 triệu" },
    { value: "over-30", label: "Trên 30 triệu" }, { value: "unknown", label: "Chưa xác định" },
  ],
  stretch: [
    { value: "none", label: "Không" },
    { value: "plus-3", label: "Thêm khoảng 2–3 triệu" },
    { value: "plus-5", label: "Thêm khoảng 5 triệu" },
  ],
  deposit: [
    { value: "low", label: "Dưới 5 triệu" }, { value: "medium", label: "5–10 triệu" },
    { value: "high", label: "Trên 10 triệu" }, { value: "unknown", label: "Chưa xác định" },
  ],
  monthly: [
    { value: "low", label: "Dưới 2 triệu / tháng" }, { value: "medium", label: "2–4 triệu / tháng" },
    { value: "high", label: "Trên 4 triệu / tháng" }, { value: "unknown", label: "Chưa xác định" },
  ],
  uses: [
    { value: "office", label: "Học tập, văn phòng, bán hàng" },
    { value: "design", label: "Thiết kế hình ảnh" },
    { value: "video", label: "Dựng video, làm nội dung" },
    { value: "development", label: "Lập trình, công nghệ" },
    { value: "specialized", label: "Kỹ thuật, kiến trúc, phần mềm chuyên ngành" },
    { value: "personal", label: "Dùng cá nhân, giải trí" },
    { value: "unclear", label: "Chưa rõ, chỉ muốn một chiếc máy dùng ổn lâu dài" },
  ] satisfies Choice<MainUse>[],
  portability: [
    { value: "frequent", label: "Có, gần như mỗi ngày", detail: "Ưu tiên máy gọn và nhẹ khi di chuyển thường xuyên." },
    { value: "stationary", label: "Không nhiều, chủ yếu dùng tại một chỗ", detail: "Có thể ưu tiên không gian màn hình rộng hơn." },
  ],
  screen: [{ value: "compact", label: "Máy nhỏ gọn, dễ mang theo" }, { value: "large", label: "Màn hình rộng, dễ chia nhiều cửa sổ" }],
  fulfilment: [
    { value: "showroom", label: "Đến xem trực tiếp tại Hà Nội" },
    { value: "hanoi-delivery", label: "Giao máy trong Hà Nội" },
    { value: "province", label: "Gửi máy đến tỉnh hoặc thành phố khác" },
    { value: "unknown", label: "Chưa xác định" },
  ],
};

export function getQuestionFlow(answers: QuizAnswers): QuestionId[] {
  const paymentQuestions: QuestionId[] =
    answers.payment === "installment" ? ["deposit", "monthly-payment"] : ["budget"];
  return ["payment", ...paymentQuestions, "uses", "portability", "screen", "fulfilment"];
}
