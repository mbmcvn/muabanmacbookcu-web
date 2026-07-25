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

`mbmc-care` remains the operational source of truth and owns operational mutations, Machine Publication/Editorial, and canonical public contract semantics.

## Routes and route groups

The `(sales)` App Router group provides the main public sales layout without adding a URL segment.

| Route | Responsibility | Current rendering/data behavior |
|---|---|---|
| `/` | Homepage | Server page; public Machine inventory state; `revalidate = 60` |
| `/may-dang-co` | Inventory | Server load plus client exploration; `revalidate = 60` |
| `/may/[slug]` | Public Machine detail/dossier | Server lookup; `revalidate = 60` |
| `/may-dang-co/[slug]` | Compatibility redirect | Redirects to `/may/[slug]` |
| `/chon-macbook` | Recommendation questionnaire | Public recommendation flow with local/client state |
| `/care/[machine_id]` | Public Care | Force-dynamic server page over a minimized Care read model |

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

## Public Care

Public Care is implemented separately from the public Machine DTO family:

- `src/data/care/care-contract.ts`
- `src/data/care/care-repository.server.ts`
- `src/data/care/care-activation.ts`
- `src/app/care/[machine_id]`

The read model selects Machine identity, applicable/latest Sale context, Care Activation, and allowlisted Machine Events. It synthesizes Event titles and does not return raw Support/Event text or customer identity.

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
