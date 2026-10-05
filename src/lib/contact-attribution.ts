import {
  canonicalReferralCode,
  DEFAULT_REFERRAL_CONTEXT,
  HOUSE_REFERRAL_CODE,
  resolveContact,
  registeredReferralContext,
  resolveReferralContext,
  type CtvContactOwner,
  type ReferralContext,
} from "./contact-routing.ts";
import type { ContactChannel } from "../hooks/useContactChannel.ts";

export const CTV_REFERRAL_COOKIE = "mbmc_ctv_referral";
export const CONTACT_CHANNEL_STORAGE_KEY = "mbmc_contact_channel";
export function resolveContactChannel(value: string | null): ContactChannel {
  return value === "zalo" || value === "messenger" ? value : null;
}

export function contactAttributionSnapshot(context: ReferralContext, channel: ContactChannel) {
  const contact = resolveContact(context.owner, channel);
  return {
    channel,
    referralCode: context.referralCode,
    shareReferralCode: context.shareReferralCode,
    referralEvidence: context.referralEvidence,
    ownerType: contact.ownerType,
    contactUrl: contact.href,
    contactLabel: contact.label,
    compactContactLabel: contact.ownerType === "ctv" ? contact.label : channel === "messenger" ? "Nhắn Messenger" : channel === "zalo" ? "Nhắn Zalo" : "Nhắn MBMC",
  };
}
export const SERVER_CONTACT_SNAPSHOT = contactAttributionSnapshot(DEFAULT_REFERRAL_CONTEXT, null);

/** One atomic snapshot drives CTAs, evidence and shares; late requests cannot replace a newer URL. */
export function createContactAttributionStore() {
  let snapshot = SERVER_CONTACT_SNAPSHOT;
  let requestKey: string | undefined;
  let revision = 0;
  const listeners = new Set<() => void>();
  const publish = (next: typeof snapshot) => {
    snapshot = next;
    listeners.forEach(listener => listener());
  };
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_CONTACT_SNAPSHOT,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async synchronize(search: string, persisted: string | null, lookup: (code: string) => Promise<CtvContactOwner | null>, persist: (code: string) => void) {
      const params = new URLSearchParams(search);
      const current = params.get("ref");
      const channel = resolveContactChannel(params.get("channel"));
      const currentCode = current === null ? null : canonicalReferralCode(current);
      const persistedCode = persisted === null ? null : canonicalReferralCode(persisted);
      const candidate = currentCode ?? persistedCode ?? HOUSE_REFERRAL_CODE;
      const key = JSON.stringify([current, channel, persistedCode]);
      if (key === requestKey) return;
      requestKey = key;
      const thisRevision = ++revision;
      if (candidate === HOUSE_REFERRAL_CODE) {
        const context = currentCode || persistedCode
          ? registeredReferralContext(candidate, currentCode === candidate)!
          : DEFAULT_REFERRAL_CONTEXT;
        if (context.referralToPersist) {
          try { persist(context.referralToPersist); } catch { /* Cookies may be unavailable. */ }
        }
        publish(contactAttributionSnapshot(context, channel));
        return;
      }
      // Immediately remove stale partner presentation/evidence while a different owner resolves.
      if (candidate !== snapshot.referralCode) publish(contactAttributionSnapshot(DEFAULT_REFERRAL_CONTEXT, channel));
      const context = await resolveReferralContext(current, persisted, lookup);
      if (thisRevision !== revision) return;
      if (context.referralToPersist) {
        try { persist(context.referralToPersist); } catch { /* Cookies may be unavailable. */ }
      }
      publish(contactAttributionSnapshot(context, channel));
    },
  };
}

/** Deduplicate only the same code, never an unrelated in-flight referral lookup. */
export function createReferralLookup(lookup: (code: string) => Promise<CtvContactOwner | null>) {
  const cache = new Map<string, CtvContactOwner | null>();
  const pending = new Map<string, Promise<CtvContactOwner | null>>();
  return (code: string): Promise<CtvContactOwner | null> => {
    if (cache.has(code)) return Promise.resolve(cache.get(code) ?? null);
    const existing = pending.get(code);
    if (existing) return existing;
    const request = Promise.resolve().then(() => lookup(code)).then(owner => {
      cache.set(code, owner);
      return owner;
    }).catch(() => null).finally(() => { pending.delete(code); });
    pending.set(code, request);
    return request;
  };
}
