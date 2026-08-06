import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "../_components/PolicyPage";

export const metadata: Metadata = { title: "MBMC Care | MBMC" };

export default function MbmcCarePolicyPage() {
  return (
    <PolicyPage
      eyebrow="Chính sách công khai"
      title="MBMC Care"
      intro="MBMC Care là quyền lợi có thể mua thêm nếu chiếc máy đủ điều kiện."
    >
      <section aria-labelledby="care-availability">
        <h2 id="care-availability">Khả dụng theo từng máy</h2>
        <p>
          Thông tin trên trang chi tiết chỉ mô tả khả năng mua thêm. MBMC xác
          nhận điều kiện áp dụng cho đúng Machine ID; trang này không tự kết
          luận đủ điều kiện và không tính giá Care.
        </p>
      </section>
      <section aria-labelledby="care-continuity">
        <h2 id="care-continuity">Hồ sơ theo Machine ID</h2>
        <p>
          Khi Care được xác nhận, quyền lợi được lưu cùng Machine ID để tiếp tục
          tra cứu sau bàn giao.
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
