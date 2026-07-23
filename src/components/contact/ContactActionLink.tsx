"use client";

import type { ComponentProps } from "react";
import { MBMC_ZALO_URL } from "@/config/contact";
import { useContactChannel } from "@/hooks/useContactChannel";

type ContactActionLinkProps = Omit<
  ComponentProps<"a">,
  "aria-label" | "children" | "href" | "rel" | "target"
>;

export function ContactActionLink(props: ContactActionLinkProps) {
  const { contactUrl, contactLabel } = useContactChannel();
  const label = contactLabel ?? "Nhắn MBMC xác nhận máy";

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
