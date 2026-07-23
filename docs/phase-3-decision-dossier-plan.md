# Phase 3A — Decision Dossier Architecture

## Executive Summary

The current Machine Detail page is a sound public-data surface but not yet a Decision Dossier in the MBMC sense.

Its strongest foundations are:

- a server-only repository and public-projection boundary;
- an immutable, versioned `PublicMachineDetailV1` contract;
- a real per-machine identity;
- approved public images;
- editorial fields for expert summary, suitability, non-suitability and condition;
- explicit typed states for unavailable inspection, unknown warranty, unknown source verification and unknown repair status;
- accessible gallery and lightbox behavior;
- a direct, machine-specific contact action.

Its main decision-quality problem is information order. The active page currently asks the customer to process identity, price, Passport, condition facts, images and specifications before it clearly answers whether the machine fits them. Suitability and non-suitability are nested together inside a late “MBMC đánh giá” section. Benefits and trade-offs have no explicit public fields. Known and Unknown are not presented as first-class concepts. The component named `MachineEvidenceGrid` renders decision facts, not evidence provenance. Timeline and related-machine contract slots exist but are always empty.

Phase 3A should therefore proceed in three layers:

1. **Immediate decision architecture:** reorder and separate content already supported by the current public DTO, without inventing missing claims.
2. **DTO-backed decision quality:** introduce reviewed, explicitly sourced public fields for benefits, trade-offs, Known, Unknown and evidence relationships through a separately approved contract evolution.
3. **Future Trust architecture:** add real timeline, inspection, repair, policy applicability, evidence provenance, Care and related-machine reasoning only after their source data and publication governance exist.

The target cognitive sequence is:

```text
Identity and orientation
  ↓
Suitable for me?
  ↓
Who should not buy it?
  ↓
Benefits and trade-offs
  ↓
Known and Unknown
  ↓
Evidence for known facts
  ↓
History, identity and policy context
  ↓
What should I do next?
```

This is an information-architecture evolution, not a visual redesign.

## Scope and Product Guardrails

This plan is grounded in:

- `brand/mbmc-macbook-why-we-exist.md`
- `product/mbmc-conversation-principles.md`
- `product/mbmc-decision-psychology.md`
- `product/mbmc-design-principles.md`
- `product/mbmc-homepage-ux-spec.md`
- `product/mbmc-information-architecture.md`
- `product/mbmc-trust-system.md`
- `docs/repository-audit.md`
- `docs/decision-architecture-gap-analysis.md`
- `docs/phase-1-foundation.md`
- `docs/phase-2-homepage-implementation-plan.md`

The Decision Dossier must obey these Product Laws:

- improve the quality of the decision, not merely conversion;
- explain suitability and non-suitability;
- make trade-offs visible;
- put evidence before trust claims;
- distinguish fact, evidence, human judgement and uncertainty;
- never transform missing data into a positive claim;
- never require the customer to “just trust MBMC”;
- preserve the customer's agency and time to decide;
- keep the page calm and progressively disclosed;
- never claim more certainty than the available evidence supports.

## Repository and Rendering Map

### Active route

```text
src/app/(sales)/may/[slug]/page.tsx
├── generateMetadata()
│   └── getPublicMachineBySlug(slug)
├── PublicMachineDetailView machine={machine}
└── PublicMachineStickyBar machine={machine}
```

The route:

- is a server component;
- uses `revalidate = 60`;
- loads a `PublicMachineDetailV1` through a React-cached server repository call;
- returns route-level `notFound()` for an unavailable or ineligible slug;
- generates title, description, canonical and Open Graph metadata from the public DTO;
- renders the page body through a top-level client component.

### Active data flow

```text
Supabase public candidate query
  ↓
normalization and eligibility
  ↓
privacy validation
  ↓
PublicProjectionKernel
  ↓
PublicMachineDetailV1 assembler
  ↓
getPublicMachineBySlug()
  ↓
server route
  ↓
PublicMachineDetailView ("use client")
  ↓
gallery, dossier, specifications, policy and contact components
```

No detail component reads Supabase directly. This boundary must remain intact.

### Active page order

```text
Breadcrumb
Hero
├── PublicMachineGallery
└── DecisionPanel
    ├── availability / contextual label
    ├── name / configuration / price
    ├── evidence-availability anchors
    └── contact action
DecisionDossier
├── PassportDossier
├── MachineEvidenceGrid
└── MbmcRecommendation
    ├── expert summary
    ├── suitableFor
    └── notSuitableFor
DetailedImages
PublicSpecifications
PoliciesAndSupport
PublicMachineStickyBar
```

### Current client boundary

`PublicMachineDetailView` is a client component because it:

- preserves the selected contact channel in the inventory breadcrumb;
- wraps the page in `PublicMachineMediaProvider`;
- coordinates the gallery and detailed-image lightbox through shared client context.

Consequently, static Passport, recommendation, condition, specifications and policy content is also included beneath a hydrated client boundary even though those sections do not require browser state.

This is a technical optimization opportunity, not a prerequisite for correcting the decision order. Splitting the boundary immediately could disturb the shared media index, lightbox focus restoration and contact-channel propagation. It should be treated as a separate, measured refactor.

## Current Page Map and Review

### 1. Breadcrumb

| Dimension | Current assessment |
|---|---|
| Component | Inline markup in `PublicMachineDetailView` |
| Purpose | Return to inventory and identify the current machine |
| Cognitive question | “Where am I, and how do I go back?” |
| Supporting data | `summary.displayName`, `summary.color`, `summary.slug` indirectly |
| Strengths | Semantic `nav`; descriptive inventory link; contact channel preserved |
| Weaknesses | Responsibility is embedded in a large client component; not part of decision reasoning |
| Repetition | Machine name and color repeat immediately in Hero |
| Trust risks | None material |
| Missing evidence | None |
| Progressive disclosure | Keep compact; it should remain navigational |

Recommendation: retain as a quiet orientation aid. Do not expand it into a decision section.

### 2. Hero gallery

| Dimension | Current assessment |
|---|---|
| Components | `PublicMachineGallery`, `SlidingImageTrack`, `PublicMachineMediaProvider` |
| Purpose | Show approved public images for this physical machine |
| Cognitive question | “What does this specific machine look like?” |
| Supporting data | `gallery`, `coverImage`, image alt text and dimensions |
| Strengths | Real public images; keyboard arrows; selected thumbnail state; full-screen dialog; swipe; reduced-motion coverage; consistent index across gallery and detailed images |
| Weaknesses | The hero gives images high visual priority before suitability; image type/stage is lost from `PublicImage`, so customers cannot distinguish overview, defect or evidence categories except through alt text |
| Repetition | The same gallery images after the first are repeated in `DetailedImages` |
| Trust risks | “Hình ảnh thực tế” is supportable only because public images are machine-specific and publication-gated; alt text alone is weak evidence classification |
| Missing evidence | No explicit image-to-claim relationship, capture date, subject/area or verification state |
| Progressive disclosure | Keep a concise hero gallery; move systematic evidence review to a later Evidence section using the same source |

The gallery supports orientation and trust, but images must not substitute for suitability or condition explanations.

### 3. Decision Panel in the hero

