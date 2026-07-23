import Link from "next/link";
import { PageState } from "@/components/ui/PageState";

export default function NotFound() {
  return <PageState as="main" className="container page-shell" title="Không tìm thấy trang" titleAs="h1" description="Địa chỉ này không tồn tại hoặc đã thay đổi."><Link href="/may-dang-co">Xem máy đang có</Link></PageState>;
}
