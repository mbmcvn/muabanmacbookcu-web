import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "../_components/PolicyPage";

export const metadata: Metadata = { title: "Chính sách bảo hành | MBMC" };

export default function WarrantyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Chính sách công khai"
      title="Chính sách bảo hành"
      intro="Tóm tắt quyền lợi bảo hành trước bán theo chính sách MBMC V1."
    >
      <section aria-labelledby="warranty-coverage">
        <h2 id="warranty-coverage">Quyền lợi chính</h2>
        <ul>
          <li>Bảo hành phần cứng 01 tháng.</li>
          <li>Đổi máy trong 07 ngày nếu có lỗi nghiêm trọng.</li>
          <li>Màn hình và sạc được bảo hành 07 ngày.</li>
        </ul>
      </section>
      <section aria-labelledby="warranty-identity">
        <h2 id="warranty-identity">Gắn với đúng chiếc máy</h2>
        <p>
          Quyền lợi được lưu theo Machine ID. Thời điểm áp dụng cụ thể được xác
          nhận khi bán và bàn giao, không được suy đoán từ ngày máy xuất hiện
          công khai.
        </p>
      </section>
      <p>
        <Link href="/chinh-sach/version/mbmc-policy-v1">
          Xem bản chính sách MBMC V1
        </Link>
      </p>
    </PolicyPage>
  );
}
