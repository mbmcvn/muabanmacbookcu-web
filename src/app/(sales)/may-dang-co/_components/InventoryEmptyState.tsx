export function InventoryEmptyState() {
  return <section className="inventory-state"><h2>No machines currently match these filters.</h2><p>Thử thay đổi bộ lọc hoặc nhắn MBMC để tìm cấu hình phù hợp.</p></section>;
}

export function NoPublishedMachinesState() {
  return <section className="inventory-state"><h2>Hiện chưa có máy đủ điều kiện công khai.</h2><p>Máy sẽ xuất hiện tại đây sau khi hoàn tất kiểm tra, duyệt nội dung và xuất bản.</p></section>;
}