| Dimension | Current assessment |
|---|---|
| Component | `DecisionPanel` |
| Purpose | Identify the machine, show configuration, price, status and contact |
| Cognitive question | Currently combines “What is it?”, “What does it cost?” and “Should I contact MBMC?” |
| Supporting data | availability, contextual label, display name, chip, RAM, SSD, color, price, evidence-availability statuses, code |
| Strengths | Clear identity; current price; configuration; machine-specific contact copy; no urgency; explicit contact context |
| Weaknesses | Does not answer suitability; price and contact arrive before decision framing; contextual labels can become promotional; CTA may appear to be the main conclusion before trade-offs are understood |
| Repetition | Identity, status and code recur in Passport and sticky bar; price and contact recur in sticky bar and final support |
| Trust risks | “Thông tin đã duyệt” is broad and does not tell the customer which fields were reviewed; “MBMC Passport” acts like a trust badge even when Passport facts and timeline are empty |
| Missing evidence | No concise statement of what is known, unknown or consequential for this buyer |
| Progressive disclosure | Hero should show only identity, configuration, availability, price and a compact decision orientation; deeper trust anchors should link to concrete sections only when those sections contain data |

The hero should orient, not conclude. A contact action may remain available, but it should not visually or semantically imply that the customer has already reached a recommendation.

### 4. Evidence Availability Anchors

| Dimension | Current assessment |
|---|---|
| Component | `EvidenceAvailabilityAnchors` |
| Purpose | Signal that supporting public information exists |
| Cognitive question | “What kinds of supporting information can I inspect?” |
| Supporting data | publication eligibility, `summary.inspection.status`, existence of Passport |
| Strengths | Correctly omits inspection when status is `not_available`; renamed in Phase 1 to distinguish availability from Evidence itself |
| Weaknesses | “Thông tin đã duyệt” is nonspecific; “MBMC Passport” always appears even when its substantive arrays are empty |
| Repetition | Duplicates Passport and Evidence section labels |
| Trust risks | Can function as a badge row rather than a route to verifiable material |
| Missing evidence | No count or relationship showing which claims have evidence |
| Progressive disclosure | Render an anchor only when the destination contains meaningful public material; otherwise omit |

These should become navigation aids, not assurance badges.

### 5. Passport Dossier

| Dimension | Current assessment |
|---|---|
| Component | `PassportDossier` |
| Purpose | Present stable public identity, status, publication date, public facts and timeline |
| Cognitive question | “Which exact machine is this, and what public record exists for it?” |
| Supporting data | code, slug, public status, first publication date, facts, timeline |
| Strengths | Strong per-machine identity; stable code; publication date is a valid public lifecycle fact; timeline sorting is deterministic |
| Weaknesses | Appears before suitability; `facts` and `timeline` are always empty in the assembler; status and name repeat Hero; current content is closer to an identity card than a complete Passport |
| Repetition | Code, model and availability duplicate Hero and sticky CTA |
| Trust risks | The “MBMC Passport” label can imply a fuller record than currently exists |
| Missing evidence | Source verification, inspection, repair status and meaningful public timeline are present in the contract but not rendered or populated |
| Progressive disclosure | Keep a compact identity summary visible; place fuller Passport facts behind a structured section only when data exists |

Passport is justified, but it should follow decision-critical suitability, trade-offs and Known/Unknown. It must be described according to its actual completeness.

### 6. Machine Evidence Grid

| Dimension | Current assessment |
|---|---|
| Components | `MachineEvidenceGrid`, `buildMachineEvidence` |
| Purpose | Present current decision-relevant machine facts |
| Cognitive question | “What condition and included-item facts are publicly available?” |
| Supporting data | battery health, cycle count, cosmetic grade, condition summary, included items |
| Strengths | Omits missing values; keeps battery health and cycle count distinct; avoids unavailable inspection placeholders; merges condition grade and description coherently |
| Weaknesses | The name says Evidence, but the output is a fact list; no provenance, observation date, method or supporting asset is attached |
| Repetition | Battery, cycles and grade are partly repeated on inventory cards; condition description may overlap image captions |
| Trust risks | Customers may interpret values as independently verified evidence when the contract only supplies public facts |
| Missing evidence | Evidence type, source, captured/observed time, reviewer, verification method and claim-to-evidence linkage |
| Progressive disclosure | Show a concise Known summary early, then detailed fact/evidence rows later; expand images or source details on demand |

This component is immediately useful, but it should be classified as public machine facts until evidence provenance exists.

### 7. MBMC Recommendation

| Dimension | Current assessment |
|---|---|
| Component | `MbmcRecommendation` |
| Purpose | Present editorial judgement, suitable audiences and unsuitable audiences |
| Cognitive question | “Does this machine fit me, and when should I avoid it?” |
| Supporting data | `expertSummary`, `suitableFor`, `notSuitableFor` |
| Strengths | Current DTO already separates reviewed judgement from factual machine fields; section disappears when no editorial judgement exists; explicitly includes non-suitability |
| Weaknesses | It appears after Passport and condition facts; combines summary, suitability and non-suitability under one marketing-prone “MBMC đánh giá” heading; does not expose underlying reasoning or trade-offs |
| Repetition | Expert summary may restate specifications, condition or suitability bullets |
| Trust risks | “Nhận định kỹ thuật” may sound like an inspection conclusion; suitability can become generic sales copy without audience, need and rationale standards |
| Missing evidence | No structured rationale or links to facts supporting each judgement |
| Progressive disclosure | Put concise Suitable/Not suitable answers immediately after Hero; show rationale or supporting facts beneath each item when available |

This is the most important immediately reusable decision content and should move much earlier.

### 8. Detailed Images

| Dimension | Current assessment |
|---|---|
| Component | `DetailedImages` in `ConditionAndImages.tsx` |
| Purpose | Let customers inspect images beyond the cover |
| Cognitive question | “Can I inspect the machine beyond the primary photo?” |
| Supporting data | `gallery.slice(1)` and shared lightbox context |
| Strengths | Same canonical gallery index; accessible buttons and captions; no section when no additional images exist |
| Weaknesses | Every non-cover image is treated as equivalent; section heading “Kiểm tra bằng hình ảnh” may overstate what a photo proves |
| Repetition | Duplicates hero gallery media |
| Trust risks | Photos can support observations but do not establish inspection, repair history or internal condition |
| Missing evidence | Image classification, claim linkage and scope |
| Progressive disclosure | Use the hero for browsing and a later Evidence section for categorized supporting images; avoid rendering the same content twice without a distinct purpose |

### 9. Public Specifications

| Dimension | Current assessment |
|---|---|
| Components | `PublicSpecifications`, `buildPublicSpecificationRows` |
| Purpose | Present trusted configuration and allowlisted technical fields |
| Cognitive question | “What are the machine's technical characteristics?” |
| Supporting data | summary configuration plus an allowlist from `technicalSpecifications` |
| Strengths | Omits missing values; allowlists technical labels; excludes arbitrary internal keys; compact storage formatting; no empty section |
| Weaknesses | Current assembler always supplies an empty technical-specification record, so only summary fields render; specifications arrive after decision content but do not explain why they matter |
| Repetition | Model, chip, RAM, storage, screen, color and year repeat Hero/inventory |
| Trust risks | Low if values remain allowlisted; risk rises if technical facts are framed as benefits without context |
| Missing evidence | Source/provenance and customer-facing consequence |
| Progressive disclosure | Keep essential configuration in Hero; place complete technical rows in a collapsed or lower-priority reference section without hiding decision-critical trade-offs |

