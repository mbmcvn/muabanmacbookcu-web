# Phase 2A — Homepage Implementation Plan

## Executive Summary

Phase 2A should transform `/` from an inventory redirect into the entry point for MBMC Decision Studio without implementing the Recommendation engine, inventing Decision Stories, expanding the public machine contract, or redesigning adjacent pages.

The safest approach is additive and server-first:

1. Put the root page inside the existing `(sales)` route group so it inherits the current header and footer without changing its public URL.
2. Establish the homepage's complete semantic narrative with static, source-of-truth content.
3. Add a limited machine section using the existing public inventory query and `PublicMachineSummaryV1`.
4. Describe only trust capabilities that the repository can currently substantiate.
5. Leave Recommendation and Decision Stories unrendered, or give Recommendation an explicitly human-assisted action, until their product behavior and content are real.

This sequence preserves the current application architecture, avoids database and API changes, and allows each part to be delivered and rolled back independently.

The target cognitive journey is:

```text
Confusion
  ↓
Recognition
  ↓
Problem orientation
  ↓
Understanding MBMC's role
  ↓
A credible next step
  ↓
Concrete machine evidence
  ↓
Trust
  ↓
Human reassurance
  ↓
Low-pressure action
```

The principal blockers are product decisions, not technical limitations:

- what the Recommendation CTA may honestly do before a Recommendation experience exists;
- which deterministic rule qualifies machines for homepage presentation;
- which trust statements are approved and supportable today;
- whether sufficient real Decision Stories exist for publication;
- the canonical production origin and analytics/privacy policy.

## Sources and Governing Constraints

This plan is grounded in:

- `brand/mbmc-macbook-why-we-exist.md`
- `product/mbmc-homepage-ux-spec.md`
- `product/mbmc-information-architecture.md`
- `product/mbmc-design-principles.md`
- `product/mbmc-trust-system.md`
- `product/mbmc-decision-psychology.md`
- `product/mbmc-conversation-principles.md`
- `docs/repository-audit.md`
- `docs/decision-architecture-gap-analysis.md`
- `docs/phase-1-foundation.md`

The implementation must preserve the Product Laws expressed by those documents:

- help people decide rather than push them to buy;
- recognize uncertainty before presenting inventory;
- put evidence before claims;
- distinguish what is known from what is not known;
- never imply certainty, verification, inspection, or capability that the system cannot substantiate;
- prefer calm, progressive disclosure to pressure or information overload;
- keep the next step clear and low pressure.

## Current-State Map

### Route and layout

```text
src/app/layout.tsx                         Root layout and global metadata
├── src/app/page.tsx                       `/` → permanent redirect to `/may-dang-co`
└── src/app/(sales)/layout.tsx             Shared sales shell
    ├── SiteHeader
    ├── <main>{children}</main>
    ├── /may-dang-co                       Public inventory
    ├── /may/[slug]                        Public Machine Detail
    └── SiteFooter
```

Consequences:

- The current homepage has no independent information architecture.
- `/` does not currently render through the sales layout because `src/app/page.tsx` is outside `(sales)`.
- The inventory page is effectively the entry experience.
- Moving the root page to `src/app/(sales)/page.tsx` keeps the public route `/` unchanged while allowing it to inherit the existing sales shell.
- The redirect removal changes expected navigation behavior and cache output, but not routing shape or database behavior.

### Current homepage behavior

| Concern | Current state |
|---|---|
| Purpose | Redirect traffic directly to inventory |
| Rendering | Server redirect |
| Data | None at `/`; inventory loads after redirect |
| Decision support | Absent |
| Recognition of uncertainty | Absent |
| Recommendation | Absent |
| Trust explanation | Limited inventory-level statement after redirect |
| Stories | No data source or UI |
| Primary action | Implicitly browse inventory |
| SEO | Root metadata is generic; `/` has no page-specific indexable content |

### Current inventory data path

```text
Supabase
  ↓
Machine repository
  ↓
Public projection / approval gates
  ↓
PublicMachineSummaryV1
  ↓
getAvailableMachines()
  ↓
loadPublicInventoryState()
  ↓
MachineCatalog
  ↓
MachineCard
```

The homepage should reuse this path. It must not query Supabase directly, expose repository records, or introduce a second public machine model.

### Existing reusable pieces

| Existing asset | Homepage use | Constraint |
|---|---|---|
| `(sales)/layout.tsx` | Shared header, main landmark, footer | Homepage route must live in this route group |
| `MachineCard` | Display a limited set of public machines | Its fixed `h2` and inventory-oriented styling need a small, backward-compatible composition seam |
| `PublicMachineSummaryV1` | Complete homepage machine contract | Some fields intentionally express unknown or unavailable values and must not become positive claims |
| `getAvailableMachines()` | Server-side machine source | Returns all approved public machines sorted by current repository rules |
| `loadPublicInventoryState()` | Pattern for resilient loading | Its inventory-specific state type/copy should not be reused blindly |
| `PageState` | Empty or unavailable presentation | Copy must be homepage-specific and restrained |
| Existing sales typography, buttons, cards, spacing and breakpoints | Preserve current visual language | Homepage-specific layout should remain locally scoped |
| Current contact-channel logic | Potential human-assisted path | Existing `ContactActionLink` copy is machine-specific and is not a generic Recommendation CTA |
| Machine detail routes | Destination from machine cards | Machine Detail refactoring is out of scope |

### Missing capabilities

| Capability | Repository state |
|---|---|
| Recommendation route or engine | Missing |
| Recommendation input/output contract | Missing |
| Decision Stories content model | Missing |
| Decision Stories data source or CMS | Missing |
| Trust System completeness | Partial; identity and public projection exist, but inspection, history, Known/Unknown and repair evidence are not consistently populated |
| Homepage analytics | No established instrumentation/provider found |
| Explicit homepage machine curation | No featured flag or editorial selection source |
| Canonical origin configuration | Requires deployment/owner confirmation |

