import {
  emptyInventoryFacets,
  type InventoryFacets,
} from "@/data/machines/public-inventory-query";
import { buildInventoryHeading } from "./inventory-heading";

export function InventoryIntro({ total, facets = emptyInventoryFacets() }: {
  total: number;
  facets?: InventoryFacets;
}) {
  const heading = buildInventoryHeading(facets);
  return (
    <header className="inventory-intro">
      <h1>
        {heading.prefix}
        {heading.descriptor ? <> <span className="inventory-heading-descriptor">{heading.descriptor}</span></> : null}
        {" đang có"}
      </h1>
      <p className="inventory-signal"><span aria-hidden="true" />{total} máy đang có · Cập nhật trực tiếp</p>
      <p>Danh sách những chiếc Mac đã được MBMC kiểm định và sẵn sàng bàn giao.</p>
    </header>
  );
}
