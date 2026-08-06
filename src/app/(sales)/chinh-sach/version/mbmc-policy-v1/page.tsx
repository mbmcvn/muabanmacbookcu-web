import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "../../_components/PolicyPage";

export const metadata: Metadata = { title: "Chính sách MBMC V1 | MBMC" };

export default function PolicyVersionPage() {
  return (
    <PolicyPage
      eyebrow="Tham chiếu lịch sử"
      title="Chính sách MBMC V1"
      description="Bản lưu cố định của MBMC Policy V1. Nội dung này được giữ nguyên để đối chiếu quyền lợi đã áp dụng theo phiên bản, và không nhất thiết là chính sách hiện hành."
      badge="Bản lưu · V1"
      metrics={[
        { value: "V1", label: "Phiên bản cố định" },
        { value: "Machine ID", label: "Khóa đối chiếu quyền lợi" },
      ]}
      actions={[
        { href: "/chinh-sach/bao-hanh", label: "Chính sách bảo hành hiện tại" },
        {
          href: "/chinh-sach/mbmc-care",
          label: "Thông tin MBMC Care hiện tại",
        },
      ]}
    >
      <PolicySection
        id="policy-v1-reference"
        title="Bản tham chiếu không thay đổi"
      >
        <p>
          Trang này là bản tham chiếu lịch sử cố định. Khi chính sách hiện hành
          thay đổi, nội dung V1 vẫn được giữ lại để giải thích phiên bản quyền
          lợi đã ghi nhận cho máy.
        </p>
      </PolicySection>
      <PolicySection id="policy-v1-rights" title="Quyền lợi hiệu lực theo V1">
        <ul>
          <li>Bảo hành phần cứng 01 tháng.</li>
          <li>Đổi máy trong 07 ngày nếu có lỗi nghiêm trọng.</li>
          <li>Màn hình và sạc được bảo hành 07 ngày.</li>
          <li>Có thể mua thêm MBMC Care nếu máy đủ điều kiện.</li>
          <li>Quyền lợi được lưu theo Machine ID.</li>
        </ul>
      </PolicySection>
      <PolicySection id="policy-v1-current" title="Chính sách hiện hành">
        <p>
          Để xem thông tin đang được công bố, hãy dùng các trang Chính sách bảo
          hành và MBMC Care hiện tại. Phiên bản gắn với một máy cụ thể được xác
          nhận từ hồ sơ của Machine ID đó.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