## Target Information Architecture

The homepage should use this order:

1. Hero
2. Recognition of uncertainty
3. Problem framing
4. How MBMC helps
5. Recommendation entry
6. Featured Machines
7. Trust System
8. Decision Stories
9. Closing CTA

The order is meaningful. It first reduces emotional uncertainty, then supplies a model for the decision, then presents actions and inventory. Machines are evidence within a decision process, not the opening demand placed on the user.

## Target Component Tree

Proposed names describe responsibility, not final copy or styling:

```text
RootLayout
└── SalesLayout
    ├── SiteHeader
    ├── main
    │   └── HomePage                         Server; route metadata and data loading
    │       └── HomeView                     Server; semantic section order
    │           ├── HomeHero                 Server
    │           ├── UncertaintyRecognition   Server
    │           ├── DecisionProblemFraming   Server
    │           ├── HowMbmcHelps             Server
    │           ├── RecommendationEntry      Server; rendered only with honest action
    │           ├── FeaturedMachines         Server composition
    │           │   ├── MachineCard          Existing client island, repeated
    │           │   └── PageState            Existing state primitive when appropriate
    │           ├── HomeTrustOverview        Server
    │           ├── DecisionStoriesPreview   Server; deferred until real content exists
    │           └── ClosingDecisionCta       Server
    └── SiteFooter
```

Do not add `"use client"` to the route or the static section composition. The only current client boundary needed by the machine section is the existing machine card/contact interaction. Future analytics should use the narrowest possible client boundary and must not force the whole page to hydrate.

## Section Plans

### 1. Hero

| Dimension | Plan |
|---|---|
| Primary cognitive question | “Can this place help me make sense of the decision, or is it only trying to sell me a machine?” |
| User state before | Uncertain, possibly comparing specifications and sellers, with limited confidence about what matters |
| User state after | Recognized, calmer, and aware that MBMC offers decision guidance plus inspectable machines |
| Reuse | Existing heading/body typography, primary/secondary link styles, sales shell and inventory route |
| Missing data/content | Final owner-approved Vietnamese headline, supporting statement, Recommendation action destination and CTA labels |
| New component | `HomeHero` |
| Server/client boundary | Pure server-rendered markup; no client state |
| Responsive behavior | One readable text column on small screens; actions stack with full usable tap targets; wider screens may place actions inline without widening prose excessively |
| Accessibility | One page `h1`; descriptive link text; no background image carrying meaning; logical focus order; decorative media hidden if later added |
| SEO | The `h1`, introductory copy, title and description should define MBMC as decision support for used MacBooks, not merely an inventory list |
| Analytics worth tracking | Hero inventory CTA; Hero Recommendation CTA; first meaningful homepage navigation |
| Later dependencies | Recommendation destination; analytics/privacy decision |
| Risks | A CTA to nonexistent functionality would violate trust; overly broad claims could overstate MBMC capability |

Implementation rule: inventory is a valid secondary destination now. A Recommendation CTA is valid only if it leads to an explicitly human-assisted, truthful next step or a later real Recommendation experience. Do not use a dead link, disabled control that looks functional, or language that implies an engine exists.

### 2. Recognition of uncertainty

| Dimension | Plan |
|---|---|
| Primary cognitive question | “Does MBMC understand why this decision feels difficult?” |
| User state before | May interpret uncertainty as personal lack of expertise |
| User state after | Understands that uncertainty is reasonable because condition, history, suitability and tradeoffs are genuinely hard to assess |
| Reuse | Existing body typography, section spacing and simple card/list visual language |
| Missing data/content | Approved set of user concerns; no runtime data required |
| New component | `UncertaintyRecognition` |
| Server/client boundary | Static server component |
| Responsive behavior | Preserve concern order in a single flow; if presented as multiple items, collapse to one column on narrow screens |
| Accessibility | Use a real list when concerns are a list; do not rely on icons alone; maintain readable line length |
| SEO | Naturally introduces the real decision problems users search for without keyword repetition |
| Analytics worth tracking | Usually none; optional section visibility only after an analytics policy exists |
| Later dependencies | May be refined by real Recommendation and research insights |
| Risks | Anxiety-amplifying copy, seller attacks, or claims not grounded in the product handbook |

This section should normalize uncertainty, not manufacture fear.

### 3. Problem framing

| Dimension | Plan |
|---|---|
| Primary cognitive question | “What am I actually deciding beyond model and price?” |
| User state before | Focused on specification comparison or finding the cheapest acceptable device |
| User state after | Oriented around fit, evidence, tradeoffs, remaining uncertainty and support |
| Reuse | Existing section headings and content-card patterns |
| Missing data/content | Final concise framing language |
| New component | `DecisionProblemFraming` |
| Server/client boundary | Static server component |
| Responsive behavior | Ordered concepts remain sequential; avoid a dense comparison grid on small screens |
| Accessibility | Semantic heading followed by concise paragraphs/list; icons, if used, are supplementary |
| SEO | Adds differentiated explanatory content around choosing a used MacBook |
| Analytics worth tracking | None required in Phase 2A |
| Later dependencies | Provides terminology later reused by Recommendation, Passport and Known/Unknown features |
| Risks | Becoming an educational essay that delays action; duplicating the next section's explanation of MBMC |

Keep the distinction clear: this section explains the decision; “How MBMC helps” explains MBMC's role.

### 4. How MBMC helps

