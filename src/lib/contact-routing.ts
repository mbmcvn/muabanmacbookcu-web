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

export async function resolveReferralContext(
  currentReferral: string | null,
  persistedReferral: string | null,
  lookup: (referral: string) => Promise<CtvContactOwner | null>,
): Promise<{
  owner: CtvContactOwner | null;
  referralToPersist: string | null;
}> {
  if (currentReferral !== null) {
    const code = canonicalReferralCode(currentReferral);
    if (code) {
      const owner = await lookup(code);
      if (owner) return { owner, referralToPersist: code };
    }
  }
  if (persistedReferral) {
    const code = canonicalReferralCode(persistedReferral);
    if (code) {
      const owner = await lookup(code);
      if (owner) return { owner, referralToPersist: null };
    }
  }
  return { owner: null, referralToPersist: null };
}
