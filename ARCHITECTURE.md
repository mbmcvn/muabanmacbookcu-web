# muabanmacbookcu-web Architecture

## Document status

- **State:** VERIFIED CURRENT STATE
- **Verified:** 2026-07-25
- **Role:** technical architecture entry point for the MBMC public website

Canonical operational domains, public contracts, and privacy rules are owned by the sibling `mbmc-care` repository:

- [MBMC architecture](../mbmc-care/ARCHITECTURE.md)
- [Domain map](../mbmc-care/DOMAIN_MAP.md)
- [Verified current state](../mbmc-care/CURRENT_STATE.md)
- [Public contract](../mbmc-care/PUBLIC_CONTRACT.md)
- [Privacy standard](../mbmc-care/PRIVACY.md)

Product and phase documents in this repository govern product intent or preserve decision history; they are not substitutes for current technical architecture.

## Repository role

`muabanmacbookcu-web` owns public presentation and interaction. It currently owns:

- homepage;
- public inventory and Machine detail;
- recommendation flow;
- public Care presentation and route handlers;
- server-side Supabase adapters and public read-model assembly;
- public caching/rendering behavior.
- public CTV referral persistence, contact routing, and referral-aware share links.

`mbmc-care` remains the operational source of truth and owns operational mutations, Machine Publication/Editorial, and canonical public contract semantics.

## Routes and route groups

The `(sales)` App Router group provides the main public sales layout without adding a URL segment.

| Route                 | Responsibility                | Current rendering/data behavior                                |
| --------------------- | ----------------------------- | -------------------------------------------------------------- |
| `/`                   | Homepage                      | Server page; public Machine inventory state; `revalidate = 60` |
| `/may-dang-co`        | Inventory                     | Server load plus client exploration; `revalidate = 60`         |
| `/may/[slug]`         | Public Machine detail/dossier | Server lookup; `revalidate = 60`                               |
| `/may-dang-co/[slug]` | Compatibility redirect        | Redirects to `/may/[slug]`                                     |
| `/chon-macbook`       | Recommendation questionnaire  | Public recommendation flow with local/client state             |
| `/care/[machine_id]`  | Public Care                   | Force-dynamic server page over a minimized Care read model     |

Canonical route locations:

- `src/app/(sales)/page.tsx`
- `src/app/(sales)/may-dang-co`
- `src/app/(sales)/may/[slug]`
- `src/app/(sales)/chon-macbook`
- `src/app/care/[machine_id]`

## Public Machine data flow

```text
server-side Supabase client
→ explicit operational-table selection
→ candidate normalization
→ privacy/eligibility Projection
→ PublicMachineSummaryV1 / DetailV1 / PassportV1
→ server pages and bounded client interactions
```

Canonical locations:

- Supabase server client: `src/lib/supabase/server.ts`
- repository interface/adapter: `src/data/machines/repositories`
- candidate normalizer: `src/data/machines/project-public-candidates.ts`
- Projection: `src/lib/public-projection`
- list/detail use cases: `src/data/machines/get-available-machines.ts`, `get-public-machine-by-slug.ts`
- contract owner: sibling `mbmc-care/PUBLIC_CONTRACT.md`

The Supabase client uses server-only configuration and a service-role key. No operational rows are intentionally passed directly to browser UI. The adapter uses explicit field selections and constructs public DTOs.

This remains a transitional boundary: the website queries the operational Supabase database directly and contains Projection logic also present in `mbmc-care`. No implemented public Projection API was verified.

## Homepage, inventory, and Machine detail

The homepage is implemented and composes sections under `src/app/(sales)/_components/home`. It loads public Machine inventory rather than redirecting to inventory.

Inventory filtering, sorting, facets, and URL/client interaction are under `src/app/(sales)/may-dang-co` and `src/data/machines/public-inventory-query.ts`.

Machine detail uses the public Detail/Passport DTO family under `src/app/(sales)/may/[slug]`. It does not authorize access to operational Machine rows.

## Recommendation flow

`/chon-macbook` is implemented under `src/app/(sales)/chon-macbook`. Its recommendation engine and questionnaire state are website presentation/product behavior, not operational Machine truth.

Versioned Demand Capture V1 value contracts and validation exist in
`src/lib/demand-contract.ts`, but no public Demand Capture or Phone OTP UI is
implemented. Canonical verified-contact and immutable soft-demand persistence
belong to `mbmc-care`; production Phone OTP remains dependent on external
Supabase Phone Auth and SMS-provider configuration.

## CTV referral and contact routing

The implemented public contact model keeps contact owner and communication
channel independent: `ref` determines **who** owns the contact, while `channel`
determines **how** that owner is contacted. The website resolves public CTV
codes through the public-safe RPC, persists valid ownership in a first-party
cookie, composes destinations through the shared contact abstraction, and
includes ownership—but not channel attribution—in Machine and filtered
inventory share links.

The verified contract, precedence, cross-repository ownership, shipped share
surfaces, and accepted MVP limitation are recorded in
[CTV referral routing](docs/CTV_REFERRAL_ROUTING.md).

## Public Care

Public Care is implemented separately from the public Machine DTO family:

- `src/data/care/care-contract.ts`
- `src/data/care/care-repository.server.ts`
- `src/data/care/care-activation.ts`
- `src/app/care/[machine_id]`