| Dimension | Plan |
|---|---|
| Primary cognitive question | “What does MBMC do to make this decision easier?” |
| User state before | Understands the problem but not the service model |
| User state after | Can distinguish Recommendation, Decision Dossier, Evidence and human support as separate responsibilities |
| Reuse | Phase 1 MBMC vocabulary and existing card/list styles |
| Missing data/content | Approved descriptions of the four roles and explicit wording for capabilities that are not yet implemented |
| New component | `HowMbmcHelps` and possibly a small local `DecisionRoleItem` presentational helper if repeated markup is substantial |
| Server/client boundary | Static server component |
| Responsive behavior | One column on small screens, balanced grid only where content remains easy to scan |
| Accessibility | Use headings or a semantic list for roles; avoid clickable-looking noninteractive cards |
| SEO | Explains MBMC's distinct service and vocabulary in indexable content |
| Analytics worth tracking | Role-link interaction only if roles later link to real destinations |
| Later dependencies | Recommendation, Machine Passport improvements, Trust System and Care |
| Risks | Presenting planned roles as existing product functionality |

Each role must be labelled according to its current truth. For example, a future Recommendation capability should not be described in the present tense as an automated service. Decision Dossier and Evidence language must remain precise: the interface may expose evidence availability without claiming that every underlying fact is known.

### 5. Recommendation entry

| Dimension | Plan |
|---|---|
| Primary cognitive question | “Can MBMC help me identify what fits my situation?” |
| User state before | Oriented but still unsure how to translate needs into a machine choice |
| User state after | Has one honest, low-effort next step toward guidance |
| Reuse | Existing link/button visual language; contact-channel resolution may be reused only if generalized without changing existing behavior |
| Missing data/content | No Recommendation route, input model, output model or engine; owner-approved interim action and copy are also missing |
| New component | `RecommendationEntry`, but only when its action is real |
| Server/client boundary | Static server link if destination is a normal route; a narrow client action only if an approved human contact flow requires current contact-channel behavior |
| Responsive behavior | One clear action; supporting explanation precedes it; touch target remains usable at narrow widths |
| Accessibility | Action must identify the result, not merely say “Start”; no disabled control masquerading as available functionality |
| SEO | Explain the intended decision-support concept carefully; do not index claims about an unavailable engine |
| Analytics worth tracking | Recommendation entry click; selected contact channel if an approved provider supports this measurement |
| Later dependencies | Recommendation product definition and route; contact strategy; analytics policy |
| Risks | Highest trust risk on the homepage: simulated functionality, misleading automation claims, or an abrupt sales-contact handoff |

Phase 2A should choose one of two honest outcomes:

1. Owner approves a human-assisted guidance action, with copy that explicitly says a person will help; render the section and action.
2. No approved honest action exists; keep the component slot in the architecture but do not render the public section yet.

Building a questionnaire, scoring model, Recommendation engine or fabricated result is out of scope.

### 6. Featured Machines

| Dimension | Plan |
|---|---|
| Primary cognitive question | “What real, currently available options can I inspect?” |
| User state before | Has conceptual orientation but no concrete examples |
| User state after | Can inspect a limited set of real machines without losing the decision context |
| Reuse | `getAvailableMachines()`, `PublicMachineSummaryV1`, `MachineCard`, `PageState`, Machine Detail routes and inventory link |
| Missing data/content | No featured flag or editorial source; owner must approve count, selection rule and section label |
| New component | `FeaturedMachines`; a small server-side homepage loader/selector if selection logic warrants isolation |
| Server/client boundary | Server fetch and composition; existing `MachineCard` remains a client island |
| Responsive behavior | Reuse established card breakpoints; limit item count; section action remains visible after cards; avoid horizontal scrolling |
| Accessibility | Section `h2`, cards use `h3` in this context, unique accessible links, meaningful image alternatives and a semantic unavailable state |
| SEO | Real machine links support discovery; avoid duplicate Product structured data on the homepage unless formally designed and validated |
| Analytics worth tracking | Machine card open with source=`homepage`; inventory “view all” click; machine contact action with source context if supported later |
| Later dependencies | Future editorial selection or Recommendation output may change selection semantics |
| Risks | Calling newest machines “featured” without editorial intent; data failure affecting the homepage; heading-level mismatch; excessive hydration from many cards |

Safe initial selection:

- call the existing public query;
- preserve its existing public projection and ordering;
- take a small, owner-approved number of the first available results;
- label the section according to that rule, such as “Một số máy đang có”, rather than implying curation;
- provide a route to the complete inventory.

Do not add a database flag. The selection rule should be isolated enough that a later editorial or Recommendation source can replace it without changing the section component.

If loading fails, the rest of the homepage must still render. The section may show a restrained homepage-specific unavailable state or be omitted according to owner preference. It must not substitute unapproved records or stale claims outside the existing cache behavior.

### 7. Trust System

| Dimension | Plan |
|---|---|
| Primary cognitive question | “Why should I trust this information, and what remains uncertain?” |
| User state before | Interested in machines but unsure whether the information is credible |
| User state after | Understands how MBMC separates identity, public facts, evidence availability and uncertainty |
| Reuse | Public projection rules, machine identity fields, approved public images, condition summary and current Decision Dossier route |
| Missing data/content | Consistent inspection outcomes, repair history, timeline, warranty evidence and explicit Known/Unknown coverage are not available across the current public contract |
| New component | `HomeTrustOverview` |
| Server/client boundary | Static server component; no live machine query required |
| Responsive behavior | Progressive disclosure in a short ordered explanation; single-column reading order on small screens |
| Accessibility | Clear headings and plain language; Known/Unknown concepts cannot be differentiated by color alone |
| SEO | Trust copy can explain process, but unsupported verification claims must be excluded |
| Analytics worth tracking | Trust-to-inventory or trust-to-dossier link clicks; no need to track passive reading initially |
| Later dependencies | Passport, evidence, timeline and Known/Unknown phases |
| Risks | Reusing current inspection-oriented copy that overstates available evidence; turning process language into a guarantee |

