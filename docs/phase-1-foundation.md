# Phase 1 Foundation

Date: 2026-07-23  
Scope: behavior-preserving preparation for future MBMC Decision Studio work

## Source Material

This phase was guided by:

- `docs/repository-audit.md`
- `docs/decision-architecture-gap-analysis.md`
- The seven MBMC brand and product documents under `brand/` and `product/`
- The repository-local Next.js 16 documentation for layouts/pages, Server and Client Components, and error handling

No separate file titled “MBMC Product Handbook” was present in the workspace. The seven MBMC source documents were therefore treated as the available handbook corpus.

## Domain Vocabulary

Use these terms consistently in new code and documentation:

| Term | Meaning in this repository |
|---|---|
| Machine | One physical MacBook represented by a public identity and public lifecycle |
| Decision Dossier | The complete public decision-support composition for one Machine |
| Evidence | A public, display-safe fact backed by the public projection |
| Known | Evidence that the public projection can state from an approved source |
| Unknown | Information the public projection cannot currently substantiate; it is not equivalent to false, failed, or absent |
| Recommendation | Human or system judgement that explains fit and trade-offs; it must remain distinguishable from Evidence |
| Passport | A structured public summary of Machine identity, status, and approved lifecycle Evidence |

Code identifiers use English versions of these terms. Existing public DTO keys and visible Vietnamese labels remain unchanged.

## Foundation Changes

### Shared page states

`PageState` provides one semantic implementation for loading, empty, not-found, and retry states. The single unavailable status remains a direct semantic element. Callers still choose their existing wrapper element, class, heading level, role, copy, and action, so the rendered visual language and public behavior remain unchanged.

Future pages can add consistent states without copying page-shell markup or inventing new state semantics.

### Shared contact action

`ContactActionLink` owns public contact-channel resolution, fallback URL, fallback label, new-tab behavior, and security attributes. The detail hero, support section, and sticky action retain their existing DOM positions and CSS selectors.

Future Decision Dossier and Recommendation surfaces can reuse the contact behavior without duplicating attribution and link-safety logic.

### Machine Evidence terminology

The active detail implementation now uses `MachineEvidence`, `EvidenceAvailabilityAnchors`, and `MachineEvidenceGrid` internally. This replaces ambiguous “Trust and Facts” naming while preserving all visible copy and DTO fields. The anchors describe evidence availability and trust-supporting signals; they do not represent the underlying Evidence.

The distinction prepares the codebase for future Known/Unknown and provenance work:

- Evidence is what the public projection can substantiate.
- Unknown is represented explicitly and must not be inferred as a negative claim.
- Recommendation is judgement and does not become Evidence merely because MBMC publishes it.

### Public DTO guardrails

Comments in the versioned public contract clarify existing semantics without changing the contract:

- Nullable public values mean Unknown.
- `inspection.status = "not_available"` does not mean failed.
- Repair-status values distinguish operational claims from absence of Evidence.
- `PublicFact` is display-safe Evidence; Recommendation fields carry human judgement.

No schema key, union member, assembler output, repository method, or serialized value changed.

## Deliberately Skipped

The following work was reviewed and intentionally excluded:

- Public DTO renaming or version changes: prohibited by the no-contract-change constraint and high-risk at the privacy boundary.
- Decision Dossier reordering: user-visible hierarchy work belongs to a later implementation phase.
- Homepage, Recommendation, Known/Unknown, Timeline, Passport, or Care UI: these require approved product/data contracts.
- Loading skeletons or visual state changes: they would constitute redesign.
- Route and navigation corrections: routing changes were explicitly out of scope.
- Database query or schema changes: prohibited and not required for Foundation.
- Legacy Machine model/component removal: broad cleanup could create merge conflicts without unlocking future work.
- Server/Client boundary changes: current source-based regressions and contact/media behavior make this a separate measured refactor.
- Hook-warning fixes in inventory filters and gallery/media components: these affect interaction closure behavior and should be handled with focused runtime tests, not folded into terminology work.
- Inspection claim correction: important, but it changes visible copy and needs an explicit product truth decision.

## Verification

- Public regression suite: 74 tests passed.
- ESLint: no errors; the same three pre-existing hook-dependency warnings remain.
- Production build: passed. The existing build-time public-inventory query diagnostic still appeared, as documented in the repository audit; the build completed successfully with the unchanged unavailable-state fallback.

## Future Cost Reduction

| Change | Future cost reduced |
|---|---|
| Page-state primitive | New routes can adopt consistent accessible states without duplicated markup |
| Contact action primitive | Contact attribution and security behavior change in one place |
| Evidence vocabulary | Known/Unknown and provenance work has a clear component/presentation boundary |
| DTO semantic comments | Future contributors are less likely to turn Unknown into an unsupported negative claim |
| Explicit skipped-work record | Later prompts can distinguish deferred risk from overlooked work |