The public lifecycle is:

```text
Machine
→ unknown Machine
  → Not Found
→ known Machine
  → authoritative completed Sale
    → no current ownership for that Sale cycle
      → first-time Care Activation
      → verify customer name and Sale phone
      → create the authoritative machine_owners record
      → issue a Care session
      → Care Profile
    → existing current ownership for that Sale cycle
      → returning-owner unlock
      → verify the current ownership phone
      → issue a Care session
      → Care Profile
```

Ambiguous or inconsistent Machine, Sale, or ownership data fails closed. The
website must not select an arbitrary Sale to make an unsafe state appear
actionable.

### Ownership lifecycle

A completed Sale establishes an eligible ownership cycle; it does not
automatically establish an active Care owner. Care ownership begins only after
successful public activation creates the authoritative `machine_owners` record
for that exact Sale cycle.

Ownership is versioned by Sale cycle. A completed resale establishes a new
cycle. The previous ownership and any session bound to it no longer authorize
the current Care Profile.

### Authorization boundaries

First-time activation and returning-owner unlock are intentionally different
authorization boundaries:

| Boundary                   | Verification basis                                                  |
| -------------------------- | ------------------------------------------------------------------- |
| First-time Care Activation | Customer name and the authoritative completed Sale phone            |
| Returning-owner unlock     | The current `machine_owners.phone` for the authoritative Sale cycle |

Absence of a current ownership is an activation state, not an ownership-phone
mismatch. Once ownership exists, the activation boundary must not act as an
alternate way to unlock the Care Profile.

### Public UX states

Public Care exposes these states:

- Machine not found;
- eligible sold Machine awaiting first-time activation;
- returning-owner verification when current ownership exists but no valid
  session is present;
- active Care Profile when the session matches the current Sale cycle and
  ownership;
- closed failure behavior for ambiguous or inconsistent data.

### Support boundary

The Care Profile is owner-protected. Support Ticket intake is a separate public
workflow and is not an authorization path into the Care Profile. Creating a
Support Ticket does not require unlocking the Care Profile and does not create,
replace, or validate a Care ownership session.

The Care read model selects only the Machine identity, authoritative Sale-cycle
context, current Care ownership, and allowlisted Machine Events needed for the
active public state. It synthesizes Event titles and does not return raw
Support/Event text or customer identity.

Care is force-dynamic. A duplicate/older Care implementation remains in `mbmc-care/app/care`; consolidation is deferred.

## Cache behavior

Verified declarations:

- homepage: 60-second revalidation;
- inventory: 60-second revalidation;
- Machine detail: 60-second revalidation;
- Care: force-dynamic.

No signed cross-repository invalidation endpoint or tag/path invalidation integration was verified. Do not document immediate cross-repository publication as implemented.

## Privacy responsibility

The website must:

- query operational data only in server-only modules;
- use explicit selections and positive DTO assembly;
- preserve anonymous not-found behavior for unpublished/ineligible content;
- avoid serializing internal UUIDs, owners/customers, Payments, actors, notes,
  storage keys, or original assets;
- treat `mbmc-care/PRIVACY.md` as the canonical privacy standard;
- fail closed when public eligibility or assets are unavailable.

The service-role client has broad capability. Server-only use and explicit DTO construction reduce exposure but do not create least privilege.

## STATUS: APPROVED ARCHITECTURE — NOT IMPLEMENTED

### Handover Moment surfaces

Planned website responsibilities are:

- homepage Handover rail;
- `/people` archive;
- shared story-style reader without social-network mechanics;
- separate Care editorial block for the applicable current Sale only;
- server-side adapters/queries over the canonical future Handover contract.

No Handover route, reader, query, DTO, or Care block is claimed to exist. The canonical decision is [ADR-0001](../mbmc-care/docs/adr/ADR-0001-sale-anchored-handover-moments.md).

## Known technical debt

- Public Machine Projection code exists in both repositories.
- Care implementations exist in both repositories.
- Website server code uses a broad service-role credential.
- No implemented public Projection API was verified.
- No cross-repository invalidation endpoint was verified.
- Some historic audits/plans contain stale current-state statements and are subordinate to this file.

## Documentation authority

Use this file for website technical current state. Use product contracts for product semantics. Treat `docs/repository-audit.md`, migration plans, phase plans, and gap analyses as historical/planning records unless explicitly re-verified.

## Soft Demand capture

`/chon-macbook` offers Demand capture only after the recommendation and an empty technical inventory match. `/may-dang-co` keeps supply-filter semantics and opens an independent editable desired-spec flow only at zero results; URL buckets remain provenance and are never treated as exact desired facts. Both flows use server-only `/api/demand/captcha` and `/api/demand` boundaries. The first-party four-digit CAPTCHA is basic spam friction, not phone verification. The submitted phone remains unverified and owner-only after persistence; referral evidence is acquisition provenance only.
## Telegram operator notification

After the Demand RPC returns a newly created canonical row (`created: true`), the server-only API makes one best-effort signed call to the operational app. Existing/idempotent results, conflicts, and failed creation do not notify. Notification failure is isolated and never changes the successful Demand response; Telegram remains an operator interrupt while `demand_requests` remains canonical.