The homepage may safely state that public machine information passes through the public projection and that individual machines have identifiable public dossiers. It must not imply that every machine has a complete inspection, history, repair record, warranty, or known provenance.

Do not reuse `InventoryTrustStatement` copy unchanged if it promises clear inspection results that the public DTO currently marks as unavailable.

### 8. Decision Stories

| Dimension | Plan |
|---|---|
| Primary cognitive question | “Has MBMC helped someone with concerns like mine reach a reasonable decision?” |
| User state before | Understands MBMC conceptually but lacks human proof |
| User state after | Sees a relatable decision, tradeoff and reason—not a generic testimonial |
| Reuse | Existing typography/card visual language only |
| Missing data/content | No story model, data source, CMS or approved real stories |
| New component | `DecisionStoriesPreview` only after content exists |
| Server/client boundary | Static server content is sufficient for an approved initial set; no CMS is required in Phase 2A |
| Responsive behavior | Stories remain complete and sequential; avoid carousels; stack on narrow screens |
| Accessibility | Each story has a descriptive heading; quotes require proper attribution; no auto-advancing content |
| SEO | Authentic stories can add useful contextual content; consent and accuracy must be confirmed before indexing |
| Analytics worth tracking | Story detail/open action only if a real destination exists |
| Later dependencies | Approved story governance and eventually a dedicated Decision Stories phase |
| Risks | Fabricated social proof, unverifiable outcomes, privacy/consent issues, or a visible “coming soon” block that weakens trust |

Phase 2A should not publish placeholder stories. Preserve an insertion point in component order and documentation, but omit the section from the rendered page until at least two owner-approved, truthful stories are available.

### 9. Closing CTA

| Dimension | Plan |
|---|---|
| Primary cognitive question | “What is the safest useful thing I can do next?” |
| User state before | Has moved through orientation, evidence and trust |
| User state after | Chooses either guidance or inventory without pressure |
| Reuse | Existing primary/secondary action styles and inventory route |
| Missing data/content | Final low-pressure copy and the same Recommendation destination decision as the Hero |
| New component | `ClosingDecisionCta` |
| Server/client boundary | Static server markup unless an approved contact action requires a narrow client boundary |
| Responsive behavior | Actions stack predictably on small screens and never reorder semantically |
| Accessibility | Descriptive links, visible keyboard focus, sufficient target size and no urgency language |
| SEO | Reinforces page purpose but should not repeat the Hero verbatim |
| Analytics worth tracking | Closing Recommendation and inventory actions, distinguished from Hero actions |
| Later dependencies | Recommendation destination and analytics policy |
| Risks | Repetition without added reassurance; high-pressure wording; inconsistent action destination |

The Hero and closing actions should have consistent destinations. The closing section can change the framing from orientation to reassurance, but must not introduce a new funnel.

## Repository Mapping

### Current homepage route and component tree

- Current route: `src/app/page.tsx`
- Behavior: permanent redirect to `/may-dang-co`
- Current rendered destination tree: sales layout → header → inventory page → inventory trust statement/catalog → footer
- Required structural destination: `src/app/(sales)/page.tsx`, which continues to resolve to `/`

No public route should be added or renamed for Phase 2A.

### Reusable design primitives

- typography and spacing tokens/patterns in `src/app/globals.css`;
- existing link/button variants;
- card and grid language used by inventory;
- `PageState` for normalized empty/error messaging;
- `MachineCard` for public machine summaries;
- responsive breakpoints already established in global styles;
- existing reduced-motion handling and focus language, subject to verification in implementation.

Homepage-specific layout should use locally scoped styles to reduce global selector collisions. This is containment, not a visual-system rewrite.

### Existing machine query and data source

- Server entry: `getAvailableMachines()`
- Repository source: current machine repository backed by Supabase
- Public safety boundary: public projection and approval gates
- Summary contract: `PublicMachineSummaryV1`
- Current order: repository-defined newest/public order
- Failure pattern: inventory loader converts failures into a nonfatal unavailable state

The homepage should mirror the resilient failure pattern but use homepage-specific semantics and copy.

### Available public DTO fields

The existing summary contract is sufficient for current cards:

| Field | Homepage use |
|---|---|
| `schemaVersion` | Contract/version guard; not displayed |
| `code` | Public machine identity |
| `slug` | Detail route |
| `displayName` | Primary card label |
| `family` | Supporting classification where already displayed |
| `year` | Display only when non-null |
| `screenSizeInches` | Display only when non-null |
| `chip` | Configuration |
| `ramGb` | Configuration |
| `ssdGb` | Configuration |
| `color` | Supporting machine fact |
| `priceVnd` | Current public price |
| `availability` | Eligibility/status |
| `coverImage` | Card image |
| `imageCount` | Evidence-availability signal, not evidence itself |
| `batteryHealthPercent` | Display only according to existing DTO semantics |
| `cycleCount` | Display only according to existing DTO semantics |
| `cosmeticGrade` | Condition signal |
| `conditionSummary` | Reviewed public summary |
| `warranty` | Currently unknown; must not be reframed as positive assurance |
| `inspection` | Currently not available; must not support an inspection claim |
| `contextualLabel` | Existing contextual card label |
| `publishedAt` | Current ordering/input |
| `updatedAt` | Freshness/input, not necessarily displayed |

No new public DTO, field rename or response change is needed for Phase 2A.

### Existing contact action

The current contact action resolves a contact channel for machine confirmation and uses machine-specific copy. It is suitable for existing machine card intent. It is not automatically suitable for:

- a general Recommendation CTA;
- an open-ended decision consultation;
- a claim that a Recommendation workflow exists.

