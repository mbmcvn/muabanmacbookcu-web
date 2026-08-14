import type { Metadata } from "next";
import Link from "next/link";
import { CtvApplicationForm } from "@/components/ctv/CtvApplicationForm";
export const metadata: Metadata = {
  title: "Đăng ký CTV MBMC",
  alternates: { canonical: "/ctv/join" },
};
export default function Page() {
  return (
    <div className="ctv-join-page">
      <header>
        <p>CTV MBMC</p>
        <h1>Bạn không cần thuộc hàng chục đời MacBook.</h1>
        <p>
          Việc chính là tìm đúng người đang có nhu cầu, hiểu họ đang ở đâu trong
          quá trình mua và đưa họ vào đúng công cụ của MBMC.
        </p>
        <Link href="/chinh-sach/cong-tac-vien">
          Xem chính sách cộng tác viên
        </Link>
      </header>
      <CtvApplicationForm />
    </div>
  );
}
