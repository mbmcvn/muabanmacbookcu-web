export const quickFilters = ["Tất cả", "Dưới 15 triệu", "15–18 triệu", "Trên 18 triệu", "MacBook Air", "MacBook Pro", "16GB RAM"] as const;

export type QuickFilter = (typeof quickFilters)[number];

export function InventoryFilters({ active, onChange }: { active: QuickFilter; onChange: (filter: QuickFilter) => void }) {
  return <div className="quick-filters" aria-label="Lọc nhanh danh sách máy">{quickFilters.map((filter) => <button key={filter} type="button" aria-pressed={active === filter} onClick={() => onChange(filter)}>{filter}</button>)}</div>;
}