Any reuse must preserve existing behavior and introduce an explicitly named, backward-compatible general-purpose variant only if owner-approved. Otherwise, use a normal link to a real destination or defer the action.

### Recommendation functionality

There is no current Recommendation route, engine, request model, result model or persistent data source. Phase 2A must not create them indirectly under the guise of a homepage component.

### Decision Stories data

There is no current Decision Stories source, model or CMS. Static approved content could support an initial later release without a CMS, but Phase 2A cannot invent that content.

## Data Dependency Table

| Section | Runtime data | Current source | Phase 2A status | Failure behavior |
|---|---|---|---|---|
| Hero | None | Product copy | 2A.1 | Always render |
| Recognition | None | Product copy | 2A.1 | Always render |
| Problem framing | None | Product copy | 2A.1 | Always render |
| How MBMC helps | None | Product copy | 2A.1, with capability-safe wording | Always render |
| Recommendation entry | Action destination | Missing/owner decision | 2A.3 unless honest human path is approved | Omit section; never fake functionality |
| Featured Machines | `PublicMachineSummaryV1[]` | `getAvailableMachines()` | 2A.2 | Render rest of page; restrained unavailable/empty handling |
| Trust System | Approved process statements | Projection behavior and product docs | 2A.2, limited to substantiated claims | Static content remains available |
| Decision Stories | Approved real stories | Missing | 2A.3 | Omit section |
| Closing CTA | Real destinations | Inventory exists; Recommendation missing | 2A.1/2A.3 | Always offer inventory; omit unapproved action |

## Scope by Delivery Slice

### Phase 2A.1 — Safe structural homepage work

- Replace the root redirect with a root page inside `(sales)` so it inherits the current sales shell.
- Add route-specific homepage metadata with owner-approved title and description.
- Establish the semantic page structure and heading hierarchy.
- Implement static sections:
  - Hero;
  - Recognition of uncertainty;
  - Problem framing;
  - How MBMC helps, with present/future capability language checked;
  - Closing CTA with only valid destinations.
- Add locally scoped homepage styles using the current visual language.
- Keep the page server-rendered.
- Add structural and accessibility-oriented tests.

This slice does not depend on Supabase and should be independently releasable.

### Phase 2A.2 — Sections using existing data

- Add a resilient server-side Featured Machines section.
- Reuse `getAvailableMachines()` and `PublicMachineSummaryV1`.
- Apply a small deterministic selection limit after owner approval.
- Make `MachineCard` heading level composable through a backward-compatible optional prop, preserving inventory behavior by default.
- Add homepage-specific empty/unavailable behavior using `PageState` where appropriate.
- Add a Trust System overview containing only currently substantiated statements.
- Add tests for selection, data failure, empty inventory and nested heading semantics.

This slice must not alter the repository query, public DTO or Machine Detail.

### Phase 2A.3 — Placeholders or deferred sections

“Placeholder” here means a reserved architectural slot, not necessarily visible placeholder UI.

- Recommendation entry:
  - render only after an owner approves a truthful human-assisted destination; or
  - defer until the Recommendation phase.
- Decision Stories:
  - do not render until approved real stories exist;
  - do not implement a CMS.
- Defer complete Trust System claims until evidence, inspection, timeline and Known/Unknown data are reliable.
- Defer analytics instrumentation until provider, consent and event-governance decisions are made.
- Defer canonical and structured-data additions that depend on production identity/origin confirmation.

### Explicitly out of scope

- database schema changes;
- new dependencies;
- Recommendation engine, questionnaire, scoring or result implementation;
- Decision Stories CMS;
- Machine Detail refactor;
- public DTO or API contract changes;
- routing additions, removals or public URL changes;
- header, navigation or footer redesign;
- visual redesign outside the homepage;
- inventory redesign;
- global design-system refactor;
- analytics vendor selection;
- fabricated content, claims, evidence or stories.

## File-by-File Change Plan

The paths below are proposed. Exact component grouping may be adjusted during implementation if the repository has changed, but responsibilities should remain local.

| File | Planned action | Slice | Reason and containment |
|---|---|---|---|
| `src/app/page.tsx` | Remove after adding the route-group equivalent | 2A.1 | Stops the redirect; public URL remains `/` |
| `src/app/(sales)/page.tsx` | Add server homepage route, metadata and data composition | 2A.1/2A.2 | Receives existing header/footer with no sales-layout duplication |
| `src/app/(sales)/_components/home/HomeView.tsx` | Add semantic section composition | 2A.1 | Keeps route file focused on routing/data responsibility |
| `src/app/(sales)/_components/home/HomeHero.tsx` | Add Hero markup | 2A.1 | Isolates primary introduction and actions |
| `src/app/(sales)/_components/home/UncertaintyRecognition.tsx` | Add recognition section | 2A.1 | Encodes a distinct cognitive responsibility |
| `src/app/(sales)/_components/home/DecisionProblemFraming.tsx` | Add problem framing | 2A.1 | Prevents mixing decision explanation with service claims |
| `src/app/(sales)/_components/home/HowMbmcHelps.tsx` | Add role explanation | 2A.1 | Centralizes capability-safe MBMC vocabulary |
| `src/app/(sales)/_components/home/RecommendationEntry.tsx` | Add only when a truthful destination is approved | 2A.3 | Avoids presenting unavailable behavior |
| `src/app/(sales)/_components/home/FeaturedMachines.tsx` | Add server composition for limited machines | 2A.2 | Reuses existing cards without importing inventory-page responsibility |
| `src/app/(sales)/_components/home/HomeTrustOverview.tsx` | Add substantiated trust explanation | 2A.2 | Avoids reusing overbroad inventory trust copy |
| `src/app/(sales)/_components/home/DecisionStoriesPreview.tsx` | Defer until real stories are approved | 2A.3 | No fake content or premature CMS abstraction |
| `src/app/(sales)/_components/home/ClosingDecisionCta.tsx` | Add closing action | 2A.1 | Keeps final decision step explicit |
| `src/app/(sales)/_components/home/Home.module.css` | Add locally scoped homepage styles | 2A.1/2A.2 | Prevents unrelated global/UI changes |
| Existing `MachineCard` component | Add an optional semantic heading-level prop, defaulting to current behavior | 2A.2 | Allows valid homepage hierarchy without changing inventory output |
| Existing `MachineCard` tests | Add default and homepage heading-level coverage | 2A.2 | Proves backward compatibility |
| Homepage test file(s) colocated with current test convention | Add structure, copy/action and state tests | 2A.1/2A.2 | Protects section order and honest degradation |
| `docs/phase-2-homepage-implementation-plan.md` | Keep aligned if owner decisions resolve assumptions | Planning | Records implementation contract |