Specifications are reference material, not the decision architecture.

### 10. Policies and Support

| Dimension | Current assessment |
|---|---|
| Components | `PoliciesAndSupport`, `publicSalesPolicies` |
| Purpose | Explain immediate purchase/handoff expectations and provide contact |
| Cognitive question | “What happens if I want to continue?” |
| Supporting data | three static public sales-process statements; machine identity; contact channel |
| Strengths | Calm wording; asks customers to confirm condition before deposit; no false urgency; direct machine context |
| Weaknesses | Heading suggests broader support than the content proves; no machine-specific policy applicability is used even though the DTO contains it; no warranty scope, exclusions or post-purchase process |
| Repetition | Contact repeats Hero and sticky bar |
| Trust risks | “Hỗ trợ trực tiếp sau khi nhận máy” is vague and not predictable enough to satisfy the Trust System |
| Missing evidence | Policy identifiers, applicability, warranty state, exclusions, process, escalation and Care content |
| Progressive disclosure | Show a short next-step panel; link to complete approved policies when real destinations exist |

This is immediately usable as a Decision Panel, but it is not yet a complete Care section.

### 11. Sticky action bar

| Dimension | Current assessment |
|---|---|
| Component | `PublicMachineStickyBar` |
| Purpose | Keep identity, price and contact accessible |
| Cognitive question | “How do I continue with this machine?” |
| Supporting data | display name, chip/RAM/SSD, price and contact channel |
| Strengths | Machine-specific context; compact mobile behavior; no urgency |
| Weaknesses | Persistent conversion emphasis can compete with the dossier's learning sequence; hides price on smaller screens; provides no “question still unclear” framing |
| Repetition | Identity, configuration, price and contact all repeat |
| Trust risks | Low if it remains a contact affordance; higher if copy becomes purchase pressure |
| Missing evidence | None required for contact, but decision state is unknown |
| Progressive disclosure | Retain as a low-pressure contact action; do not add scarcity or “buy now” behavior |

### 12. Loading and not-found states

| Dimension | Current assessment |
|---|---|
| Components | route `loading.tsx`, route `not-found.tsx`, shared `PageState` |
| Purpose | Communicate pending and absent public dossier states |
| Cognitive question | “Is this dossier still loading, or is it unavailable?” |
| Supporting data | route lifecycle |
| Strengths | Semantic status; restrained copy; unavailable machine does not leak rejection reason |
| Weaknesses | No route-specific database-error state; repository failures may surface through the route error boundary rather than a calm detail-level state |
| Trust risks | Low; exposing diagnostic/rejection details would be a privacy risk |
| Progressive disclosure | No change required for architecture; error behavior merits a separate reliability review |

## Inactive Legacy Detail Stack

The same directory contains an older `MachineDetail` / `MachinePassport` implementation:

- `MachineDetailView`
- `MachineSummary`
- `MachineGallery`
- `DecisionSpecificationsView`
- `MachineExpertSummary`
- `MachineCondition`
- `TechnicalSpecificationsView`
- `IncludedItems`
- `SalesProcess`
- `CompareAlternatives`
- supporting legacy model and Passport components

No active route imports `MachineDetailView`. These components model attractive future concepts, but they must not be reused as if their data were live:

- legacy inspection is always a positive result type;
- legacy warranty is a numeric duration;
- legacy Passport requires verified timestamps and inspection content;
- legacy gallery calls images “minh họa” rather than using the active public-image contract;
- legacy related-choice copy promises suggestions without a related-machine source.

The legacy stack is reference/debt, not a shortcut for Phase 3 implementation. Any future cleanup should be a separate, evidence-backed deletion task after import verification.

## Current Contract Readiness

### Fields populated from current public source

- identity: code, slug, display name, family;
- configuration: chip, RAM, SSD, color, derived year/screen where parseable;
- price and availability;
- approved public gallery and image count;
- battery health and cycle count when present;
- cosmetic grade;
- approved public condition summary;
- contextual label;
- publication timestamps;
- expert summary when editorial content exists;
- suitable-for and not-suitable-for editorial arrays;
- included-item values;
- policy applicability array, though the active page does not use it.

### Fields present but currently assembled as empty or unknown

- warranty: always `unknown`;
- inspection: always `not_available`;
- Passport facts: always empty;
- Passport timeline: always empty;
- source verification: always `unknown`;
- repair status: always `unknown`;
- decision specifications: always empty;
- technical specifications: always empty;
- related machines: always empty.

These typed placeholders are safe public contract states, but they are not proof that operational assessment occurred. UI copy may say “Chưa có thông tin công khai” where appropriate. It must not infer “not inspected,” “never repaired,” “no history,” or “no warranty.”

## Proposed Decision Dossier Map

### Recommended order

```text
Breadcrumb
Hero Summary
Suitable For
Not Suitable For
Benefits
Trade-offs
Known
Unknown
Machine Evidence
Timeline
Passport
Decision Panel
Care
Related Machines (only when justified)
Sticky low-pressure contact action
```

Not every target section should render in the first implementation. Empty sections are not progress. Each section must meet a minimum data threshold.

## Proposed Section Architecture

### 1. Hero Summary

**Primary question:** “What exact machine am I considering?”

**Content responsibility:**

- real machine gallery;
- availability;
- public identity and code;
- compact configuration;
- price;
- one short, reviewed decision orientation if `expertSummary` is suitable for that use;
- restrained contact action.

**Current mapping:**

- `PublicMachineGallery`
- `DecisionPanel`
- `summary`
- `expertSummary`
- `ContactActionLink`

**Readiness:** Immediately implementable.

**Boundary:** Gallery/contact remain client islands; identity and summary can eventually be server-rendered.

**Rules:**

- do not place Passport badges in the Hero unless they link to substantive content;
- do not treat contextual labels as recommendations;
- do not promote price above fit;
- do not describe `expertSummary` as inspection evidence.

### 2. Suitable For

**Primary question:** “Does this match my work, constraints and priorities?”

**Content responsibility:** Reviewed audience/use-case statements with specific reasoning.

**Current mapping:**

- `machine.suitableFor`
- suitable half of `MbmcRecommendation`

**Readiness:** Immediately implementable when the array is non-empty.

**Boundary:** Server-capable static presentation.

**Minimum content standard:**

- describe a person, workload or constraint;
- explain why a meaningful machine characteristic supports that fit;
- avoid “most users,” “perfect,” “best” or generic positive language.

If no approved suitability content exists, omit the section rather than derive it from specifications.

### 3. Not Suitable For

**Primary question:** “Under what circumstances should I not buy this machine?”

**Current mapping:**

- `machine.notSuitableFor`
- non-suitable half of `MbmcRecommendation`

**Readiness:** Immediately implementable when non-empty.

**Boundary:** Server-capable static presentation.

**Product value:** This section directly fulfills “nói cả điều chiếc máy không làm được” and protects against fit-driven regret.

**Trust rule:** It must be as visible and legible as Suitable For, not hidden in an accordion or visually downgraded.

### 4. Benefits

**Primary question:** “What meaningful value do I receive?”

