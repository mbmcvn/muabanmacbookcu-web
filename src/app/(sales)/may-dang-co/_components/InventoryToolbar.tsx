import type { InventorySort } from "@/data/machines/public-inventory-query";

export type { InventorySort };

export function InventoryToolbar({ total, sort, onSortChange }: { total: number; sort: InventorySort; onSortChange: (sort: InventorySort) => void }) {
  return <div className="inventory-toolbar"><p><strong>{total}</strong> kết quả</p><label>Sắp xếp<span className="visually-hidden"> danh sách máy</span><select value={sort} onChange={(event) => onSortChange(event.target.value as InventorySort)}><option value="relevance">Phù hợp nhất</option><option value="newest">Mới nhập</option><option value="price-asc">Giá thấp đến cao</option><option value="price-desc">Giá cao đến thấp</option></select></label></div>;
}