Avoid creating a generic “Section”, “Card”, “CTA”, content schema or homepage CMS abstraction in Phase 2A. Components are justified by distinct cognitive responsibilities, not by superficial markup repetition.

If homepage machine selection remains only `machines.slice(0, approvedCount)`, keep it near the route loader and test it there. Extract a selector only when the rule gains meaningful domain logic.

## Server/Client Boundary

| Responsibility | Boundary |
|---|---|
| Route metadata | Server |
| Static product narrative | Server |
| Machine query and selection | Server |
| Empty/unavailable decision | Server |
| Section layout and semantic markup | Server |
| Existing machine contact interaction | Existing `MachineCard` client island |
| Generic Recommendation contact action | Narrow client island only if approved and technically necessary |
| Analytics | Deferred; later use narrow event components, not a client homepage |

This keeps the initial HTML meaningful, reduces hydration, and preserves the repository's existing server-side public projection boundary.

## Responsive Plan

Responsive implementation should use the current breakpoints and visual language:

- Mobile reading order must exactly match the target IA.
- Narrative sections should remain single-column until a second column materially improves comprehension.
- Action groups stack on narrow screens and retain adequate touch targets.
- Featured machine cards reuse the existing responsive grid; the homepage limits quantity rather than introducing a carousel.
- Trust concepts and stories stack; no horizontal scrollers or auto-advancing carousels.
- Content width should protect readable line length.
- No content, action or trust qualifier may disappear at smaller breakpoints.
- Reduced-motion preferences remain respected; Phase 2A requires no new motion.

## Accessibility Plan

- Preserve one `main` landmark from the sales layout and one `h1` on the page.
- Each target section uses an `h2`; repeated cards or story items use `h3`.
- Modify `MachineCard` only enough to support the correct contextual heading level while retaining its existing default.
- Use links for navigation and buttons only for actions.
- Keep action names descriptive and destination-consistent.
- Preserve visible keyboard focus and logical DOM/focus order.
- Use semantic lists for concerns, roles and trust steps.
- Ensure icons and colors are never the sole carriers of state or meaning.
- Do not present disabled controls for missing functionality.
- Maintain image alternative text using existing machine identity.
- Test at keyboard-only and narrow viewport widths.
- Verify color contrast for any new homepage combinations while preserving the visual language.

## SEO Plan

### Phase 2A.1

- Add route metadata that accurately positions MBMC as decision support for used MacBooks.
- Make the root page indexable, content-bearing and server-rendered.
- Use one descriptive `h1` and semantic section headings.
- Link normally to inventory and real Machine Detail routes.

### Deferred or conditional

- Canonical URL: add only after the production origin and `metadataBase` strategy are confirmed.
- Open Graph imagery: use only an approved, stable brand asset with known dimensions.
- Organization/WebSite structured data: add only after official organization identity, URLs and contact details are confirmed.
- Product structured data: keep on eligible detail pages; do not duplicate a collection of incomplete Product claims on the homepage without a separate SEO review.
- Recommendation structured data: none until the functionality exists.
- Story structured data: none until stories and consent are real.

SEO language must never turn “unknown” evidence into an affirmative claim.

## Analytics Event Plan

These events are worth tracking later; naming is proposed for consistency, not authorization to add an analytics system:

| Event | Suggested properties |
|---|---|
| `homepage_cta_clicked` | `location: hero|closing`, `destination: inventory|recommendation|human_guidance` |
| `homepage_machine_opened` | `machine_code`, `position`, `selection_rule` |
| `homepage_inventory_opened` | `location: hero|featured|closing` |
| `homepage_contact_started` | `location`, `intent`, `channel` |
| `homepage_story_opened` | `story_id`, `position` |
| `homepage_trust_link_opened` | `destination`, `trust_topic` |

Do not send free-form user concerns, contact content or machine Recommendation inputs to analytics by default. Provider selection, consent, retention and event ownership are open decisions. Passive scroll-depth events are lower value than explicit decision actions and can be omitted.

## Implementation Sequence

Use small commits with one responsibility each:

1. **Approve content and destination decisions**
   - Resolve Hero/closing copy, interim Recommendation behavior, machine count/selection label and trust claims.
   - No code commit.

2. **Establish the root homepage route**
   - Add `src/app/(sales)/page.tsx`.
   - Remove the redirect-only `src/app/page.tsx`.
   - Verify `/` inherits the sales shell and `/may-dang-co` remains unchanged.

3. **Add static homepage structure**
   - Add `HomeView` and static sections in target order.
   - Add local homepage styles.
   - Use only valid inventory actions where Recommendation remains unresolved.

4. **Add metadata and semantic tests**
   - Add route-specific metadata.
   - Test section order, single `h1`, action destinations and absence of fake controls.

5. **Make machine-card heading context-safe**
   - Add one backward-compatible optional semantic prop.
   - Preserve default inventory markup and visual output.
   - Add focused tests.

