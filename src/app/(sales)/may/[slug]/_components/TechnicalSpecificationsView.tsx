import type { TechnicalSpecifications } from "@/models";

export function TechnicalSpecificationsView({ specifications }: { specifications: TechnicalSpecifications }) { return <section className="section"><h2>Thông số kỹ thuật đầy đủ</h2>{specifications.groups.map((group) => <section key={group.title}><h3>{group.title}</h3><dl>{group.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>)}</section>; }
