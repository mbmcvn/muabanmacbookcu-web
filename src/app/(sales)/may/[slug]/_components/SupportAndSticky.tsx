"use client";

import { useEffect, useState } from "react";
import type { PublicMachineDetailV1 } from "@/models";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { publicSalesPolicies } from "@/config/public-sales-policies";
import { formatCurrencyVnd, formatPublicMachineDisplayName, formatPublicMachineSpecs } from "@/lib/presentation";

export function PoliciesAndSupport({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  return <section id="lien-he-mbmc" className="detail-section support-section" aria-labelledby="support-heading"><div><p className="eyebrow">Bàn giao và hỗ trợ</p><h2 id="support-heading">Nếu bạn vẫn chưa chắc chắn</h2><p>Hãy nói với MBMC điều còn khiến bạn phân vân. MBMC sẽ trao đổi trực tiếp về chiếc máy này trước khi bạn quyết định.</p><ul>{publicSalesPolicies.map((policy) => <li key={policy}>{policy}</li>)}</ul></div><div className="support-contact"><p>Trao đổi về đúng chiếc máy</p><strong>{summary.code}</strong><span>{displayName}</span><ContactActionLink className="primary-action" /></div></section>;
}

export function shouldShowStickyContact({
  heroContactVisible,
  finalPanelVisible,
}: {
  heroContactVisible: boolean;
  finalPanelVisible: boolean;
}) {
  return !heroContactVisible && !finalPanelVisible;
}

export function PublicMachineStickyBar({ machine }: { machine: PublicMachineDetailV1 }) {
  const [isVisible, setIsVisible] = useState(false);
  const summary = machine.summary;
  const displayName = formatPublicMachineDisplayName(summary.displayName);
  const specs = formatPublicMachineSpecs({ chip: summary.chip, ramGb: summary.ramGb, storageGb: summary.ssdGb });

  useEffect(() => {
    const heroContact = document.getElementById("machine-hero-contact-action");
    const finalPanel = document.getElementById("lien-he-mbmc");
    if (!heroContact || !finalPanel) return;

    const visibility = {
      heroContactVisible: false,
      finalPanelVisible: false,
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === heroContact) {
          visibility.heroContactVisible = entry.isIntersecting;
        }
        if (entry.target === finalPanel) {
          visibility.finalPanelVisible = entry.isIntersecting;
        }
      }
      setIsVisible(shouldShowStickyContact(visibility));
    });

    observer.observe(heroContact);
    observer.observe(finalPanel);
    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;
  return <aside className="public-machine-sticky" aria-label={`Quan tâm ${summary.code}`}><div className="public-machine-sticky-identity"><strong>{displayName}</strong>{specs ? <span className="public-machine-sticky-specs">{specs}</span> : null}</div><span className="public-machine-sticky-price">{formatCurrencyVnd(summary.price)}</span><ContactActionLink /></aside>;
}
