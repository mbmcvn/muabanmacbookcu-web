import type { PassportFact } from "@/models";

export function PassportFacts({ facts }: { facts: PassportFact[] }) {
  if (facts.length === 0) return null;
  return <section><h3>Thông tin xác thực</h3><dl>{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl></section>;
}
