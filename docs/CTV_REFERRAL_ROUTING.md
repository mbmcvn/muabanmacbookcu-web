# CTV Referral Routing

## Document status

- **State:** VERIFIED CURRENT STATE
- **Verified:** 2026-08-09
- **Scope:** public CTV ownership, contact-channel composition, persistence, and share links

This note is the website implementation reference for CTV referral routing.
`ARCHITECTURE.md` remains the repository-level technical entry point.

## Core contract

The routing model has two independent dimensions:

```text
ref = WHO owns the contact
channel = HOW that owner is contacted
```

- `ref` identifies a CTV contact owner by public `referral_code`. An absent,
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

The only resolver is:

```sql
public.resolve_public_ctv_referral(p_referral_code text)
```

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
3. MBMC.

A valid new URL referral replaces the persisted owner. An invalid new value
does not erase a valid persisted context. An obsolete phone-shaped cookie is
ignored without a resolver call. Cookie persistence allows the same browser to
navigate through clean internal URLs while retaining its CTV owner.

A cookie does not travel when the address-bar URL is copied to another browser.
Shared links must therefore carry `ref` explicitly when CTV ownership should
travel with the link.

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
- `useContactChannel`;
- shared contact-routing helpers.

Inherited surfaces include the site header, homepage contact actions, Machine
hero/support/sticky actions, and policy contact actions. New primary-contact
surfaces should reuse this abstraction rather than add surface-specific CTV
conditionals.

## Shipped share behavior

Both referral-aware share surfaces are implemented in the current worktree.

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

CTV resolution is client-side. The safe MBMC CTA can therefore appear briefly
while the RPC resolves. No incorrect CTV identity is displayed, resolver
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
