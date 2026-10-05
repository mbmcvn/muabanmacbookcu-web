"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { synchronizeContactAttribution } from "@/hooks/useContactChannel";

/** Next navigation includes native inventory history updates and browser back/forward. */
export function ContactAttributionObserver() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => { void synchronizeContactAttribution(search); }, [pathname, search]);
  return null;
}
