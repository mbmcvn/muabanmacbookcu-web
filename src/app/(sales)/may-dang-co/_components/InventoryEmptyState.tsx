import { PageState } from "@/components/ui/PageState";

export function InventoryEmptyState() {
  return <PageState className="inventory-state" title="No machines currently match these filters." description="Thử thay đổi bộ lọc hoặc nhắn MBMC để tìm cấu hình phù hợp." />;
}

export function NoPublishedMachinesState() {
  return <PageState className="inventory-state" title="Hiện chưa có máy đủ điều kiện công khai." description="Máy sẽ xuất hiện tại đây sau khi hoàn tất kiểm tra, duyệt nội dung và xuất bản." />;
}
