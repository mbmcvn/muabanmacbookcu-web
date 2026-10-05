"use client";

import { useSyncExternalStore } from "react";
import { withFunnelReferral, type CtvContactOwner } from "../lib/contact-routing.ts";
import {
  CONTACT_CHANNEL_STORAGE_KEY,
  CTV_REFERRAL_COOKIE,
  createContactAttributionStore,
  createReferralLookup,
  resolveContactChannel,
} from "../lib/contact-attribution.ts";
export { CTV_REFERRAL_COOKIE, resolveContactChannel } from "../lib/contact-attribution.ts";
export type ContactChannel = "zalo" | "messenger" | null;

type RpcRow = { display_name?: unknown; zalo_phone?: unknown; facebook_contact_url?: unknown; preferred_channel?: unknown };
const store = createContactAttributionStore();
const CTV_REFERRAL_MAX_AGE = 60 * 60 * 24 * 30;

function readReferralCookie(): string | null {
  try {
    const part = document.cookie.split(";").map(value => value.trim()).find(value => value.startsWith(CTV_REFERRAL_COOKIE + "="));
    return part ? decodeURIComponent(part.slice(CTV_REFERRAL_COOKIE.length + 1)) : null;
  } catch { return null; }
}
function persistReferral(value: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = CTV_REFERRAL_COOKIE + "=" + encodeURIComponent(value) + "; Max-Age=" + CTV_REFERRAL_MAX_AGE + "; Path=/; SameSite=Lax" + secure;
}

function parseRpcOwner(row: RpcRow | undefined): CtvContactOwner | null {
  if (!row || typeof row.display_name !== "string" || !row.display_name.trim())
    return null;
  return {
    displayName: row.display_name.trim(),
    zaloPhone: typeof row.zalo_phone === "string" ? row.zalo_phone : null,
    facebookContactUrl:
      typeof row.facebook_contact_url === "string"
        ? row.facebook_contact_url
        : null,
    preferredChannel:
      row.preferred_channel === "facebook"
        ? "messenger"
        : row.preferred_channel === "zalo"
          ? "zalo"
          : null,
  };
}

const resolveReferral = createReferralLookup(async (referralCode: string): Promise<CtvContactOwner | null> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    try {
      const response = await fetch(
        `${url}/rest/v1/rpc/resolve_public_ctv_referral`,
        {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ p_referral_code: referralCode }),
        },
      );
      if (!response.ok)
        throw new Error(`CTV referral RPC returned ${response.status}`);
      const rows = (await response.json()) as RpcRow[];
      return parseRpcOwner(rows[0]);
    } catch {
      console.error("[ctv-referral]", { stage: "resolve_failed" });
      throw new Error("Public referral lookup unavailable");
    }
});

export function synchronizeContactAttribution(search: string) {
  const params = new URLSearchParams(search);
  const channel = resolveContactChannel(params.get("channel"));
  if (channel) {
    try { localStorage.setItem(CONTACT_CHANNEL_STORAGE_KEY, channel); } catch { /* Storage is optional. */ }
  }
  return store.synchronize(search, readReferralCookie(), resolveReferral, persistReferral);
}

export function compactContactLabel(channel: ContactChannel): string {
  return channel === "messenger" ? "Nhắn Messenger" : channel === "zalo" ? "Nhắn Zalo" : "Nhắn MBMC";
}

export function withContactChannel(pathname: string, channel: ContactChannel, referralCode: string | null = null): string {
  const attributed = withFunnelReferral(pathname, referralCode);
  if (!channel) return attributed;
  const url = new URL(attributed, "https://mbmc.vn");
  url.searchParams.set("channel", channel);
  return url.pathname + url.search + url.hash;
}

export function useContactChannel() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