**Current mapping:** No dedicated field or component.

**Potential current inputs:** `expertSummary`, configuration and condition facts, but these are not safe to split automatically into benefits.

**Readiness:** Implementable with a reviewed DTO extension.

**Proposed contract responsibility:** A structured list of public editorial judgements, each optionally referencing supporting public facts.

**Marketing risk:** Highest when benefits become generic praise. Every benefit must answer “for whom?” or “in what use?”

**Do not:** Generate benefits from chip, RAM, price or cosmetic grade without reviewed editorial context.

### 5. Trade-offs

**Primary question:** “What am I giving up, accepting or paying more for?”

**Current mapping:** No dedicated field or component.

**Potential current inputs:** `notSuitableFor` may expose consequences, but it is not equivalent to a trade-off.

**Readiness:** Implementable with a reviewed DTO extension.

**Proposed contract responsibility:** Structured trade-off statements with:

- the benefit/choice involved;
- the corresponding cost, limit or uncertainty;
- optional supporting public fact references.

**Product value:** Required by the Design Principles and Decision Psychology. This cannot remain implicit in specifications.

**Do not:** Infer trade-offs algorithmically from generic model knowledge in Phase 3A.

### 6. Known

**Primary question:** “Which facts about this exact machine are publicly established?”

**Current mapping:**

- public identity;
- configuration;
- price/status;
- battery/cycle values where present;
- cosmetic grade;
- condition summary;
- included items with non-null public states;
- approved public images;
- publication facts.

**Readiness:** Partially immediately implementable.

**Boundary:** Pure server-capable presentation from current DTO.

**Important distinction:** Current values can be grouped as Known only when the projection supplies an affirmative value. A missing nullable value is not a Known negative.

**DTO-extension opportunity:** Add stable fact identifiers and evidence references so Known items are not only display strings.

### 7. Unknown

**Primary question:** “What remains uncertain or unavailable publicly?”

**Current mapping:**

- warranty `status: "unknown"`;
- inspection `status: "not_available"`;
- Passport `sourceVerification: "unknown"`;
- Passport `repairStatus: "unknown"`;
- nullable values and empty arrays, but only with careful semantic treatment.

**Readiness:** Narrowly implementable now; robust implementation requires contract/source refinement.

**Safe current language:**

- “Chưa có thông tin kiểm định công khai.”
- “Thông tin bảo hành hiện chưa được xác định trong hồ sơ công khai.”
- “Hồ sơ công khai chưa có dữ liệu xác minh nguồn gốc.”
- “Hồ sơ công khai chưa có thông tin kết luận về sửa chữa.”

**Unsafe inferences:**

- “Máy chưa được kiểm định.”
- “Máy không có bảo hành.”
- “Máy chưa từng sửa.”
- “Không có lịch sử.”

**Future contract need:** Distinguish:

- known unknown;
- not collected;
- not reviewed;
- withheld from public view;
- not applicable;
- evidence searched but not found.

Without this distinction, Unknown can accurately describe only the public dossier's information state, not the machine's real-world history.

### 8. Machine Evidence

**Primary question:** “What supports the facts MBMC is showing?”

**Current mapping:**

- approved public images;
- image captions;
- battery/cycle/condition facts;
- `DetailedImages`;
- `MachineEvidenceGrid`, although it currently renders facts.

**Readiness:** Basic visual evidence is immediately implementable; claim-level evidence requires DTO extensions.

**Target responsibility:**

- show evidence artifacts separately from claims;
- state what each artifact supports;
- state scope and limitations;
- omit unavailable evidence without implying a favorable result.

**Future evidence shape should support:**

- stable public evidence ID;
- kind/type;
- public asset or observation;
- captured/observed timestamp where approved;
- caption;
- supported public fact IDs;
- evidence availability/status;
- public limitations.

**Boundary:** Interactive image viewer remains client-side; evidence labels and relationships can be server-rendered.

### 9. Timeline

**Primary question:** “What public lifecycle events are known for this machine?”

**Current mapping:**

- `passport.timeline`, always empty;
- `firstPublishedAt` and `lastPublishedAt`;
- rendering inside `PassportDossier`.

**Readiness:** Future architecture, except for a minimal publication record.

**Safe immediate option:** Keep “Công khai từ” as a Passport fact. Do not present one publication timestamp as a machine-history timeline.

**Future requirements:**

- approved public event taxonomy;
- source and privacy rules;
- distinction between machine event, MBMC operational event and publication event;
- event confidence/evidence where relevant;
- no fabricated continuity between sparse events.

### 10. Passport

**Primary question:** “What is the stable public identity and record boundary of this exact machine?”

**Current mapping:** `PassportDossier`, `PublicMachinePassportV1`.

**Readiness:** Compact Passport immediately implementable; full Passport requires populated facts and governed history.

**Immediate content:**

- machine code;
- public model;
- public availability;
- first-publication date when present;
- explicit completeness note if the Passport has no additional facts.

**Future content:**

- structured public facts;
- inspection state;
- source-verification state;
- repair state;
- timeline.

**Order:** After Known, Unknown and Evidence. Passport organizes the record; it should not be used as the first answer to suitability.

### 11. Decision Panel

**Primary question:** “Given what I now understand, what can I do next?”

**Current mapping:**

- contact portion of `DecisionPanel`;
- `PoliciesAndSupport`;
- `ContactActionLink`;
- machine identity and suggested contact context;
- `PublicMachineStickyBar`.

**Readiness:** Immediately implementable.

**Target responsibility:**

- restate the exact machine identity;
- invite questions about remaining uncertainty;
- allow machine-specific contact;
- link back to inventory;
- avoid “buy now,” urgency or implied recommendation.

**Boundary:** Contact-channel resolution is a client island; static context is server-capable.

### 12. Care

**Primary question:** “What happens after I receive the machine?”

**Current mapping:**

- three `publicSalesPolicies`;
- unused `policyApplicability`;
- warranty type, currently always unknown.

**Readiness:** A narrow handoff/support explanation is immediately implementable; true Care is future architecture.

**Current safe content:**

- direct condition confirmation before deposit;
- handoff or delivery arrangement;
- a carefully bounded statement that direct support is available.

**Missing data/content:**

- specific Care destination;
- approved warranty scope and exclusions;
- return/remedy process;
- support channels and response expectations;
- machine-specific policy applicability;
- escalation path.

Do not title the current three statements as a complete Care system.

### 13. Related Machines

**Primary question:** “If this is not suitable, what is the next relevant alternative?”

**Current mapping:**

- `relatedMachines`, always empty;
- inventory route;
- inactive `CompareAlternatives`.

**Readiness:** Future architecture.

**Justification threshold:** Render only when the relationship has an explainable decision reason, such as:

- lower price for the same essential workload;
- more memory for a stated workload;
- different size/portability trade-off;
- a machine that addresses a specific “not suitable” condition.

Do not render generic “you may also like,” newest inventory, or similarity based only on model family. Until reasoning exists, a link to all available machines is more honest.

## Target Component Tree

The conceptual target is:

