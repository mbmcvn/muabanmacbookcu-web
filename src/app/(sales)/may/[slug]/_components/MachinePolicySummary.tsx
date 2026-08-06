"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { PublicMachineDetailV1 } from "@/models";
import {
  machinePolicyAnalyticsPayload,
  trackMachinePolicyEvent,
  type MachinePolicyAnalyticsEvent,
} from "@/lib/analytics/machine-policy";

function isInternalUrl(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export function MachinePolicySummary({
  machine,
}: {
  machine: PublicMachineDetailV1;
}) {
  const policy = machine.policySummary;
  const items = policy
    ? [...policy.warrantyItems, policy.careWording, policy.machineIdWording]
    : [];
  const payload = machinePolicyAnalyticsPayload({
    publicMachineId: machine.summary.code,
    machineSlug: machine.summary.slug,
    ...(policy ? { policyVersion: policy.policyVersion } : {}),
    hasCareWording: Boolean(policy),
  });

  useEffect(() => {
    if (policy && items.length)
      trackMachinePolicyEvent("machine_policy_summary_viewed", payload);
  }, [items.length, payload, policy]);

  if (!policy) return null;

  const policyLink = (
    href: string,
    label: string,
    event: MachinePolicyAnalyticsEvent,
  ) => {
    const props = {
      "aria-label": `${label} cho ${machine.summary.code}`,
      onClick: () => trackMachinePolicyEvent(event, payload),
    };
    return isInternalUrl(href) ? (
      <Link href={href} {...props}>
        {label}
      </Link>
    ) : (
      <a href={href} {...props}>
        {label}
      </a>
    );
  };

  return (
    <section
      className="detail-section machine-policy-summary"
      aria-labelledby="machine-policy-heading"
    >
      <header>
        <p className="eyebrow">Bảo hành và chăm sóc</p>
        <h2 id="machine-policy-heading">{policy.title}</h2>
      </header>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <nav aria-label="Tài liệu chính sách của máy">
        {policyLink(
          policy.warrantyPolicyUrl,
          "Chính sách bảo hành",
          "machine_warranty_policy_clicked",
        )}
        {policyLink(
          policy.carePolicyUrl,
          "MBMC Care",
          "machine_care_policy_clicked",
        )}
      </nav>
    </section>
  );
}
