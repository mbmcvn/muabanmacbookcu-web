import { PageState } from "@/components/ui/PageState";

export default function PublicMachineLoading() {
  return <PageState as="div" className="container public-detail-page" role="status" description="Đang tải hồ sơ máy…" />;
}
