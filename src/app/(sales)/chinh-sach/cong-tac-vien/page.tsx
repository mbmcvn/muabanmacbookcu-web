import type { Metadata } from "next";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { PolicyPage, PolicySection } from "../_components/PolicyPage";

export const metadata: Metadata = {
  title: "Chính sách cộng tác viên | MBMC",
  description:
    "Thông tin tạm thời dành cho cá nhân và đơn vị muốn giới thiệu khách hàng tới MBMC.",
};

export default function CollaboratorPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Thông tin hợp tác"
      title="Chính sách cộng tác viên"
      description="Trang dành cho cá nhân hoặc đơn vị muốn giới thiệu khách hàng và phối hợp cùng MBMC."
      badge="Đang hoàn thiện"
      actions={[{ href: "/chinh-sach", label: "Tất cả chính sách" }]}
    >
      <PolicySection
        id="collaborator-policy-status"
        title="Thông tin đang được chuẩn hóa"
      >
        <p>
          MBMC đang chuẩn hóa nội dung chi tiết về quy trình giới thiệu và bàn
          giao khách hàng. Trong thời gian này, mọi điều kiện hợp tác hiện hành
          cần được xác nhận trực tiếp với MBMC trước khi thực hiện.
        </p>
        <ContactActionLink
          className="primary-action policy-contact-action"
          label="Nhắn Zalo để xác nhận với MBMC"
        />
      </PolicySection>
    </PolicyPage>
  );
}