```text
PublicMachinePage                              Server
├── generateMetadata                          Server
├── DecisionDossierPage                       Prefer server composition
│   ├── MachineBreadcrumb                     Server-capable
│   ├── DossierHero
│   │   ├── MachineMediaExperience             Client island
│   │   └── MachineIdentitySummary             Server-capable
│   ├── FitAssessment
│   │   ├── SuitableFor                        Server
│   │   └── NotSuitableFor                     Server
│   ├── Benefits                               Server; DTO extension
│   ├── TradeOffs                              Server; DTO extension
│   ├── KnownUnknown
│   │   ├── KnownFacts                         Server
│   │   └── UnknownFacts                       Server
│   ├── MachineEvidence
│   │   ├── EvidenceSummary                    Server
│   │   └── EvidenceMediaViewer                Client island
│   ├── MachineTimeline                        Server; future
│   ├── MachinePassport                        Server
│   ├── DecisionPanel
│   │   └── ContactActionLink                  Client island
│   ├── MachineCare                            Server; partial/future
│   └── RelatedMachines                        Server + card islands; future
└── PublicMachineStickyBar                     Existing client island
```

This tree describes responsibilities, not a mandate to create one file per node. Avoid generic section abstractions until repeated behavior—not merely repeated markup—justifies them.

## Repository Mapping Matrix

| Proposed section | Existing component | Existing data | Missing data | Reusable primitive | Responsibility |
|---|---|---|---|---|---|
| Hero Summary | `DecisionPanel`, `PublicMachineGallery` | summary, gallery, expert summary | reviewed one-line orientation standard | presentation formatters, contact action | Server composition plus gallery/contact client islands |
| Suitable For | `MbmcRecommendation` | `suitableFor` | rationale/fact references | semantic lists, detail section language | Server-capable |
| Not Suitable For | `MbmcRecommendation` | `notSuitableFor` | rationale/fact references | semantic lists | Server-capable |
| Benefits | None | none dedicated | reviewed benefits | detail section styles | Server after DTO extension |
| Trade-offs | None | none dedicated | reviewed trade-offs | detail section styles | Server after DTO extension |
| Known | `MachineEvidenceGrid`, specs, Passport | current affirmative public facts | stable fact IDs/evidence links | definition-list patterns | Server-capable |
| Unknown | None | typed unknown/not-available statuses | reason/scope taxonomy | restrained state/callout language | Server-capable, source-dependent |
| Machine Evidence | Gallery, `DetailedImages`, current fact grid | approved images and facts | provenance and claim linkage | media provider/lightbox | Server labels + client viewer |
| Timeline | `PassportDossier` | publication timestamps; empty timeline | governed events and evidence | ordered timeline styles | Server |
| Passport | `PassportDossier` | identity/status/publication | facts, source/repair/inspection rendering and population | definition list | Server-capable |
| Decision Panel | `DecisionPanel`, `PoliciesAndSupport`, sticky bar | identity, price, contact, static policies | decision-state context | `ContactActionLink` | Server + narrow client action |
| Care | `PoliciesAndSupport` | static handoff statements | policy details, warranty, support process | policy list | Server |
| Related Machines | None active | empty `relatedMachines` | explainable alternatives | `MachineCard` with contextual heading | Server + existing card islands |

## Data Dependency Matrix

| Data concept | Current source | Current public state | Target use | Readiness | Trust constraint |
|---|---|---|---|---|---|
| Identity | machine + publication | Populated | Hero, Passport, Decision Panel | Immediate | Must remain machine-specific |
| Availability | normalized machine status | Populated | Hero, Passport, sticky bar | Immediate | No scarcity language |
| Price | expected retail price | Populated | Hero, sticky bar | Immediate | Not evidence of fit |
| Configuration | machine row / parsed model | Mostly populated | Hero, Known, reference specs | Immediate | Missing is Unknown, not false |
| Condition summary | reviewed editorial | Required for publication | Known, fit rationale, Evidence context | Immediate | Judgement wording must not exceed observations |
| Battery/cycles/grade | machine row | Nullable | Known | Immediate | Provenance is absent |
| Included items | reviewed editorial | Nullable booleans/list | Known | Immediate | `null` differs from `false` |
| Expert summary | reviewed editorial | Optional | Hero orientation | Immediate when present | Human judgement, not fact |
| Suitable For | reviewed editorial | Optional array | Fit | Immediate when present | Must be specific and reviewed |
| Not Suitable For | reviewed editorial | Optional array | Non-fit | Immediate when present | Equal prominence |
| Benefits | None dedicated | Missing | Benefits | DTO extension | Must not be generated from specs |
| Trade-offs | None dedicated | Missing | Trade-offs | DTO extension | Must be explicit and balanced |
| Known fact IDs | None | Missing | Known/Evidence linking | DTO extension | Stable identifiers required |
| Unknown reasons | Default assembler states | Coarse | Unknown | Partial / DTO extension | Public-information state only |
| Public images | approved image relation | Populated | Gallery/Evidence | Immediate | Image does not prove hidden/internal state |
| Evidence provenance | None in DTO | Missing | Machine Evidence | Future/DTO extension | Evidence must support named claims |
| Inspection | hardcoded unavailable | Not available | Unknown / future Evidence | Future | Never imply pass/fail |
| Warranty | hardcoded unknown | Unknown | Unknown / Care | Future | Never imply coverage |
| Source verification | hardcoded unknown | Unknown | Unknown / Passport | Future | Do not equate with machine origin |
| Repair state | hardcoded unknown | Unknown | Unknown / Timeline | Future | “No evidence” differs from “not repaired” |
| Passport facts | hardcoded empty | Missing | Passport | Future/DTO extension | Only reviewed public facts |
| Timeline | hardcoded empty | Missing | Timeline | Future | Sparse events are not complete history |
| Policy applicability | editorial array | Populated but unused | Care | Potentially immediate after semantics review | Must resolve to approved public policy content |
| Related machines | hardcoded empty | Missing | Alternatives | Future | Must explain why related |

## Implementation Classification

### Phase 3A.1 — Immediately implementable with the current DTO

- Reorder the active page around the target cognitive questions.
- Keep Hero identity, gallery, configuration, price and calm contact action.
- Split `MbmcRecommendation` into separately visible:
  - Suitable For;
  - Not Suitable For;
  - optional expert orientation.
- Move suitability and non-suitability directly after Hero.
- Introduce a Known section using only affirmative current public values.
- Introduce a narrow Unknown section using explicit current statuses and public-information language.
- Reposition approved images and condition facts as the current Evidence/observation layer, with accurate labels.
- Move Passport after Known/Unknown/Evidence.
- Consolidate final contact/policy content into a Decision Panel responsibility.
- Keep specifications as lower-priority reference material.
- Retain a narrow handoff/support section without calling it complete Care.
- Omit Timeline and Related Machines when empty.

No database change is required for this phase. It should not manufacture Benefits or Trade-offs from existing prose.

### Phase 3A.2 — Implementable with reviewed public DTO extensions

Requires a separately approved contract evolution and source mapping:

- structured Benefits;
- structured Trade-offs;
- stable Known fact identifiers;
- explicit Unknown items with reason/scope;
- judgement-to-fact references;
- evidence records and fact-to-evidence references;
- governed policy references;
- richer Passport facts;
- explicit section completeness/provenance semantics.

Because `PublicMachineDetailV1` is versioned and immutable in meaning, material new semantics should favor a new version or a formally backward-compatible extension policy. Do not silently repurpose `decisionSpecifications`, `technicalSpecifications`, or `PublicFact` to carry judgement and evidence relationships.

