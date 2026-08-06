import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "./_components/PolicyPage";

export const metadata: Metadata = {
  title: "Chính sách MBMC | MBMC",
  description:
    "Nơi tổng hợp chính sách bảo hành, MBMC Care và thông tin hợp tác công khai của MBMC.",
};

const policies = [
  {
    href: "/chinh-sach/bao-hanh",
    title: "Chính sách bảo hành",
    description:
      "Quy định về bảo hành phần cứng, quyền đổi máy, màn hình, sạc và quá trình xử lý.",
  },
  {
    href: "/chinh-sach/mbmc-care",
    title: "MBMC Care",
    description:
      "Thông tin về lựa chọn mở rộng bảo hành phần cứng và tính liên tục theo Machine ID.",
  },
  {
    href: "/chinh-sach/version/mbmc-policy-v1",
    title: "Chính sách MBMC V1",
    description:
      "Bản tham chiếu lưu trữ cố định cho những giao dịch áp dụng phiên bản V1.",
  },
  {
    href: "/chinh-sach/cong-tac-vien",
    title: "Chính sách cộng tác viên",
    description:
      "Nguyên tắc giới thiệu, bàn giao khách hàng và phối hợp cùng MBMC.",
    status: "Đang hoàn thiện",
  },
  {
    href: "/chinh-sach/dai-ly",
    title: "Chính sách đại lý",
    description: "Nguyên tắc về nguồn máy, bán sỉ và phối hợp dành cho đại lý.",
    status: "Đang hoàn thiện",
  },
] as const;

export default function PolicyHubPage() {
  return (
    <PolicyPage
      eyebrow="Thông tin công khai"
      title="Chính sách MBMC"
      description="Các chính sách về bảo hành, MBMC Care và hoạt động hợp tác được tập hợp tại đây để bạn dễ tìm và đối chiếu."
    >
      <PolicySection id="policy-directory" title="Danh mục chính sách">
        <div className="policy-card-grid">
          {policies.map((policy) => (
            <Link className="policy-card" href={policy.href} key={policy.href}>
              <div className="policy-card-heading">
                <h3>{policy.title}</h3>
                {"status" in policy ? (
                  <span className="policy-status">{policy.status}</span>
                ) : null}
              </div>
              <p>{policy.description}</p>
              <span className="policy-card-action">Xem chính sách</span>
            </Link>
          ))}
        </div>
      </PolicySection>
    </PolicyPage>
  );
}
