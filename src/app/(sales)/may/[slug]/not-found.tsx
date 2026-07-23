import Link from "next/link";
import { PageState } from "@/components/ui/PageState";

export default function PublicMachineNotFound() {
  return <PageState as="div" className="container public-detail-page" title="Không tìm thấy máy" titleAs="h1" description="Máy này không tồn tại hoặc không còn được công khai."><Link href="/may-dang-co">Quay lại máy đang có</Link></PageState>;
}
