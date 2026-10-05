# CTV Referral Routing

## Document status

- **State:** VERIFIED CURRENT STATE
- **Verified:** 2026-10-05
- **Scope:** public CTV ownership, contact-channel composition, persistence, and share links

This note is the website implementation reference for CTV referral routing.
`ARCHITECTURE.md` remains the repository-level technical entry point.

## Core contract

The routing model has two independent dimensions:

```text
ref = WHO owns the contact
channel = HOW that owner is contacted
```

- `ref=MBMC` is the locally registered house code and always resolves to MBMC without a partner RPC. Other valid codes identify a CTV contact owner by public `referral_code`. An absent,
  malformed, unknown, inactive, or failed referral falls back to MBMC.
- `channel` accepts `zalo` or `messenger`. An explicit channel is applied to
  the resolved owner, not globally to MBMC.
- With a valid CTV and no explicit channel, use the CTV's
  `preferred_channel`.
- With MBMC and no explicit channel, preserve the existing MBMC default,
  currently the canonical MBMC/personal Zalo behavior.

Canonical examples:

| URL context                      | Owner      | Channel/destination                       |
| -------------------------------- | ---------- | ----------------------------------------- |
| `https://mbmc.vn/`               | MBMC       | Existing MBMC default                     |
| `?channel=zalo`                  | MBMC       | MBMC Zalo                                 |
| `?channel=messenger`             | MBMC       | MBMC Messenger                            |
| `?ref=PYKB`                      | CTV `PYKB` | CTV preferred channel                     |
| `?ref=PYKB&channel=zalo`         | CTV `PYKB` | That CTV's Zalo                           |
| `?ref=PYKB&channel=messenger`    | CTV `PYKB` | That CTV's Facebook/Messenger destination |
| `?ref=INVALID&channel=zalo`      | MBMC       | MBMC Zalo                                 |
| `?ref=INVALID&channel=messenger` | MBMC       | MBMC Messenger                            |

## Public referral contract and resolver

A public referral code is exactly four characters from:

```text
ABCDEFGHJKMNPQRSTUVWXYZ23456789
```

The alphabet excludes `I`, `L`, `O`, `0`, and `1`. Examples include `PYKB`
and `2MDE`. The website trims input, uppercases it, and validates the exact
format before resolution. Phone-shaped referral values are obsolete and are
ignored safely.

Partner codes are resolved only through:

```sql
public.resolve_public_ctv_referral(p_referral_code text)
```

MBMC is reserved by the website and uses the canonical `MBMC_CONTACTS` configuration. It is not a CTV partner and is never sent to this RPC.

The browser calls this RPC with the anonymous public credential. It does not
read `ctv_partners` directly and does not use a service-role credential. The
public result contains only:

- `display_name`;
- `zalo_phone`;
- `facebook_contact_url`;
- `preferred_channel`.

## Persistence and precedence

The first-party cookie is `mbmc_ctv_referral` and stores the canonical
four-character referral code.

- lifetime: 30 days;
- path: `/`;
- `SameSite=Lax`;
- `Secure` in production.

Owner resolution order is:

1. valid current URL `ref`;
2. valid persisted referral cookie;
3. canonical MBMC house attribution.

A valid new URL referral, including MBMC, replaces the persisted owner. Explicit MBMC therefore clears a stale partner owner even if a partner lookup is in flight. An invalid new value
does not erase a valid persisted context. An obsolete phone-shaped cookie is
ignored without a resolver call. Cookie persistence allows the same browser to
navigate through clean internal URLs while retaining its contact owner.

A cookie does not travel when the address-bar URL is copied to another browser.
Shared links carry the resolved `ref` when partner ownership or an explicitly selected/persisted MBMC house context should travel with the link. Organic MBMC shares remain clean.

## Channel state and owner-scoped fallback

The existing `channel=zalo|messenger` URL and browser-storage behavior remains
separate from referral persistence. A CTV's `preferred_channel` is owner
configuration; it is not written into visitor channel attribution.

For a resolved CTV, destination fallback remains within that owner whenever
possible:

