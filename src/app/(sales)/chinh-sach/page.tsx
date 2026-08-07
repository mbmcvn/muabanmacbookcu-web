import type { Metadata } from "next";
import Link from "next/link";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import {
  PolicyHubIcon,
  type PolicyHubIconName,
} from "./_components/PolicyHubIcon";
import { PolicyPage } from "./_components/PolicyPage";

export const metadata: Metadata = {
  title: "Chính sách MBMC | MBMC",
  description:
    "Nơi tổng hợp chính sách bảo hành, MBMC Care và thông tin hợp tác công khai của MBMC.",
};

type PolicyCard = Readonly<{
  href: string;
  title: string;
  description: string;
  icon: PolicyHubIconName;
  status?: string;
}>;

const customerPolicies: readonly PolicyCard[] = [
  {
    href: "/chinh-sach/bao-hanh",
    title: "Chính sách bảo hành",
    description:
      "Quy định bảo hành phần cứng, quyền đổi máy, màn hình, sạc và các trường hợp không hỗ trợ.",
    icon: "warranty",
  },
  {
    href: "/chinh-sach/mbmc-care",
    title: "MBMC Care",
    description:
      "Mở rộng thời hạn bảo hành phần cứng và duy trì quyền lợi theo Machine ID.",
    icon: "care",
  },
  {
    href: "/chinh-sach/version/mbmc-policy-v1",
    title: "Chính sách MBMC V1",
    description:
      "Bản chính sách cố định dùng để tham chiếu cho các giao dịch áp dụng phiên bản V1.",
    icon: "archive",
  },
];

const partnerPolicies: readonly PolicyCard[] = [
  {
    href: "/chinh-sach/cong-tac-vien",
    title: "Chính sách cộng tác viên",
    description:
      "Quy trình giới thiệu, chuyển giao khách hàng và nguyên tắc phối hợp cùng MBMC.",
    icon: "collaborator",
    status: "Đang hoàn thiện",
  },
  {
    href: "/chinh-sach/dai-ly",
    title: "Chính sách đại lý",
    description:
      "Nguyên tắc về nguồn hàng, bán sỉ và hoạt động hợp tác dành cho đại lý.",
    icon: "dealer",
    status: "Đang hoàn thiện",
  },
];

function PolicyCards({
  policies,
  group,
}: {
  policies: readonly PolicyCard[];
  group: "customer" | "partner";
}) {
  return (
    <div className={`policy-hub-grid policy-hub-grid--${group}`}>
      {policies.map((policy) => (
        <Link className="policy-hub-card" href={policy.href} key={policy.href}>
          <span className="policy-hub-card__icon">
            <PolicyHubIcon name={policy.icon} />
          </span>
          <div className="policy-hub-card__heading">
            <h3>{policy.title}</h3>
            {policy.status ? (
              <span className="policy-status">{policy.status}</span>
            ) : null}
          </div>
          <p>{policy.description}</p>
          <span className="policy-hub-card__action">
            Xem chi tiết <span aria-hidden="true">→</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function PolicyHubPage() {
  return (
    <PolicyPage
      eyebrow="Thông tin công khai"
      title="Chính sách MBMC"
      description="Các chính sách về bảo hành, MBMC Care và hoạt động hợp tác được tập hợp tại đây để bạn dễ tìm và đối chiếu."
      variant="hub"
    >
      <section
        className="policy-hub-group"
        aria-labelledby="customer-policy-heading"
      >
        <div className="policy-hub-section-heading">
          <h2 id="customer-policy-heading">Dành cho khách hàng</h2>
          <span aria-hidden="true" />
        </div>
        <PolicyCards policies={customerPolicies} group="customer" />
      </section>
      <section
        className="policy-hub-group"
        aria-labelledby="partner-policy-heading"
      >
        <div className="policy-hub-section-heading">
          <h2 id="partner-policy-heading">Dành cho đối tác</h2>
          <span aria-hidden="true" />
        </div>
        <PolicyCards policies={partnerPolicies} group="partner" />
      </section>
      <aside
        className="policy-hub-contact"
        aria-labelledby="policy-contact-heading"
      >
        <span className="policy-hub-contact__icon">
          <PolicyHubIcon name="chat" />
        </span>
        <div>
          <h2 id="policy-contact-heading">Cần xác nhận trực tiếp?</h2>
          <p>
            Nhắn MBMC để được xác nhận thông tin phù hợp với trường hợp của bạn.
          </p>
        </div>
        <ContactActionLink
          className="primary-action"
          label="Nhắn MBMC trên Zalo"
        />
      </aside>
    </PolicyPage>
  );
}
