import { PageState } from "@/components/ui/PageState";

export default function InventoryLoading() {
  return <PageState as="div" className="container page-shell" role="status" description="Đang tải danh sách máy…" />;
}
