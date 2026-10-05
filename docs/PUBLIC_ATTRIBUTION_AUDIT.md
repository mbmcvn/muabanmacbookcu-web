# Public funnel/ref attribution audit

Audited 2026-10-05. Repository fixes only; no production deployment or mutation.

## Root cause and prior behavior

The browser parsed ref once from window.location.search in each independent useContactChannel instance. canonicalReferralCode trimmed/uppercased and accepted the four-character restricted alphabet (MBMC is syntactically valid). Every code, including MBMC, was passed to the partner-only resolve_public_ctv_referral RPC. There was no explicit house registration in the website. If that lookup returned no owner or failed, resolveReferralContext tried the 30-day mbmc_ctv_referral cookie; a stored 5DZE therefore restored the Kris contact. The hook only assigned a new owner when context.owner was non-null, so a house fallback never cleared an already resolved partner. Its pending RPC promise was shared across all codes, allowing a different request to reuse the wrong owner's result.

The documented prior policy was valid URL owner > valid persisted owner > implicit MBMC. It was overwriteable, not immutable first-touch. In practice MBMC could not express a deliberate house selection and inherited the cookie when its partner lookup was empty. Controlled regressions reproduce that path with an empty MBMC RPC response and a valid 5DZE cookie.

The configured live public RPC could not be reached from this environment, so this audit does not claim to have inspected live partner rows or deployed behavior. Kris/5DZE test data models the user-confirmed reproduction.

## Corrected source of truth

contact-routing.ts registers reserved house code MBMC locally using the existing MBMC_CONTACTS mapping: house default Zalo https://zalo.me/0326147088; explicit Messenger https://m.me/61592174842507. Partner codes remain exclusively owned by the public RPC; no partner names/phone numbers were added to page components or a local partner registry.

Precedence is explicit valid URL ref > persisted valid ref > canonical MBMC. Invalid/unknown/unusable/failed partner lookup retains a valid persisted context under the existing contract; absent valid persistence falls back to MBMC. Explicit MBMC never looks up a partner and overwrites a previous partner cookie synchronously.

contact-attribution.ts holds one atomic browser snapshot shared by useContactChannel subscribers. It contains the resolved contact label/href, canonical ref, lead evidence and share ref. The sales-layout observer responds to pathname and search-param changes, including native inventory history updates and back/forward. Request revisions prevent old completions from publishing or persisting; a per-code cache prevents cross-code promise reuse. Cookie/storage access failure is non-fatal.

Persistence remains the first-party mbmc_ctv_referral cookie: 30 days, Path=/, SameSite=Lax, Secure in production. There is no owner localStorage/sessionStorage or server-cookie attribution resolver. mbmc_contact_channel localStorage is written, never read, and does not choose the owner. Other local/session storage is quiz drafts, CTV application drafts and return/orientation contexts, not ref ownership. Care authentication cookies are separate.

## Presentation versus funnel evidence

Previously CTA ownership used the resolved owner while referralEvidence was raw URL ref or raw cookie, assigned independently. Examples included a partner CTA with invalid/MBMC URL evidence, or MBMC fallback presentation with unverified partner evidence. Independent mounted hooks could also remain on different old owners.

Now demand evidence is the canonical resolved partner code or null for house/fallback/pending. The /api/demand endpoint and create_captcha_soft_demand_v1 payload shape are unchanged; backend validation and lead ownership remain authoritative. Explicit MBMC is house/organic evidence, not a fabricated CTV partner. This repository has no generic funnel analytics SDK or commission/distributor calculations to update.

## Propagation

- Sales internal links: /, /may-dang-co, /may/..., /chon-macbook carry resolved selected ref. Other public links do not acquire ref; the existing cookie can still supply contact context to shared header/CTA surfaces.
- Inventory filter/sort/search/reset history: keep canonical explicit URL ref and channel, even before partner lookup completion, otherwise use resolved share context. Facet/query semantics are unchanged.
- Machine/inventory copied links: canonical route/filter params plus resolved partner or explicit/persisted MBMC ref. Channel is deliberately omitted. Organic no-ref/no-cookie MBMC shares remain clean. House shares include MBMC so a recipient's partner cookie cannot take over.
- CTA contact links: route to the configured owner's validated Messenger/Zalo destination, without appending ownership parameters to third-party contact URLs.
- Care routes: no new ref propagation. Care access/auth/report behavior is unchanged.

## Server rendering and compatibility

As documented before this fix, partner lookup remains client-side. Server HTML and first hydration share an immutable safe MBMC snapshot; browser context then resolves. Explicit MBMC stays house-owned throughout hydration. A valid partner can replace the initial safe MBMC after its RPC resolves. No browser cache is read on the server and no per-visitor snapshot leaks between requests. The observer's Suspense boundary covers only the observer, not page content.

Compatibility considerations: MBMC is now reserved house ownership, including on share URLs; raw unresolved evidence is no longer forwarded when it conflicts with the fallback/pending presentation; a partner without any usable contact destination cannot supply partner evidence alongside a house CTA. No database, accounting, commissions or routing schema changes were made. Live partner registry/DB lead persistence still requires environment access; no live lead submission was performed.

## Regression validation

contact-routing.test.mjs covers defaults, 5DZE/MBMC URL and cookie precedence, normalization/invalid input, per-code caching, late RPC completion, scoped internal propagation and canonical filtered share URLs. contact-attribution.test.mjs runs the actual hook and ContactActionLink with a simulated cookie/public RPC, verifying label, destination, evidence, share ref and hydration consistency. Existing inventory, demand, navigation and detail regressions validate unaffected behavior.

## Files changed

- Canonical resolution and shared state: src/lib/contact-routing.ts, src/lib/contact-attribution.ts, src/hooks/useContactChannel.ts.
- Navigation observer and mounting: src/components/contact/ContactAttributionObserver.tsx, src/app/(sales)/layout.tsx.
- Funnel propagation: src/components/layout/SiteHeader.tsx, src/app/(sales)/may-dang-co/_components/MachineCard.tsx, src/app/(sales)/may-dang-co/_components/InventoryExplorer.tsx, src/app/(sales)/may/[slug]/_components/PublicMachineDetailView.tsx.
- Copy surfaces: src/components/contact/CopyInventoryLink.tsx, src/components/contact/CopyMachineLink.tsx.
- Regressions: src/lib/contact-routing.test.mjs, src/lib/contact-attribution.test.mjs, src/app/(sales)/may-dang-co/_components/inventory-heading.test.mjs.
- Documentation: docs/CTV_REFERRAL_ROUTING.md, docs/PUBLIC_ATTRIBUTION_AUDIT.md.

Validation: all 217 focused and related attribution, Demand, inventory, navigation and detail tests passed (including 32 attribution tests); TypeScript, scoped ESLint, production build and git diff --check passed. Production build continued to log existing public inventory/story query failures while completing successfully. No commit, push, deployment, live lead submission or production mutation was performed.