6. **Add Featured Machines**
   - Fetch through the existing public query.
   - Apply the approved deterministic limit.
   - Add homepage-specific ready, empty and unavailable behavior.
   - Verify inventory failures do not take down static homepage content.

7. **Add the limited Trust System overview**
   - Include only verified present capabilities.
   - Add copy assertions preventing unsupported inspection/history claims.

8. **Add Recommendation entry only if approved**
   - Connect it to a real human-assisted destination or defer.
   - Do not simulate output.

9. **Add Decision Stories only when content is approved**
   - Use an initial typed static content list if appropriate.
   - A CMS remains out of scope.

10. **Final cross-page regression**
    - Verify root, inventory, machine detail, shared header/footer and build output.

Each numbered code step should be independently reviewable and revertible.

## Acceptance Criteria

### Phase 2A.1

- `/` renders a real homepage and no longer redirects.
- `/` continues to use the existing public URL and inherits the current sales header and footer.
- Sections implemented in this slice follow the approved target order.
- The page contains one `h1` and a logical heading hierarchy.
- Static content remains useful without JavaScript.
- Every visible action has a real, accurate destination.
- No copy implies that Recommendation, inspection, complete evidence, or stories exist when they do not.
- No public route, database, dependency or DTO changes are introduced.
- Existing inventory and Machine Detail behavior remains unchanged.

### Phase 2A.2

- Homepage machine data comes only through the existing public data path.
- Only approved public DTO fields are passed to existing cards.
- The selection rule and item limit are deterministic and documented.
- Empty and unavailable machine states do not prevent the rest of the homepage from rendering.
- Machine cards use valid heading levels on both homepage and inventory.
- The Trust section contains only substantiated current statements.
- No additional client boundary is introduced around the homepage.

### Phase 2A.3

- Recommendation is rendered only with a truthful working action.
- Decision Stories are rendered only from approved real content.
- Visible placeholder UI does not pretend that deferred capability exists.

### Quality gates

- Production build passes.
- ESLint passes with no new warnings.
- Existing tests pass.
- New homepage and affected component tests pass.
- Keyboard, focus, narrow viewport and reduced-motion checks pass.
- No unexpected changes appear on inventory, Machine Detail, navigation or footer.

## Test Plan

### Unit and component tests

- `HomeView` renders implemented sections in the required order.
- Exactly one `h1` is present.
- Section headings form the expected `h2` hierarchy.
- Hero and closing links use approved destinations.
- No Recommendation control is present when no destination is configured.
- No Decision Stories section is present without approved content.
- `MachineCard` preserves its existing default heading on inventory.
- `MachineCard` uses the homepage-provided heading level without changing card content or actions.
- Featured selection respects the approved limit and repository ordering.
- Trust copy does not contain prohibited/unsupported inspection, repair, warranty or history claims.

### Data-state tests

- Ready with multiple machines: limited cards and “view all” action render.
- Ready with fewer machines: only real machines render; no fillers.
- Empty inventory: calm empty handling, no broken grid.
- Repository unavailable: static homepage remains rendered and the machine section degrades safely.
- Nullable DTO values: no fabricated year, size, battery, warranty or inspection content.

### Route and integration checks

- `/` returns homepage content rather than a redirect.
- `/may-dang-co` remains available and unchanged.
- `/may/[slug]` links from homepage cards remain valid.
- Header and footer render once.
- Cache/revalidation behavior is recorded and matches the chosen loader.
- Root metadata renders the approved title and description.

### Manual accessibility and responsive checks

- Navigate the entire page by keyboard.
- Confirm focus visibility and order at all actions.
- Check landmark and heading output with browser accessibility tools.
- Verify 320px-class narrow layout, established tablet breakpoint and wide desktop.
- Check text zoom and content reflow.
- Check missing/broken image behavior.
- Confirm no content depends on hover.
- Confirm reduced-motion mode adds no unexpected transition.

### Regression commands

Use the repository's existing scripts for:

- tests;
- production build;
- ESLint.

Do not add a testing dependency solely for this phase.

## Rollback Strategy

Rollback is intentionally aligned to delivery slices:

1. **Static homepage rollback:** revert the route/static-section commits and restore the existing root redirect. Inventory and Machine Detail remain untouched.
2. **Featured Machines rollback:** revert the machine section and optional heading prop independently; the static homepage remains.
3. **Trust rollback:** remove only `HomeTrustOverview`; no data behavior changes.
4. **Recommendation or Stories rollback:** remove the individual section because neither should be coupled to the route or machine loader.
5. **Content rollback:** copy-only commits should remain separate from structural commits where practical.

No migration, schema reversal or dependency removal should be required. Before release, preserve the previous redirect behavior in version control rather than introducing a runtime feature flag solely for rollback.

If operational risk warrants staged exposure, use the deployment platform's existing release controls. Do not add a new feature-flag dependency for this homepage.

## Risks and Mitigations

| Risk | Level | Mitigation |
|---|---|---|
| Recommendation CTA overpromises nonexistent capability | High | Require a real destination and explicit human-assisted wording, or omit |
| Trust copy implies unavailable inspection/evidence | High | Copy review against DTO values and Trust System source; test prohibited claims |
| Stories become fabricated social proof | High | Publish only approved real stories with consent; omit otherwise |
| Root placement creates a route conflict | Medium | Move, do not duplicate, the root page into `(sales)`; verify route build |
| Machine failure breaks the whole homepage | Medium | Catch at the homepage data boundary; keep static sections independent |
| “Featured” implies editorial curation | Medium | Use a truthful label tied to deterministic current ordering |
| `MachineCard` creates invalid heading hierarchy | Medium | One optional semantic prop with current default and regression tests |
| Global styles affect other routes | Medium | Scope homepage styles locally and reuse existing primitives |
| Homepage becomes a large client bundle | Medium | Server-first composition; retain only existing narrow client islands |
| SEO claims exceed product reality | Medium | Metadata and copy review; defer uncertain structured data |
| Static copy drifts from later product behavior | Low/Medium | Keep roles isolated and update them with later phase contracts |

