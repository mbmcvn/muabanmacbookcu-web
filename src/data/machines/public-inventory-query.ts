import type { PublicMachineSummaryV1 } from "../../lib/public-projection/contracts.ts";

export type PublicInventoryFilter = "Tất cả" | "Dưới 15 triệu" | "15–18 triệu" | "Trên 18 triệu" | "MacBook Air" | "MacBook Pro" | "16GB RAM";
export type PublicInventorySort = "relevance" | "newest" | "price-asc" | "price-desc";

export function filterAndSortPublicInventory(machines: PublicMachineSummaryV1[], query: string, filter: PublicInventoryFilter, sort: PublicInventorySort) {
  const terms=query.toLocaleLowerCase("vi").trim().split(/\s+/).filter(Boolean);
  return machines.filter(machine=>{
    const searchable=[machine.displayName,machine.code,machine.family,machine.chip,machine.ramGb===null?"":`${machine.ramGb}gb ram`,machine.ssdGb===null?"":`${machine.ssdGb}gb ssd`,machine.color].join(" ").toLocaleLowerCase("vi");
    const price=machine.price.amount;
    return terms.every(term=>searchable.includes(term)) && (filter==="Tất cả"||(filter==="Dưới 15 triệu"&&price<15_000_000)||(filter==="15–18 triệu"&&price>=15_000_000&&price<=18_000_000)||(filter==="Trên 18 triệu"&&price>18_000_000)||(filter==="MacBook Air"&&machine.family==="Air")||(filter==="MacBook Pro"&&machine.family==="Pro")||(filter==="16GB RAM"&&machine.ramGb===16));
  }).toSorted((a,b)=>{
    if(sort==="newest"){const order=Date.parse(b.publishedAt??"")-Date.parse(a.publishedAt??"");if(order)return order;}
    if(sort==="price-asc"){const order=a.price.amount-b.price.amount;if(order)return order;}
    if(sort==="price-desc"){const order=b.price.amount-a.price.amount;if(order)return order;}
    return a.slug.localeCompare(b.slug);
  });
}