"use client";

import type { ComponentProps } from "react";
import { MBMC_ZALO_URL } from "@/config/contact";
import { useContactChannel } from "@/hooks/useContactChannel";

type ContactActionLinkProps = Omit<
  ComponentProps<"a">,
  "aria-label" | "children" | "href" | "rel" | "target"
> & {
  label?: string;
};

export function ContactActionLink({ label: requestedLabel, ...props }: ContactActionLinkProps) {
  const { contactUrl, contactLabel } = useContactChannel();
  const label = requestedLabel ?? contactLabel ?? "Nhắn MBMC xác nhận máy";

  return (
    <a
      {...props}
      href={contactUrl ?? MBMC_ZALO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {label}
    </a>
  );
}
