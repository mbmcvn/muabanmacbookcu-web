import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "../../_components/PolicyPage";

export const metadata: Metadata = { title: "MBMC Policy V1 | MBMC" };

export default function PolicyVersionPage() {
  return (
    <PolicyPage
      eyebrow="Phiên bản chính sách"
      title="MBMC Policy V1"
      intro="Bản giải thích công khai cho quyền lợi trước bán được hiển thị trên trang chi tiết máy."
    >
      <section aria-labelledby="policy-v1-summary">
        <h2 id="policy-v1-summary">Tóm tắt quyền lợi</h2>
        <ul>
          <li>Bảo hành phần cứng 01 tháng.</li>
          <li>Đổi máy trong 07 ngày nếu có lỗi nghiêm trọng.</li>
          <li>Màn hình và sạc được bảo hành 07 ngày.</li>
          <li>Có thể mua thêm MBMC Care nếu máy đủ điều kiện.</li>
          <li>Quyền lợi được lưu theo Machine ID.</li>
        </ul>
      </section>
      <nav className="policy-page-links" aria-label="Chi tiết chính sách">
        <Link href="/chinh-sach/bao-hanh">Chính sách bảo hành</Link>
        <Link href="/chinh-sach/mbmc-care">MBMC Care</Link>
      </nav>
    </PolicyPage>
  );
}
