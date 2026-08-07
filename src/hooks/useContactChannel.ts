"use client";

import { useEffect, useState } from "react";
import {
  resolveContact,
  resolveReferralContext,
  type CtvContactOwner,
} from "../lib/contact-routing.ts";

export type ContactChannel = "zalo" | "messenger" | null;

const STORAGE_KEY = "mbmc_contact_channel";
export const CTV_REFERRAL_COOKIE = "mbmc_ctv_referral";
const CTV_REFERRAL_MAX_AGE = 60 * 60 * 24 * 30;

type RpcRow = {
  display_name?: unknown;
  zalo_phone?: unknown;
  facebook_contact_url?: unknown;
  preferred_channel?: unknown;
};

let cachedReferralCode: string | null | undefined;
let cachedOwner: CtvContactOwner | null = null;
let pendingReferral: Promise<CtvContactOwner | null> | null = null;

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const part = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix));
  return part ? decodeURIComponent(part.slice(prefix.length)) : null;
}

function persistReferral(value: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  document.cookie = `${CTV_REFERRAL_COOKIE}=${encodeURIComponent(value)}; Max-Age=${CTV_REFERRAL_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
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

async function resolveReferral(
  referralCode: string,
): Promise<CtvContactOwner | null> {
  if (cachedReferralCode === referralCode) return cachedOwner;
  if (pendingReferral) return pendingReferral;
  pendingReferral = (async () => {
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
      cachedReferralCode = referralCode;
      cachedOwner = parseRpcOwner(rows[0]);
      return cachedOwner;
    } catch {
      console.error("[ctv-referral]", { stage: "resolve_failed" });
      return null;
    } finally {
      pendingReferral = null;
    }
  })();
  return pendingReferral;
}

export function resolveContactChannel(value: string | null): ContactChannel {
  return value === "zalo" || value === "messenger" ? value : null;
}

export function compactContactLabel(channel: ContactChannel): string {
  if (channel === "messenger") return "Nhắn Messenger";
  if (channel === "zalo") return "Nhắn Zalo";
  return "Nhắn MBMC";
}

export function withContactChannel(
  pathname: string,
  channel: ContactChannel,
): string {
  if (!channel) return pathname;
  return `${pathname}${pathname.includes("?") ? "&" : "?"}channel=${channel}`;
}

export function useContactChannel() {
  const [channel, setChannel] = useState<ContactChannel>(null);
  const [owner, setOwner] = useState<CtvContactOwner | null>(cachedOwner);

  useEffect(() => {
    const urlValue = new URLSearchParams(window.location.search).get("channel");
    const urlReferral = new URLSearchParams(window.location.search).get("ref");
    const urlChannel = resolveContactChannel(urlValue);
    let nextChannel: ContactChannel = null;
    if (urlChannel) {
      localStorage.setItem(STORAGE_KEY, urlChannel);
      nextChannel = urlChannel;
    }
    const timeout = window.setTimeout(() => setChannel(nextChannel), 0);
    let cancelled = false;
    void (async () => {
      const persisted = readCookie(CTV_REFERRAL_COOKIE);
      const context = await resolveReferralContext(
        urlReferral,
        persisted,
        resolveReferral,
      );
      if (context.referralToPersist) persistReferral(context.referralToPersist);
      if (!cancelled && context.owner) setOwner(context.owner);
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const contact = resolveContact(owner, channel);

  return {
    channel,
    ownerType: contact.ownerType,
    contactUrl: contact.href,
    contactLabel: contact.label,
    compactContactLabel:
      contact.ownerType === "ctv"
        ? contact.label
        : compactContactLabel(channel),
  };
}