### Phase 3A.3 — Future architecture

- complete inspection publication;
- repair-history state backed by approved evidence;
- source verification;
- machine lifecycle Timeline;
- complete warranty and Care behavior;
- related-machine reasoning;
- Recommendation integration based on a customer's known needs;
- analytics tied to decision confidence;
- server/client boundary optimization after behavior is protected.

## Product Review

### Sections that directly encourage understanding

- Suitable For;
- Not Suitable For;
- Trade-offs;
- Known;
- Unknown;
- Evidence with explicit scope;
- predictable policy/Care content;
- a final “what remains unclear?” Decision Panel.

These sections translate data into a decision without taking agency away from the customer.

### Sections at risk of becoming marketing

| Section | Marketing failure mode | Required guardrail |
|---|---|---|
| Hero | Contextual label, price and CTA overwhelm fit | Keep identity/orientation primary; no urgency |
| Suitable For | Generic “ideal for everyone” audience | Require specific workload/constraint and reason |
| Benefits | Specification praise | State meaningful consequence for a defined need |
| Passport | Trust badge without substantive record | Show actual scope/completeness |
| Evidence | Fact values presented as proof | Separate claim from supporting artifact |
| Decision Panel | Contact becomes the page's conclusion | Frame around remaining questions, not closing |
| Related Machines | Ecommerce recommendation carousel | Require explainable decision relationship |

### Unsupported claims to prohibit

- “đã kiểm định” while inspection remains `not_available`;
- “chưa từng sửa” while repair status is `unknown`;
- “nguồn gốc đã xác minh” while source verification is `unknown`;
- “có bảo hành” while warranty is `unknown`;
- “lịch sử đầy đủ” from sparse or empty public events;
- “bằng chứng đầy đủ” from an approved image gallery;
- “phù hợp nhất,” “tốt nhất,” or “được đề xuất” without a customer-specific decision process;
- interpreting `null` as “không có”;
- treating editorial judgement as measured fact.

### Current duplicate information

- model, configuration and status across Hero, Passport, specifications and sticky bar;
- code across Passport, contact context and support panel;
- contact action in Hero, support panel and sticky bar;
- gallery media in Hero and Detailed Images;
- condition facts in cards, Evidence grid, captions and editorial summary;
- suitability and expert summary inside one late recommendation section.

Duplication is justified only when it supports a different task:

- Hero: orientation;
- Passport: stable identity record;
- sticky bar: continuation;
- Evidence: verification.

Repeated content should be shortened according to task rather than copied verbatim.

### Places customers currently have to infer

- why a specification matters to their work;
- why a suitability statement follows from machine facts;
- what trade-off accompanies a positive feature;
- whether absent inspection means “not inspected” or merely “not public”;
- whether Passport is complete;
- what each image proves;
- whether support includes warranty, repair, returns or only direct communication;
- why another machine would be a better alternative.

The target Dossier should state these relationships explicitly or omit the claim.

## Progressive Disclosure Strategy

Decision-critical content must remain visible:

- Suitable For;
- Not Suitable For;
- major Trade-offs;
- consequential Unknowns;
- final next step.

Reference detail may be progressively disclosed:

- full technical specifications;
- additional evidence images;
- extended Passport facts;
- detailed timeline events;
- policy detail;
- secondary included items.

Do not use disclosure to hide:

- non-suitability;
- uncertainty;
- defects;
- warranty limitations;
- trade-offs.

Do not add accordions merely to reduce page length. Disclosure should correspond to cognitive priority.

## File-by-File Impact Plan

This is a planning map, not authorization to change files.

| File | Likely future impact | Phase | Notes |
|---|---|---|---|
| `src/app/(sales)/may/[slug]/page.tsx` | Preserve loader/metadata; possibly adopt a server composition shell | 3A.1/later | No route change |
| `PublicMachineDetailView.tsx` | Reorder sections; reduce top-level responsibility | 3A.1 | Avoid boundary refactor in same commit as IA change |
| `DecisionPanel.tsx` | Narrow Hero responsibility; remove badge-like anchors or point them to substantive content | 3A.1 | Preserve contact behavior |
| `SpecificationsAndRecommendation.tsx` | Split orientation, Suitable For, Not Suitable For and specifications responsibilities | 3A.1 | File name currently conflates unrelated concepts |
| `DecisionDossier.tsx` | Replace grid-driven order with cognitive sequence composition | 3A.1 | Passport should no longer lead |
| `MachineEvidence.tsx` | Separate public facts from Evidence availability/presentation | 3A.1/3A.2 | Do not rename `buildMachineEvidence` without separate semantic review |
| `machine-evidence-presentation.ts` | Continue formatting current public facts; later accept stable fact IDs | 3A.1/3A.2 | Current function safely omits missing data |
| `PassportDossier.tsx` | Compact identity now; later render governed facts/statuses/timeline | 3A.1/3A.3 | Add completeness language only if approved |
| `ConditionAndImages.tsx` | Reframe as supporting observations; remove unjustified gallery duplication | 3A.1 | Preserve shared viewer behavior |
| `PublicMachineGallery.tsx` | Reuse unchanged initially | 3A.1 | Interaction is already mature |
| `PublicMachineMediaProvider.tsx` | Reuse; boundary refactor later | Future | Existing hook warnings and focus behavior raise refactor risk |
| `SlidingImageTrack.tsx` | No IA change | None | Preserve interaction |
| `SupportAndSticky.tsx` | Separate Decision Panel, Care/policy and sticky responsibilities over small commits | 3A.1/future | Keep machine contact contract |
| `technical-specifications-presentation.ts` | Keep allowlisted reference rows | 3A.1 | Do not derive benefits |
| `public-sales-policies.ts` | Review wording and policy applicability before calling content Care | 3A.1/future | Static copy is not a complete policy model |
| `contracts.ts` | Add/version Benefits, Trade-offs, Known/Unknown and Evidence relationships | 3A.2 | Requires owner-approved contract design |
| `assemblers.server.ts` | Populate only reviewed new fields; stop hardcoded placeholders only when source exists | 3A.2/3A.3 | Maintain privacy and freeze guarantees |
| `kernel.server.ts` | Normalize approved source fields | 3A.2/3A.3 | No raw-field leakage |
| `project-public-candidates.ts` | Parse added repository fields safely | 3A.2/3A.3 | Treat source as untrusted |
| `supabase-public-machine-repository.ts` | Extend explicit allowlist only after source/governance approval | 3A.2/3A.3 | Never use wildcard selects |
| `public-inventory.test.mjs` | Add ordering, omission, claim-boundary and projection tests | All | Do not rewrite test architecture |
| `globals.css` | Reorder/reuse existing detail styles; no visual redesign | 3A.1 | Prefer minimal selector changes |
| Legacy detail/Passport files | No reuse by default; evaluate separate removal | Separate debt task | Avoid mixing cleanup with Dossier work |

## Suggested Implementation Sequence

### Commit group 1 — Protect current truth

1. Add regression tests for current public-detail contract states.
2. Add explicit tests for prohibited inspection, repair, source and warranty claims.
3. Record the active component tree and baseline section order.

### Commit group 2 — Separate judgement