```text
requested channel on CTV
→ CTV preferred channel
→ CTV other valid configured destination
→ MBMC default only if the CTV has no usable destination
```

Do not fall back from an unavailable CTV Messenger destination to MBMC
Messenger, because that would unexpectedly change the contact owner.

## Canonical website architecture

CTV routing is centralized through:

- `ContactActionLink`;
- `useContactChannel` (one atomic external-store snapshot);
- `ContactAttributionObserver` (a narrow Suspense sibling in the sales layout);
- shared contact-routing helpers.

Inherited surfaces include the site header, homepage contact actions, Machine
hero/support/sticky actions, and policy contact actions. New primary-contact
surfaces should reuse this abstraction rather than add surface-specific CTV
conditionals.

## Shipped share behavior

Both referral-aware share surfaces consume the same resolved attribution as the CTAs. The canonical browsing ref defaults to MBMC; share ref remains null for organic house browsing. Explicit or persisted MBMC shares carry `ref=MBMC` to override stale partner cookies in the receiving browser. Internal ref propagation is restricted to `/`, `/may-dang-co`, `/may/...`, and `/chon-macbook`; Care, policies, people and software URLs remain clean. Inventory history updates preserve an explicit valid ref and channel even while a lookup is pending.

### Machine detail

The compact **Sao chép liên kết** action copies the canonical Machine URL. It
adds the resolved current or persisted `ref`, when present, and never
automatically adds `channel`.

```text
https://mbmc.vn/may/mbmc-8d5x?ref=PYKB
```

### Filtered inventory

The `/may-dang-co` copy action serializes the existing canonical inventory
state, preserving canonical search, facet, and non-default sort parameters. It
then adds the resolved current or persisted `ref` and omits `channel` and other
transient attribution parameters.

```text
https://mbmc.vn/may-dang-co?family=air&chip=m2&ram=8&ref=2MDE
```

These share links propagate contact ownership to a new customer/browser.
Channel is intentionally not propagated automatically because it represents a
temporary visitor/request choice rather than ownership.

## Accepted MVP limitation

Partner resolution remains client-side. Server rendering and initial hydration use the same immutable MBMC snapshot. MBMC itself resolves locally and synchronously when the browser URL is observed. The safe MBMC CTA can therefore appear briefly
while the RPC resolves. All subscribed surfaces switch label, destination, canonical ref, lead evidence and share context together. Request revisions discard late completions; RPC promises are keyed by code. No stale CTV identity is restored, resolver
failures do not crash public pages, and the existing MBMC contact remains
usable. This is accepted for the narrow MVP.

## Cross-repository ownership

`mbmc-care` owns:

- `ctv_partners` and CTV CRUD;
- referral-code generation;
- preferred/default channel configuration;
- the public-safe resolver RPC.

`muabanmacbookcu-web` owns:

- consuming the RPC;
- referral-cookie persistence;
- owner × channel composition and CTA routing;
- referral-aware Machine and inventory share links.

Do not add CTV-domain database migrations to this website repository.

## MVP boundary and future extension

The current MVP does not include lead analytics, commission, sale attribution,
a CTV dashboard or login, a consultant directory, advising-style matching, QR
codes, subdomains, or TikTok.

A future, non-binding direction may introduce public consultant/contact-owner
profiles and customer selection or matching by advising style. No schema or
implementation contract is approved for that direction.

## Lead evidence and scope

Demand capture exists in the chooser and zero-results inventory flow. Its existing API forwards `p_referral_evidence` to `create_captcha_soft_demand_v1`; backend validation and ownership remain authoritative. The browser now supplies the canonical successfully resolved partner code, or null for house/fallback/pending attribution. It no longer sends independently read raw URL/cookie values that could disagree with the contact owner. No schema, lead API contract, distributor accounting or commission calculation was changed. There is no general analytics SDK in this repository.

Channel storage is written to localStorage key `mbmc_contact_channel` for compatibility; the hook does not restore it. Explicit channel wins; otherwise partner preference or house Zalo applies. It is independent of the 30-day referral cookie.

See [public attribution audit](PUBLIC_ATTRIBUTION_AUDIT.md) for the reproduced failure, limitations and verification.