## Dependencies on Later Phases

```text
Recommendation product contract
  └── Recommendation entry action
      ├── Hero Recommendation CTA
      └── Closing Recommendation CTA

Machine public projection
  └── Featured Machines (available now)
      └── Future recommendation-aware selection

Passport / Evidence / Timeline / Known-Unknown work
  └── Full Trust System claims
      └── Richer homepage trust explanation

Approved real customer decisions
  └── Decision Stories preview
      └── Future Decision Stories destination/CMS

Analytics and privacy governance
  └── Homepage event instrumentation
```

The static narrative and Featured Machines can proceed without waiting for later phases. Recommendation, complete trust claims and Decision Stories cannot.

## Open Decisions Requiring Owner Judgement

1. **Recommendation action:** Should Phase 2A offer explicitly human-assisted guidance, or omit Recommendation actions until a dedicated experience exists?
2. **Hero and closing copy:** Which final Vietnamese wording is approved, and which statements describe present capability versus future intent?
3. **Machine selection:** How many machines appear, and may repository-newest items be described as “featured,” or should the label state only that they are currently available?
4. **Unavailable machine behavior:** Show a restrained state or omit the section when the query fails?
5. **Trust claims:** Which exact statements have operational evidence today and legal/brand approval?
6. **Decision Stories:** Are there at least two real, consented stories with person, need, hesitation, tradeoff, decision and rationale?
7. **Contact behavior:** Is the existing contact channel appropriate for non-machine-specific guidance, and what label accurately sets expectations?
8. **Canonical origin:** What is the authoritative production origin and metadata configuration?
9. **Open Graph asset:** Is there an approved stable brand image?
10. **Analytics:** Which provider, consent rule, retention policy and event owner apply?
11. **Homepage cache behavior:** Should machine freshness follow the current inventory revalidation interval, or should the machine subsection use a separately approved policy?
12. **Header behavior:** The current navigation has inventory-oriented state and a future/dead selection link. Because navigation redesign is out of scope, should a separate later task correct homepage active-state semantics before launch?

## Critical Blockers

The following block only their affected sections, not the structural homepage:

- No truthful Recommendation destination blocks the Recommendation entry and Recommendation CTAs.
- No approved real stories block Decision Stories.
- No verified trust-copy set blocks the Trust section beyond minimal projection/identity statements.
- No approved selection semantics blocks the machine section label and count.
- No production origin blocks a reliable canonical URL.
- No analytics/privacy decision blocks instrumentation.

None of these should block Phase 2A.1 if the page exposes only working inventory actions and approved static content.

## Recommended Delivery Decision

Proceed first with Phase 2A.1 as a server-rendered, content-led homepage using the existing sales shell. Then add Featured Machines and a narrowly substantiated Trust overview in Phase 2A.2.

Treat Recommendation and Decision Stories as intentionally deferred rather than filling their positions with simulated UI. This leaves the homepage structurally ready for the full Decision Architecture while preserving the central MBMC promise: make uncertainty visible, make claims supportable, and never present planned capability as established fact.

## Phase 2A First-Release Implementation Record

Implementation date: 2026-07-23

### Implemented

- `/` now renders a server-rendered homepage inside the existing `(sales)` route group instead of redirecting to `/may-dang-co`.
- The first-release section order is:
  1. Hero
  2. Recognition of uncertainty
  3. Problem framing
  4. How MBMC helps
  5. Human-assisted guidance
  6. Một số máy đang có
  7. Narrow Trust overview
  8. Closing CTA
- Homepage copy is centralized in the homepage component directory so it can be revised without changing data or public contracts.
- General guidance uses the existing contact-channel infrastructure and the explicit label “Nhắn MBMC để chọn máy phù hợp.”
- Guidance copy states that a real person will help and that the interaction is not automated advice.
- Existing machine-specific contact actions retain the label “Nhắn MBMC xác nhận máy” and continue to resolve their destination through the existing contact channel.
- Homepage-specific styles are locally scoped. Existing machine cards and global visual primitives remain in use.
- The page remains server-rendered; only the existing contact and machine-card interactions remain client boundaries.

### Available-machine selection semantics

- The homepage calls the existing `getAvailableMachines()` public query.
- The query continues through the existing repository and controlled public projection.
- The homepage takes the first three machines in the repository's existing order.
- It does not describe those machines as featured, recommended, curated, selected, best, or preferred.
- The section is labelled “Một số máy đang có” and links to the complete inventory with “Xem tất cả máy đang có.”
- A query failure does not prevent the static homepage from rendering.
- An unavailable query produces a restrained unavailable message and does not imply that inventory is empty.
- A successful empty result remains distinct from an unavailable query.

### Trust claim boundaries

The first-release Trust section says only that:

- each listing represents a specific physical machine with its own identity;
- each machine has an individual public profile;
- public information passes through the controlled public projection;
- public images and condition descriptions require approval before publication.

It does not claim complete evidence, timeline, inspection, repair history, ownership history, Known/Unknown coverage, universal warranty, or perfect transparency.

### Deferred

- automated Recommendation functionality;
- Recommendation forms, quizzes, scoring and generated results;
- Decision Stories content, components, placeholders, analytics and CMS;
- complete Trust System layers that are not supported by current public data;
- homepage analytics instrumentation;
- canonical and structured-data additions requiring confirmed production identity;
- navigation and footer redesign;
- Machine Detail refactoring.