1. Extract expert orientation from the combined recommendation section.
2. Render Suitable For and Not Suitable For as independent semantic sections.
3. Move both directly after Hero.
4. Preserve omission when editorial arrays are empty.

### Commit group 3 — Establish Known and Unknown

1. Reuse current fact formatting for affirmative Known values.
2. Add only explicitly safe Unknown messages from current status unions.
3. Test `null`, `unknown`, `not_available`, `not_applicable`, false and empty-array semantics separately.

### Commit group 4 — Correct Evidence responsibility

1. Relabel the current fact grid accurately.
2. Place supporting images after Known/Unknown.
3. Remove or reduce duplicate image presentation only after interaction regression coverage.
4. Keep inspection absent until real public inspection data exists.

### Commit group 5 — Reposition Passport and decision action

1. Move Passport after Evidence.
2. Keep only substantive current Passport fields.
3. Consolidate final support/contact responsibility into the Decision Panel.
4. Retain the sticky action as a separate low-pressure utility.

### Commit group 6 — Reference content

1. Keep technical specifications lower in hierarchy.
2. Present current handoff/support content with bounded language.
3. Omit empty Timeline, full Care and Related Machines.

### Later contract work

Design and approve DTO/source changes before implementing Benefits, Trade-offs, evidence linkage, complete Unknown taxonomy, Timeline, Care or related-machine reasoning.

## Risk Assessment

| Risk | Level | Why | Mitigation |
|---|---|---|---|
| Inventing trade-offs from specifications | High | Converts generic assumptions into machine-specific judgement | Require reviewed fields |
| Turning missing data into favorable claims | High | Violates Honest Uncertainty | Test union/null semantics |
| Calling facts Evidence | High | Implies provenance not present in DTO | Separate fact and artifact terminology |
| Passport overstatement | High | Empty facts/timeline can look complete | State scope; render only substantive content |
| Unknown wording misstates operational reality | High | Assembler defaults describe public state, not machine history | Use “hồ sơ công khai chưa có…” |
| Suitability becomes sales copy | High | Generic fit language increases persuasion | Require audience, need and reason |
| Reordering breaks gallery/lightbox | Medium | Media context currently spans distant sections | Reorder within provider first; refactor boundary later |
| Splitting client boundary causes regressions | Medium/High | Contact query propagation and shared gallery index are coupled | Separate optimization phase |
| Repeated identity creates noise | Medium | Multiple components serve different tasks | Define compact task-specific variants |
| Care implies warranty | High | Current support copy is vague and warranty unknown | Keep narrow handoff language |
| Related Machines becomes ecommerce upsell | Medium/High | Current contract empty; no rationale | Omit until explainable |
| DTO V1 semantic drift | High | Repurposing existing fields breaks public meaning | Version or formally extend contract |
| Legacy stack is accidentally reactivated | High | It assumes positive inspection/warranty content | Treat as dead code, not reusable source |

## Acceptance Criteria

### Phase 3A.1

- Page order answers suitability before Passport, specifications and contact conclusion.
- Suitable For and Not Suitable For are independently identifiable sections.
- Non-suitability has equal semantic prominence and is not hidden.
- No suitability content is derived automatically from configuration.
- Known contains only affirmative current public values.
- Unknown copy describes the public dossier's information state and makes no unsupported machine-history inference.
- Current public facts are not labelled as underlying Evidence unless an evidence artifact supports them.
- Approved images remain inspectable with current keyboard, swipe, lightbox and focus behavior.
- Passport no longer implies a complete history.
- Timeline and Related Machines do not render when unsupported.
- Decision Panel remains low pressure and machine-specific.
- Current inventory route, detail URL, public DTO and contact destination behavior remain intact for the immediate phase.

### DTO-extension phase

- Benefits and Trade-offs are reviewed public judgement fields, not derived presentation guesses.
- Known items can reference stable public Evidence.
- Unknown items encode scope/reason rather than relying on `null`.
- Evidence records contain public-safe provenance and limitations.
- Privacy validation and explicit repository selects cover every new field.
- Contract versioning/backward compatibility is documented and tested.

### Quality and accessibility

- One page-level `h1`.
- Logical `h2`/`h3` hierarchy follows cognitive order.
- Lists use semantic list markup.
- Known and Unknown are not distinguished by color alone.
- Hidden/collapsed content does not conceal consequential uncertainty or non-fit.
- Contact remains a link/action with descriptive text.
- Gallery remains keyboard and screen-reader operable.
- Loading and not-found states remain restrained.
- Existing tests, production build and ESLint pass without new warnings.

## Test Strategy

### Architecture/order tests

- Hero precedes fit.
- Suitable For precedes Not Suitable For only if owner confirms that order; both precede Benefits/Trade-offs and Known/Unknown.
- Known precedes Unknown or vice versa according to the final owner decision, but both precede Evidence.
- Evidence precedes Passport.
- Decision Panel follows understanding/trust sections.
- Empty future sections are absent.

### Semantic data tests

- `null` included-item values do not render as “Không kèm.”
- `false` included-item values may render as known absence only when explicitly public.
- inspection `not_available` produces public-information wording, not pass/fail.
- warranty `unknown` does not render a duration.
- repair `unknown` does not become “chưa từng sửa.”
- source verification `unknown` does not become “không rõ nguồn gốc.”
- empty timeline does not produce a “complete history” message.
- empty suitability/non-suitability sections are omitted.

### Product-law claim tests

Assert absence of:

- urgency and scarcity;
- “100% zin”;
- unsupported “đã kiểm định”;
- universal warranty;
- complete history;
- “best,” “recommended for you” or equivalent without recommendation context;
- automatic benefit/trade-off generation.

### Interaction regression

- gallery arrows, thumbnails, keyboard and swipe;
- shared detailed-image lightbox index;
- Escape, focus trap and focus return;
- contact-channel destination;
- sticky action behavior across breakpoints.

## Rollback Strategy

Phase 3 implementation should be partitioned so each responsibility can be reverted independently:

1. **Fit-order rollback:** restore the previous component order without touching data or media behavior.
2. **Known/Unknown rollback:** remove only the new presentation components; current fact grid and Passport remain available.
3. **Evidence-label rollback:** restore current labels without reverting gallery interaction.
4. **Passport/order rollback:** move the existing component back without altering its DTO.
5. **Decision Panel rollback:** restore existing support composition while retaining contact infrastructure.
6. **DTO-extension rollback:** deploy only after readers tolerate the previous contract version; avoid coupled database/UI cutovers.

Do not combine:

- client-boundary refactoring with page reordering;
- legacy-code deletion with active Dossier changes;
- new data ingestion with new public claims;
- gallery interaction changes with Evidence semantics.

No database migration should be required for the immediate architecture phase.

## Owner Decisions

### Decisions required before Phase 3A.1 implementation

1. **Suitability publication threshold**
   - Must both Suitable For and Not Suitable For be present before either section is published?
   - Recommendation: require both for a complete fit assessment; if only one exists, allow the valid section only if its absence is not presented as a favorable conclusion.

2. **Expert summary role**
   - Should it appear in Hero as orientation, or remain near fit as human judgement?
   - Recommendation: keep a short reviewed orientation near fit unless content standards guarantee it does not duplicate Hero facts or imply inspection.

