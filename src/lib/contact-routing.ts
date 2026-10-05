import type { ContactChannel } from "@/hooks/useContactChannel";

export type CtvContactOwner = Readonly<{
  displayName: string;
  zaloPhone: string | null;
  facebookContactUrl: string | null;
  preferredChannel: ContactChannel;
}>;

export type ResolvedContact = Readonly<{
  ownerType: "mbmc" | "ctv";
  channel: Exclude<ContactChannel, null>;
  label: string;
  href: string;
}>;

export const MBMC_CONTACTS = {
  zalo: { href: "https://zalo.me/0326147088", label: "Nhắn MBMC trên Zalo" },
  messenger: {
    href: "https://m.me/61592174842507",
    label: "Nhắn MBMC trên Messenger",
  },
} as const;

function validPhone(value: string | null): string | null {
  return value && /^[0-9]{9,15}$/.test(value) ? value : null;
}

export function validFacebookContactUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const hosts = new Set([
      "facebook.com",
      "www.facebook.com",
      "m.facebook.com",
      "mbasic.facebook.com",
      "m.me",
      "www.m.me",
    ]);
    return url.protocol === "https:" &&
      hosts.has(url.hostname.toLowerCase()) &&
      !url.username &&
      !url.password &&
      !url.port &&
      url.pathname.length > 1
      ? value
      : null;
  } catch {
    return null;
  }
}

function ctvDestination(
  owner: CtvContactOwner,
  channel: Exclude<ContactChannel, null>,
) {
  if (channel === "zalo") {
    const phone = validPhone(owner.zaloPhone);
    return phone
      ? {
          channel,
          href: `https://zalo.me/${phone}`,
          label: `Nhắn ${owner.displayName} trên Zalo`,
        }
      : null;
  }
  const href = validFacebookContactUrl(owner.facebookContactUrl);
  return href
    ? { channel, href, label: `Nhắn ${owner.displayName} trên Messenger` }
    : null;
}

export function resolveContact(
  owner: CtvContactOwner | null,
  explicitChannel: ContactChannel,
): ResolvedContact {
  if (!owner) {
    const channel = explicitChannel ?? "zalo";
    return { ownerType: "mbmc", channel, ...MBMC_CONTACTS[channel] };
  }

  const requested = explicitChannel ?? owner.preferredChannel ?? "zalo";
  const candidates = [
    requested,
    owner.preferredChannel,
    requested === "zalo" ? "messenger" : "zalo",
  ].filter(
    (value, index, values): value is "zalo" | "messenger" =>
      value !== null && values.indexOf(value) === index,
  );
  for (const channel of candidates) {
    const destination = ctvDestination(owner, channel);
    if (destination) return { ownerType: "ctv", ...destination };
  }

  return { ownerType: "mbmc", channel: "zalo", ...MBMC_CONTACTS.zalo };
}

export function canonicalReferralCode(value: string): string | null {
  const code = value.trim().toUpperCase();
  return /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/.test(code) ? code : null;
}

export const HOUSE_REFERRAL_CODE = "MBMC";

export type ReferralContext = Readonly<{
  owner: CtvContactOwner | null;
  referralCode: string;
  referralToPersist: string | null;
  shareReferralCode: string | null;
  referralEvidence: string | null;
}>;

export const DEFAULT_REFERRAL_CONTEXT: ReferralContext = {
  owner: null,
  referralCode: HOUSE_REFERRAL_CODE,
  referralToPersist: null,
  shareReferralCode: null,
  referralEvidence: null,
};

/** The house code is registered locally; partners remain RPC-owned. */
export function registeredReferralContext(code: string, explicit: boolean): ReferralContext | null {
  return code === HOUSE_REFERRAL_CODE
    ? { ...DEFAULT_REFERRAL_CONTEXT, shareReferralCode: code, referralToPersist: explicit ? code : null }
    : null;
}

export async function resolveReferralContext(
  currentReferral: string | null,
  persistedReferral: string | null,
  lookup: (referral: string) => Promise<CtvContactOwner | null>,
): Promise<ReferralContext> {
  const resolve = async (raw: string | null, explicit: boolean): Promise<ReferralContext | null> => {
    const code = raw === null ? null : canonicalReferralCode(raw);
    if (!code) return null;
    const registered = registeredReferralContext(code, explicit);
    if (registered) return registered;
    try {
      const owner = await lookup(code);
      if (owner && resolveContact(owner, null).ownerType === "ctv") {
        return { owner, referralCode: code, referralToPersist: explicit ? code : null, shareReferralCode: code, referralEvidence: code };
      }
    } catch { /* A failed public lookup cannot break browsing. */ }
    return null;
  };
  return await resolve(currentReferral, true) ?? await resolve(persistedReferral, false) ?? DEFAULT_REFERRAL_CONTEXT;
}

/** Only the existing sales funnel carries explicit ownership in internal URLs. */
export function withFunnelReferral(pathname: string, referralCode: string | null): string {
  const url = new URL(pathname, "https://mbmc.vn");
  if (!pathname.startsWith("/") || pathname.startsWith("//") ||
      !(url.pathname === "/" || url.pathname === "/may-dang-co" || url.pathname === "/chon-macbook" || url.pathname.startsWith("/may/"))) return pathname;
  const code = referralCode ? canonicalReferralCode(referralCode) : null;
  if (code) url.searchParams.set("ref", code);
  return url.pathname + url.search + url.hash;
}

/** Keep explicit URL intent while a partner RPC is still pending during filter edits. */
export function referralForQueryUpdate(search: string, resolvedShareCode: string | null): string | null {
  const requested = new URLSearchParams(search).get("ref");
  return (requested === null ? null : canonicalReferralCode(requested)) ?? resolvedShareCode;
}

export function buildMachineShareUrl(
  canonicalUrl: string,
  referralCode: string | null,
): string {
  return buildReferralShareUrl(canonicalUrl, referralCode);
}

export function buildReferralShareUrl(
  canonicalUrl: string,
  referralCode: string | null,
): string {
  const url = new URL(canonicalUrl);
  url.searchParams.delete("ref");
  url.searchParams.delete("channel");
  const code = referralCode ? canonicalReferralCode(referralCode) : null;
  if (code) url.searchParams.set("ref", code);
  return url.toString();
}

export async function copyMachineShareUrl(
  canonicalUrl: string,
  referralCode: string | null,
  writeText: (value: string) => Promise<void>,
): Promise<boolean> {
  try {
    await writeText(buildReferralShareUrl(canonicalUrl, referralCode));
    return true;
  } catch {
    return false;
  }
}
