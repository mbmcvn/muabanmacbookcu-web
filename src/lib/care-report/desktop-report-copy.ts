import type { DesktopDiagnosticId } from "./desktop-device-check/contracts";

export const DESKTOP_DIAGNOSTIC_SUMMARY_VI: Readonly<
  Record<DesktopDiagnosticId, string>
> = {
  system_overview:
    "Kiểm tra ghi nhận thông tin hệ thống và các tín hiệu chức năng có thể xác minh tại thời điểm thực hiện; không xác nhận toàn diện tình trạng phần cứng.",
  display:
    "Kiểm tra ghi nhận khả năng hiển thị và quan sát hình ảnh theo hướng dẫn; không đo toàn diện chất lượng tấm nền hoặc lỗi chập chờn.",
  keyboard:
    "Kiểm tra ghi nhận phản hồi của các bề mặt bàn phím được yêu cầu; không xác minh độ bền hoặc lỗi chập chờn.",
  trackpad:
    "Đã ghi nhận vùng di chuyển con trỏ, thao tác nhấn chính và cuộn theo hướng dẫn. Kết quả này không xác minh toàn diện cảm giác nhấn, haptic, độ đồng đều lực nhấn hoặc lỗi chập chờn.",
  battery:
    "Kiểm tra dựa trên dữ liệu pin mà macOS cung cấp tại thời điểm thực hiện; không dự đoán tuổi thọ còn lại hoặc hiệu năng trong mọi điều kiện sử dụng.",
  storage:
    "Kiểm tra dựa trên dữ liệu lưu trữ mà hệ thống cung cấp; không thay thế kiểm tra toàn diện bề mặt lưu trữ, hiệu năng hoặc độ bền lâu dài.",
  camera:
    "Hình ảnh camera bình thường chưa được xác nhận đầy đủ trong mọi trường hợp; kết quả không đánh giá toàn diện chất lượng cảm biến hoặc tình trạng cơ học.",
  microphone:
    "Quá trình thu/phát lại âm thanh được đánh giá trong phạm vi bài kiểm tra; kết quả không kết luận về tình trạng cơ học hoặc chất lượng tổng thể của micrô.",
  speakers:
    "Kiểm tra xác nhận khả năng phát âm thanh từng kênh theo phản hồi của người kiểm tra; không đo đáp tuyến tần số, méo tiếng, âm lượng tối đa hoặc tình trạng cơ học.",
  wifi: "Kiểm tra dựa trên việc quét và kết nối Wi-Fi. Khả năng truy cập Internet được đánh giá riêng.",
  bluetooth:
    "Kiểm tra trạng thái bộ điều khiển và một lượt quét Bluetooth ngắn; không đánh giá phạm vi, độ ổn định hoặc chất lượng ăng-ten.",
  touch_id:
    "Kiểm tra ghi nhận kết quả xác thực Touch ID trong bài kiểm tra tương tác; không xác minh độ tin cậy lâu dài hoặc lỗi chập chờn.",
  ports:
    "Trạng thái được lưu riêng cho từng cổng. Một cổng chỉ được xác nhận thông qua bằng chứng phù hợp hoặc xác nhận trực tiếp của người kiểm tra.",
  charging:
    "Kiểm tra ghi nhận trạng thái sạc mà hệ thống cung cấp tại thời điểm thực hiện; không xác minh toàn diện công suất, bộ sạc, cáp hoặc độ ổn định lâu dài.",
};

export function desktopDiagnosticSummaryVi(
  diagnosticId: DesktopDiagnosticId,
  sourceSummary: string | null | undefined,
) {
  return sourceSummary ? DESKTOP_DIAGNOSTIC_SUMMARY_VI[diagnosticId] : null;
}