3. **Unknown visibility**
   - Should the first release show current coarse public-information Unknowns?
   - Recommendation: yes, with explicit “hồ sơ công khai chưa có…” wording and no operational inference.

4. **Evidence terminology**
   - May approved images and public observations be called Evidence before claim-level provenance exists?
   - Recommendation: call images “hình ảnh công khai” or “quan sát hỗ trợ”; reserve “Evidence” for artifacts tied to named facts.

5. **Passport completeness framing**
   - What minimum content qualifies the current identity record to be called “MBMC Passport”?
   - Recommendation: retain the name only with a one-line scope statement; otherwise label it “Hồ sơ nhận diện máy.”

6. **Decision Panel placement**
   - Should the main contact action remain in Hero as well as at the end?
   - Recommendation: retain a restrained Hero contact action for ready customers and use the final panel for uncertainty-oriented conversation; no urgency or purchase action.

7. **Care label**
   - Is the current direct-support statement operationally defined enough to use “Care” publicly?
   - Recommendation: no; retain “Bàn giao và hỗ trợ” until policy scope and post-purchase process are approved.

### Decisions required before DTO extension

8. **Benefits and Trade-offs editorial model**
   - Define authorship, review, minimum rationale and whether each item must reference a public fact.

9. **Known/Unknown taxonomy**
   - Define the difference between not collected, not reviewed, not public, unknown, not applicable and no evidence found.

10. **Evidence governance**
    - Define evidence types, public eligibility, provenance, timestamps, limitations and claim linkage.

11. **Timeline scope**
    - Decide which operational, publication, ownership, inspection and repair events may be public and how gaps are disclosed.

12. **Policy/Care applicability**
    - Define how `policyApplicability` resolves to approved public policy content and how warranty is represented.

13. **Related-machine reasoning**
    - Define permitted relationship reasons and whether editorial or deterministic selection owns them.

14. **Contract versioning**
    - Decide whether Phase 3 semantics create `PublicMachineDetailV2` or follow an explicit additive V1 policy.

## Critical Blockers

### Not blockers for immediate IA work

- empty Timeline;
- empty related machines;
- absent automated Recommendation;
- incomplete inspection/warranty/source/repair data;
- current top-level client boundary;
- absent analytics;
- legacy detail components.

The immediate page can improve by reordering current truth and exposing uncertainty honestly.

### True blockers by section

- Benefits: blocked by reviewed structured content.
- Trade-offs: blocked by reviewed structured content.
- claim-level Evidence: blocked by provenance and relationship data.
- complete Timeline: blocked by governed event data.
- complete Passport: blocked by populated facts and status sources.
- Care: blocked by approved policy and post-purchase operating definitions.
- Related Machines: blocked by explainable selection semantics and data.

## Recommended First Release Boundary

The first Decision Dossier release should include:

1. Hero Summary
2. Suitable For, when approved data exists
3. Not Suitable For, when approved data exists
4. Known
5. Narrow Unknown
6. Public facts and supporting images, accurately labelled
7. Compact Passport
8. Lower-priority technical reference
9. Decision Panel
10. Narrow handoff/support content

It should omit:

- Benefits and Trade-offs until explicit reviewed content exists;
- full Evidence claims;
- Timeline;
- complete Care;
- Related Machines.

This boundary materially improves the decision flow without pretending that the future Trust System or Recommendation architecture is already present.

## Phase 3A First-Release Implementation Record

Implementation date: 2026-07-23

### Implemented architecture

The active `/may/[slug]` detail page now follows this first-release order:

1. Hero
2. Decision Summary
3. Suitable For
4. Not Suitable For
5. Expert Summary
6. Đã xác minh
7. Chưa đủ thông tin
8. Current public supporting information
   - condition summary;
   - battery health when available;
   - cycle count when available;
   - cosmetic grade when available;
   - included items when available;
   - additional approved public images.
9. MBMC Passport
10. Technical reference
11. Final Decision Panel

The sticky machine-specific contact action remains available as an existing utility. Gallery, lightbox, route, repository, projection and contact-channel behavior remain unchanged.

### Decision Summary policy

- The summary contains one short paragraph.
- It does not repeat specifications.
- It asks the customer to review fit, non-fit and public limitations before deciding to contact MBMC.
- It does not describe the machine as recommended, best, preferred or suitable for the current visitor.

### Suitable / Not Suitable publication policy

- Suitable For and Not Suitable For are rendered only when both reviewed editorial arrays contain content.
- If either array is empty, neither section is published.
- Both sections use concise bullet lists and the same section treatment.
- No fit statement is derived from configuration, model knowledge or missing editorial data.

### Expert Summary wording

- `expertSummary` remains a separate optional section.
- The public heading is “Đánh giá từ MBMC.”
- Its eyebrow identifies it as human judgement.
- It is not grouped with “Đã xác minh” and is not presented as inspection or Evidence.

### “Đã xác minh” wording boundary

The first release includes only current public identity information:

- machine code;
- public model;
- public availability state;
- number of public images in the dossier.

The section explicitly states that this is not a comprehensive inspection conclusion.

### “Chưa đủ thông tin” wording boundary

The first release exposes current public-dossier limitations only when their typed statuses require them:

- inspection `not_available`;
- warranty `unknown`;
- source verification `unknown`;
- repair status `unknown`.

Every statement begins from the scope of the public dossier. It does not speculate why information is unavailable and does not infer that:

- the machine was not inspected;
- the machine has no warranty;
- the machine has no source history;
- the machine has never been repaired.

### Supporting-information terminology

- The condition/fact section is labelled “Thông tin công khai hỗ trợ.”
- Additional images are labelled “Hình ảnh công khai.”
- The page does not label the collection as complete Evidence.
- The existing internal `MachineEvidenceGrid` and `buildMachineEvidence` names remain unchanged; this implementation changes public responsibility and wording, not the DTO or underlying presentation contract.

### Passport boundary

- MBMC Passport now follows public facts and supporting images.
- Its public title is “Hồ sơ nhận diện công khai.”
- It renders only the current identity record: code, public model, status and first-publication date when available.
- It explicitly states that it is not a complete history.
- Passport facts and Timeline are not rendered in this release.

### Decision Panel policy

- The final panel asks “Nếu bạn vẫn chưa chắc chắn.”
- It invites the customer to explain what remains unclear.
- It uses the existing machine-specific contact action and copy.
- It contains no urgency, scarcity or purchase pressure.
- Current handoff/support statements remain narrowly worded and are not labelled as complete Care.

### Deferred architecture

- Benefits;
- Trade-offs;
- complete Evidence and provenance;
- Timeline;
- Related Machines;
- Recommendation engine, quiz, scoring or generated results;
- complete Care;
- Decision Stories;
- richer Known/Unknown taxonomy;
- DTO or database changes;
- server/client boundary refactoring;
- visual redesign.

### Remaining data limitations

- inspection remains assembled as `not_available`;
- warranty remains assembled as `unknown`;
- source verification remains `unknown`;
- repair status remains `unknown`;
- Passport facts and Timeline remain empty;
- decision specifications and technical-specification extensions remain empty;
- related machines remain empty;
- current public facts do not contain claim-level evidence provenance;
- Suitable/Not Suitable and Expert Summary depend on optional reviewed editorial content.
