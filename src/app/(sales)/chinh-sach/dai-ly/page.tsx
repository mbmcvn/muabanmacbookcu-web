import type { Metadata } from "next";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { PolicyPage, PolicySection } from "../_components/PolicyPage";

export const metadata: Metadata = {
  title: "Chính sách đại lý | MBMC",
  description:
    "Thông tin tạm thời dành cho đại lý muốn trao đổi về nguồn máy và hoạt động hợp tác với MBMC.",
};

export default function DealerPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Thông tin hợp tác"
      title="Chính sách đại lý"
      description="Trang dành cho đại lý và đơn vị muốn trao đổi về nguồn máy, bán sỉ và phối hợp cùng MBMC."
      badge="Đang hoàn thiện"
      actions={[{ href: "/chinh-sach", label: "Tất cả chính sách" }]}
    >
      <PolicySection
        id="dealer-policy-status"
        title="Thông tin đang được chuẩn hóa"
      >
        <p>
          MBMC đang chuẩn hóa nội dung chi tiết cho hoạt động hợp tác đại lý.
          Trong thời gian này, mọi điều kiện hiện hành cần được xác nhận trực
          tiếp với MBMC trước khi hai bên thực hiện.
        </p>
        <ContactActionLink
          className="primary-action policy-contact-action"
          label="Nhắn Zalo để xác nhận với MBMC"
        />
      </PolicySection>
    </PolicyPage>
  );
}
