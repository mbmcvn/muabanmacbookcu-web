"use client";

import type { ComponentProps } from "react";
import { MBMC_ZALO_URL } from "@/config/contact";
import { useContactChannel } from "@/hooks/useContactChannel";

type ContactActionLinkProps = Omit<
  ComponentProps<"a">,
  "aria-label" | "children" | "href" | "rel" | "target"
> & {
  compact?: boolean;
  label?: string;
};

export function ContactActionLink({
  compact = false,
  label: requestedLabel,
  ...props
}: ContactActionLinkProps) {
  const { compactContactLabel, contactLabel, contactUrl, ownerType } =
    useContactChannel();
  const label =
    (ownerType === "ctv" ? contactLabel : requestedLabel) ??
    (compact ? compactContactLabel : "Nhắn MBMC xác nhận máy");

  return (
    <a
      {...props}
      href={contactUrl ?? MBMC_ZALO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {compact ? (
        <svg
          aria-hidden="true"
          className="contact-action-icon"
          fill="none"
          focusable="false"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.4-4.2A9 9 0 1 1 21 12Z" />
        </svg>
      ) : null}
      {label}
    </a>
  );
}
