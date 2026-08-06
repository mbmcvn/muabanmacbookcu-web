"use client";

import { useId, useState } from "react";
import type { PublicMachineDetailV1 } from "@/models";
import {
  buildSpecificationGroups,
  buildSpecificationSummary,
  specificationsForMachine,
} from "./technical-specifications-presentation";

export function PublicSpecifications({ machine }: { machine: PublicMachineDetailV1 }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const specifications = specificationsForMachine(machine);
  const summary = buildSpecificationSummary(specifications);
  const groups = buildSpecificationGroups(specifications);
  if (!groups.length) return null;

  return <section className="machine-specifications" aria-labelledby={`${panelId}-heading`}>
    <button className="machine-specifications__trigger" type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setIsOpen((open) => !open)}>
      <span className="machine-specifications__heading"><strong id={`${panelId}-heading`}>Cấu hình và thông số chi tiết</strong><span>Thông tin phần cứng và đặc tính của phiên bản này</span></span>
      <span className="machine-specifications__chevron" aria-hidden="true">⌄</span>
    </button>
    {summary.length ? <dl className="machine-specifications__summary">{summary.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl> : null}
    <div id={panelId} hidden={!isOpen} className="machine-specifications__panel">
      {groups.map((group, index) => <section key={group.title} aria-labelledby={`${panelId}-group-${index}`}><h3 id={`${panelId}-group-${index}`}>{group.title}</h3><dl>{group.rows.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>)}
    </div>
  </section>;
}

export function ExpertSummary({ machine }: { machine: PublicMachineDetailV1 }) {
  if (!machine.expertSummary) return null;
  return <section className="detail-section expert-summary" aria-labelledby="expert-summary-heading"><header><p className="eyebrow">Nhận định của con người</p><h2 id="expert-summary-heading">Đánh giá từ MBMC</h2><p>{machine.expertSummary}</p></header></section>;
}
