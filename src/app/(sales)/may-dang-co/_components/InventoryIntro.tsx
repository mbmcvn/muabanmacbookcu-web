export function InventoryIntro({ total }: { total: number }) {
  return <header className="inventory-intro"><h1>Mac đang có</h1><p>Danh sách những chiếc Mac đã được MBMC kiểm định và sẵn sàng bàn giao.</p><p className="inventory-signal"><span aria-hidden="true" />{total} máy đang có · Cập nhật trực tiếp</p></header>;
}
