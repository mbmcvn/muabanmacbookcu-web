---
title: Phase 4A — MBMC Public Content Governance
status: proposed
scope: decision-dossier-v1-content-governance
date: 2026-07-23
canonical_product_contract: docs/decision-dossier-v1-contract.md
---

# Phase 4A: MBMC Public Content Governance

## Executive Summary

The current repository can render Decision Dossier v1 truthfully, but it does
not yet define or enforce the full process by which public judgement becomes
truthful, balanced, reviewable and current.

The strongest existing foundation is the fail-closed public projection:

- public queries use an explicit Supabase column allowlist;
- a machine must be `new_in_stock` with a valid public identity, price,
  configuration and exactly one approved public cover;
- public condition copy must exist and carry editorial reviewer metadata;
- publication approval and publication actor/timestamp fields must exist;
- the approved and published editorial revisions must match the current
  editorial revision;
- ineligible candidates disappear from public output rather than partially
  rendering;
- operational actor identifiers do not enter public DTOs.

The central gap is upstream governance. This repository contains the public
read/projection path, but no owner authoring, review, approval, publication,
revocation or archival interface. It cannot prove who authored content, which
machine-state snapshot a judgement used, why it was changed, or whether a
machine-fact change invalidated previously approved judgement.

The central recommendation is to run Decision Dossier v1 content as a
**revision-bound publication packet**:

1. assemble a factual machine snapshot and explicit unavailable-information
   list;
2. reconcile public condition prose and included items;
3. author Suitable For and Not Suitable For as one inseparable balanced unit;
4. author Expert Summary only from the same reviewed basis;
5. derive Decision Summary from approved content availability, not sales copy;
6. perform a truth review and a decision-quality review;
7. approve and publish one exact editorial revision;
8. invalidate or re-review that packet when a governed dependency changes.

This operating model can begin immediately as a documented checklist using the
current revision and publication fields. Small application changes should then
enforce balance, cross-field consistency and stale-content warnings. New schema
is justified only when MBMC needs durable authorship, source-snapshot,
per-field dependency or revocation audit records that the current fields cannot
represent.

This plan governs only:

- Suitable For;
- Not Suitable For;
- Decision Summary;
- Đánh giá từ MBMC;
- public condition description;
- included items;
- battery health;
- cycle count;
- cosmetic grade;
- public limitations;
- MBMC Passport identity fields.

Benefits, Trade-offs, Timeline, complete Evidence, complete Care, Related
Machines, Recommendation, Decision Stories and complete machine history remain
outside Phase 4A.

## 1. Current Workflow Map

### 1.1 Repository boundary

The repository contains:

- a server-only public Supabase reader;
- normalization of untrusted joined rows;
- privacy and publication eligibility gates;
- immutable versioned public DTO assembly;
- public inventory and detail rendering;
- tests for eligibility, revision binding, privacy allowlisting, public wording
  and dossier omission.

It does **not** contain:

- an owner/admin route;
- an editorial form;
- a review queue;
- approval or publish mutations;
- application-level role/permission checks for those mutations;
- revocation or archival controls;
- a persisted stale-content state;
- authoring history or change-reason UI.

Therefore, authoring and mutation behavior below is inferred from selected
database fields, not verified from an interface in this repository. Supabase
RLS, database functions, triggers and external owner tooling are outside the
checked-in evidence and require a separate operational audit.

### 1.2 Current path from machine data to public output

| Step | Current actor | Permission evidence | Data source | Current validation | Review state / audit trail | Failure behavior |
|---|---|---|---|---|---|---|
| Machine record | Operational data entrant, not represented in this repository | Unknown; no mutation path or role policy is present | `machines`: identity, status, model text, chip, RAM, SSD, color, price, battery, cycles, rank | Public projection later requires core configuration, positive integer price and `new_in_stock` | No machine author, measurement timestamp or fact-revision identifier is selected | Invalid core facts make the candidate ineligible; some later fact changes can flow through without editorial invalidation |
| Editorial draft | Editorial author, not represented | Unknown | `machine_editorials`: revision, condition copy, Expert Summary, fit arrays, contextual label, included items, policy applicability | Normalization trims text, removes invalid array members and normalizes included-item values | Current revision exists; author identity and draft state are not selected because no author field is present | Missing editorial row or condition copy prevents publication |
| Editorial review | Reviewer identified by stored actor value | Presence required; actual permission not verifiable here | `reviewed_by`, `reviewed_at` on current editorial row | Both values must be present | Records who reviewed and when, but not what checklist was applied, what sources were used or what changes were requested | Missing metadata makes candidate ineligible |
| Approval | Approver identified by publication row | Presence required; role separation not enforced here | `approved_by`, `approved_at`, `approved_editorial_revision` | Approved revision must equal current editorial revision | Binds approval to one editorial revision | Missing actor/time or mismatch makes candidate ineligible |
| Publication | Publisher identified by publication row | Presence required; role separation not enforced here | publication status, slug, `published_by`, `published_at`, `published_editorial_revision` | Status must be `published`; slug must be public-safe; published revision must equal current editorial revision | Records publisher, time, current publication revision, first publication and update time | Non-published or incomplete audit data is excluded |
| Public projection | Server application | Server-only service-role read | Explicit allowlist across machines, publication, editorial and images | Privacy boolean, eligibility rules, exactly one public cover, approved image visibility/type/stage | Safe diagnostics contain machine code and rejection reason only | Candidate fails closed; malformed candidates do not hide valid candidates |
| Later editorial edit | External operator, not represented | Unknown | Current editorial row and revision | If revision increments without publication rebinding, the revision mismatch gate excludes the machine | Existing fields reveal mismatch, but not author, reason or prior content | Public candidate disappears until approval and publication point to the new revision |
| Later machine-fact edit | External operator, not represented | Unknown | Machine fields outside editorial revision | Current code validates the new value but does not bind editorial judgement to a machine-fact revision | No selected snapshot or dependency record | Eligible changes may silently alter public facts while old judgement remains approved |
| Republishing | External approver/publisher | Unknown | Updated approval/publication revision fields | Both approved and published editorial revisions must match current editorial revision | Actor and timestamps exist for the current publication state | Mismatch excludes the candidate |
| Revocation | No explicit current state | Not represented | Could currently be approximated by moving away from `published` | Public reader selects only published rows | No revoker, timestamp or reason is selected | Public output disappears if status changes, but “revoked” is not distinguishable |
| Archival | External operator, not represented | Unknown | Publication status supports `archived` | Repository query filters to `published` before projection | No archive actor, time or reason is selected | Archived record is absent from public output |

### 1.3 Effective current lifecycle

The persisted publication states visible to the public projection are:

```text
draft → approved → published → archived
```

The editorial row contributes:

```text
revision + reviewed_by + reviewed_at
```

The projection derives effective states:

- **not publishable** — required facts, review metadata or audit fields missing;
- **revision stale** — approved/published editorial revision differs from the
  current editorial revision;
- **public** — all gates pass;
- **absent** — archived, non-published, ineligible or rejected.

These are not a complete workflow. “Needs data,” “changes requested,” “stale”
and “revoked” are not distinct persisted states in the inspected code.

## 2. Content Authority Model

Authority describes responsibility, not necessarily separate people. One owner
may hold multiple authorities in a small team, but every action must still be
recorded under its correct responsibility.

| Authority | May do | Must not do | Minimum accountability |
|---|---|---|---|
| Data authority | Enter or correct machine identity, configuration, status, price, battery reading, cycle count, grade, approved image metadata and structured included items where operational ownership permits | Convert observation into suitability, write Expert Summary, or approve their own unsupported interpretation merely because they entered a fact | Identify source, observation/measurement time where relevant, and what changed |
| Editorial authority | Write public condition description and draft concise customer-facing copy from available facts | Declare facts verified, infer missing history, or publish unreviewed judgement | Identify author and editorial revision |
| Judgement authority | Write or materially revise Suitable For, Not Suitable For and Expert Summary using the approved suitability framework | Derive universal suitability from specifications alone or present judgement as verified fact | Record judgement basis, confidence and unresolved dependencies |
| Review authority | Check factual consistency, balance, wording, omissions and Decision Dossier Contract compliance | Approve content without access to its basis or ignore contradictions | Bind reviewer and time to the exact editorial revision |
| Publication authority | Approve the exact reviewed revision for public release, publish, unpublish, revoke or archive according to policy | Rewrite content during publication or publish a revision different from the reviewed one | Bind approval/publisher, timestamps and revision; record reason for exceptional removal |

### 2.1 Field-level authority

| Content | Author | Required approval |
|---|---|---|
| Machine identity/configuration/status/price | Data authority | Data authority or designated public-fact reviewer |
| Battery/cycle/grade raw values | Data authority | Public-fact reviewer; measurement context required before interpretation |
| Included items | Data authority or editorial authority transcribing a verified checklist | Public-fact reviewer |
| Public condition description | Editorial authority | Public-fact reviewer |
| Suitable For / Not Suitable For pair | Judgement authority | Decision-quality reviewer |
| Expert Summary | Judgement authority | Decision-quality reviewer |
| Decision Summary | Product-owned deterministic template in v1 | Product Owner for template; no per-machine author when generated from governed availability |
| Public limitations | Product/Trust-owned templates from typed states | Trust/Content Owner |
| Passport identity fields | Data authority through public projection | Public-fact reviewer and publication gate |
| Publish/archive/revoke | Publication authority | According to owner-approved separation policy |

### 2.2 Separation policy

The contract does not require different people for every role. The minimum
safe rule is **two-pass review**:

1. an authoring pass creates or changes public content;
2. a review pass explicitly checks the exact revision before publication.

Owner judgement is required on whether the same person may author, review and
publish. Recommendation:

- allow one person to hold data and editorial authority;
- allow one person to hold judgement and editorial authority;
- require a distinct second person for the first real suitability pilot when
  possible;
- if staffing makes that impossible, require a time-separated self-review with
  a completed checklist and explicit self-approval marker in the operational
  record;
- never allow a silent “edit and publish” action that bypasses revision-bound
  review.

## 3. Content Classification

| Class | Definition | Allowed surfaces | Required review | Permitted language | May appear under “Đã xác minh trong hồ sơ công khai”? |
|---|---|---|---|---|---|
| Directly observed fact | A recorded observation about this machine made through a defined observation or measurement | Supporting public information; future Evidence only when provenance exists | Public-fact review; observation context required for interpretation | Specific and bounded: value, observation, date when available | Only if the public projection and verification scope explicitly support it; current v1 heading remains identity-level |
| Structured machine fact | Typed machine record such as code, configuration, status, price, raw battery, cycles or grade | Hero, supporting information, Passport, Technical Reference as contracted | Data validation and public-fact review | Exact public value without quality inference | Code, public model, availability and image count currently may; other facts remain supporting information |
| Approved public description | Reviewed prose summarizing publicly supportable condition or included-item context | Supporting public information and metadata fallback | Editorial plus public-fact review | Descriptive, scoped, non-promotional | No; prose is approved description, not automatically verified fact |
| Human interpretation | Reviewed judgement about fit or meaning | Suitable/Not Suitable and Đánh giá từ MBMC | Judgement authority plus decision-quality review | “Phù hợp nếu…”, “Nên tránh nếu…”, and explicitly judgement-framed explanation | Never |
| Operational policy | Approved rule about handoff, support or public process | Final Decision Panel or policy surface within current v1 scope | Policy owner and Trust/Content review | Predictable scope, exclusions and process | No |
| Unavailable public information | Typed statement that the public dossier lacks a governed fact/result | Chưa đủ thông tin | Trust/Content-approved template tied to typed status | “Hồ sơ công khai hiện chưa có…” | No |
| Unsupported claim | A statement without adequate source, review, scope or consistency | No public surface | Must be rejected or rewritten | None | Never |

The internal type comment that calls `PublicFact` “display-safe Evidence” does
not authorize public Evidence language. The locked v1 product contract reserves
Evidence for claim-linked artifacts with provenance, method, timestamp and
limitations.

## 4. Publication Threshold Matrix

### 4.1 Governed decision and editorial content

| Field | Minimum truthful source | Required reviewer | Allowed inference | Forbidden inference | Omission rule | Stale trigger | Republication requirement |
|---|---|---|---|---|---|---|---|
| Suitable For | Reconciled public facts, public limitations and a written judgement basis addressing a concrete use case | Decision-quality reviewer | Bounded use-case fit from the reviewed basis | Universal suitability, “best,” generic praise, suitability from specifications alone, battery/grade quality without approved interpretation | Omit both fit sections if either balanced side fails threshold | Any dependency named in the basis changes; model/configuration correction; relevant condition/compatibility/policy change | Re-author or explicitly reaffirm both lists; review and bind the new editorial revision |
| Not Suitable For | Same packet and revision as Suitable For | Same level of decision-quality review | Concrete stopping condition or unmet need | Invented defect, fear language, unknown converted to negative fact | Omit both sections if either side fails threshold | Same as Suitable For | Review and publish as the same inseparable pair |
| Decision Summary | Product-approved v1 template plus whether a reviewed balanced pair is present and whether limitations apply | Product Owner approves template; content reviewer verifies resulting state | Direct the reader to available balanced fit or to confirmed/limited information | Compressed advertisement, machine recommendation, specifications, contradiction of fit or limitations | Never omitted; use truthful fallback when balanced judgement is absent | Template change, balance state change, relevant limitations change | Template-level approval for copy changes; per-machine state verified during publication checklist |
| Đánh giá từ MBMC | Same reconciled packet as fit plus a written basis that adds interpretation | Decision-quality reviewer | Explain why facts matter to a bounded decision context | Verified-fact voice, inspection claims, generic praise, repetition of Decision Summary without added meaning | Omit when no approved interpretation exists | Any material fact or limitation used in the summary changes; judgement standard changes | Re-review exact text and basis; publish new editorial revision |
| Public condition description | Machine-specific observations and structured included-item record | Public-fact reviewer | Concise public description of recorded condition | “Fullbox” without confirmed box; hidden/internal state; repair/inspection conclusion; unsupported “zin” | Remove unsupported clauses; omit/fail publication if no meaningful required condition copy remains | Condition observation, included items, images or repair information changes | Reconcile text, review and publish new editorial revision |
| Included items | Completed structured checklist for charger, cable, box, bag and named accessories | Public-fact reviewer | Only explicitly confirmed presence or an explicitly governed absence state | Adding an item from prose or image alone; treating `null` as “not included” | Omit unknown items; do not infer absence from `null` | Any handoff/content change | Update structured record, reconcile condition prose and re-review editorial revision |

### 4.2 Governed facts, limitations and Passport

| Field | Minimum truthful source | Required reviewer | Allowed inference | Forbidden inference | Omission rule | Stale trigger | Republication requirement |
|---|---|---|---|---|---|---|---|
| Battery health | Machine-specific numeric reading from an identified measurement process | Public-fact reviewer | Display raw percentage only in v1 | “Good,” remaining lifetime, suitability or health band without approved interpretation | Omit when missing or invalid | New measurement, battery service/replacement, or material time/usage since measurement | Raw update may flow only after fact review; any judgement dependency requires editorial re-review |
| Cycle count | Machine-specific integer reading from an identified measurement process | Public-fact reviewer | Display raw count only in v1 | Quality, lifespan or low/high label without approved interpretation | Omit when missing or invalid | New measurement or continued use | Same as battery health |
| Cosmetic grade | Current structured public grade assigned through an owner-approved grading process | Public-fact reviewer | Display raw grade only in v1 | Universal condition conclusion or cross-model quality promise without a published rubric | Omit when absent; do not invent a grade | New condition observation, damage or grade correction | Re-review condition packet and any judgement that used grade |
| Public limitations | Governed typed status for inspection, warranty, source verification or repair state | Trust/Content Owner approves templates | State only what the public dossier lacks | “Failed inspection,” “no warranty,” “unknown source,” “never repaired,” or hidden-information implication | Omit only a limitation whose typed status no longer requires it | Status or limitation taxonomy changes | Review changed limitation state and any dependent judgement |
| Passport code/slug/model/status | Approved public identity and current eligible inventory state | Public-fact reviewer | Current identity record only | Complete identity provenance or lifecycle history | Required identity fields block publication; unsupported optional fields omitted | Code/model/slug/status correction or publication identity change | Revalidate public identity and republish/rebind as owner policy requires |
| Passport first/last public dates | Publication audit timestamps | Publication authority | State public publication timing | Ownership, acquisition or full-history dates | Omit optional first-publication date if unavailable | Publication record correction | Publication audit review |

### 4.3 Current enforcement gap

The current eligibility gate enforces:

- reviewed condition copy;
- reviewer identity/time presence;
- current editorial revision equality with approved and published revisions;
- core public machine facts;
- publication actor/time presence.

It does not enforce:

- balanced suitability at the projection boundary;
- per-field reviewer authority;
- judgement basis;
- condition/included-item semantic conflicts beyond the presentation-level
  `fullbox` safeguard;
- machine-state snapshot binding;
- measurement time;
- per-field dependency or staleness;
- revocation reason;
- author identity.

## 5. Suitability Judgement Framework

### 5.1 Required judgement packet

Suitable For and Not Suitable For must be authored and reviewed together from
one packet containing:

1. public identity and configuration;
2. current price;
3. reconciled condition description and included items;
4. raw battery, cycle and grade values labelled as uninterpreted where
   applicable;
5. all current public limitations;
6. approved model-level reference facts, if any, with their source;
7. each proposed use case;
8. the fact or approved reference supporting the statement;
9. confidence level;
10. facts whose change would invalidate the statement.

The current database does not store this packet. For the first pilot it may be
a controlled review worksheet linked operationally to the machine and
editorial revision. It must not be published as Evidence.

### 5.2 Decision dimensions and current supportability

| Dimension | Current support | Phase 4A judgement |
|---|---|---|
| Workload intensity | Chip, RAM and storage exist; no governed workload/performance reference or customer workload taxonomy exists | **Conditionally supportable** only through reviewed human judgement with an explicit basis; no automatic inference |
| Portability | Family and sometimes screen size exist; weight is usually absent | **Not generally supportable** until approved model reference or populated weight exists |
| Battery expectations | Raw battery percentage and cycles may exist; measurement date and interpretation are absent | **Raw fact only**; do not use for suitability in the pilot |
| Memory ceiling | Installed RAM exists; upgradeability/ceiling is not governed | **Installed capacity only**; do not claim ceiling or future adequacy |
| Storage needs | Installed capacity exists | **Conditionally supportable** for explicit capacity requirements; do not infer long-term sufficiency |
| Display needs | Screen size may be null; display detail is usually absent | **Support only when a reviewed public display fact exists** |
| Port requirements | Technical field is allowlisted but currently usually empty | **Omit unless populated from an approved source** |
| Software compatibility | No compatibility source, OS support model or app matrix exists | **Not supportable** |
| Upgrade expectations | No governed upgradeability or support-lifecycle data exists | **Not supportable** |
| Budget sensitivity | Current price exists; market comparison/value model does not | **Absolute price may inform a bounded budget statement; value or “worth it” claims are not supportable** |

### 5.3 Approved wording patterns

Patterns describe structure, not ready-to-publish pilot content.

Suitable For:

- “Phù hợp nếu bạn [concrete use case] và [bounded requirement].”
- “Nên tiếp tục cân nhắc nếu ưu tiên của bạn là [supported priority], trong
  phạm vi [explicit limitation].”
- “[Public fact] có thể phù hợp với nhu cầu [specific need], nếu [condition].”

Not Suitable For:

- “Không phù hợp nếu bạn cần [specific unsupported requirement].”
- “Nên dừng lại nếu công việc của bạn thường xuyên [bounded workload] mà hồ sơ
  hiện tại không đủ cơ sở để xác nhận [required capability].”
- “Không nên chọn chiếc máy này chỉ dựa trên [raw fact] nếu bạn cần [outcome
  that raw fact cannot prove].”

Expert Summary:

- “Dựa trên [named public facts and limitations], MBMC đánh giá…”
- “Nhận định này phù hợp trong trường hợp…, nhưng không thay thế…”

### 5.4 Prohibited wording patterns

- “Máy ngon,” “cấu hình mạnh,” “pin tốt,” “như mới,” “đáng tiền” without an
  approved definition and basis;
- “phù hợp với mọi nhu cầu,” “ai cũng dùng được,” “lựa chọn tốt nhất”;
- “đảm bảo,” “chắc chắn,” “hoàn hảo,” or complete-history claims;
- “không sửa,” “còn zin,” “nguồn gốc rõ” from missing or unknown states;
- fit statements consisting only of a specification;
- negative fit hidden inside a vague disclaimer;
- the same sentence copied into Suitable For, Decision Summary and Expert
  Summary;
- battery, cycle or grade thresholds that have not been approved.

### 5.5 Confidence thresholds

| Confidence | Meaning | Publication behavior |
|---|---|---|
| High | Statement is directly supported by current public facts and an approved decision rule | May publish after normal review |
| Moderate | Statement requires bounded human interpretation but its facts, assumptions and limitations are explicit | May publish only as judgement after decision-quality review |
| Low | Material dependency is missing, stale, disputed or based on ungoverned model knowledge | Do not publish; move to Needs Data or omit |

At least one publishable item on each side must reach High or Moderate
confidence. Quantity does not create balance: one side must not contain
materially broader, stronger or more persuasive claims than the other.

### 5.6 Edge cases and disagreement

- If only positive fit is supportable, omit both sections.
- If only negative fit is supportable, omit both sections and surface the
  relevant limitation elsewhere if governed.
- If a statement depends on battery/grade interpretation, remove that
  dependency until an interpretation standard exists.
- If two reviewers disagree about a material fit statement, it remains
  unpublished until they agree on narrower wording or the Product Owner makes
  and records the decision.
- If facts are correct but confidence remains Low, omission is the correct
  outcome.
- If the balanced pair becomes empty after review, Decision Summary must use
  the current no-balanced-assessment fallback.

## 6. Battery, Cycle and Grade Governance

### 6.1 What v1 may display

- the raw battery-health percentage when present and valid;
- the raw integer cycle count when present and valid;
- the raw public cosmetic grade when present;
- no qualitative label unless an approved interpretation standard exists.

### 6.2 What v1 must not infer

Raw values do not currently prove:

- remaining service life;
- future battery duration;
- “good,” “bad,” “high,” “low” or “like new”;
- suitability for a workload;
- absence of service or replacement;
- cross-model equivalence;
- a complete condition conclusion.

### 6.3 Context required before interpretation

An interpretation standard must define:

- measurement method and tool;
- measurement timestamp;
- whether the machine was used or serviced afterward;
- model/battery applicability;
- uncertainty and tolerance;
- threshold owner and review cadence;
- public wording for boundary cases;
- relationship, if any, between battery percentage and cycles;
- whether a threshold is advisory or publication-blocking.

### 6.4 Threshold strategy

Recommendation:

- do not introduce global quality thresholds now;
- do not introduce model-specific thresholds without a governed source and
  sufficient operational evidence;
- keep raw values visible and interpretation omitted in Phase 4A;
- revisit model-specific interpretation only after measurement governance
  exists;
- never use a threshold as a substitute for human decision context.

### 6.5 Staleness

Battery and cycle values are changing observations. Without a measurement
timestamp, the public page cannot communicate their age. For the pilot:

- record measurement time in the review worksheet;
- remeasure immediately before publication;
- define an owner-approved maximum pilot interval between measurement and
  publication;
- remeasure after material use, battery service or any reason to suspect a
  changed value;
- keep suitability and Expert Summary independent of battery interpretation.

A durable public measurement timestamp requires future data/contract work; it
must not be simulated with `publishedAt`.

## 7. Conflict-Resolution Rules

The governing principle is:

> Structured public facts override unsupported prose, while reviewed judgement
> may interpret facts without contradicting them.

Resolution precedence:

```text
Governed source fact
  → normalized structured public fact
    → approved public description
      → reviewed human judgement
        → generated public summary
```

Lower layers may interpret higher layers but cannot overwrite them.

| Conflict | Resolution |
|---|---|
| Condition prose vs included items | Remove the unsupported item claim or correct the structured checklist from a verified source. `null` does not support either presence or absence. Block publication until reconciled when the conflict is material. |
| Editorial judgement vs structured facts | Narrow, rewrite or remove judgement. Judgement cannot override configuration, status, price, raw condition values or limitations. |
| Old approved editorial revision vs newer editorial revision | Current projection already fails closed through revision mismatch. Re-review and explicitly approve/publish the new revision. |
| Old judgement vs newer machine fact | Flag the packet stale. Determine whether the fact is a named dependency; block republication for material identity/configuration/condition changes. Current code does not enforce this relationship. |
| Passport identity vs inventory status | Current eligible inventory state controls. A non-eligible machine disappears from public output; Passport must never preserve a stale “available” claim. |
| Human summary vs unavailable-information state | Limitation wins. Remove or narrow any summary statement that assumes the unavailable fact. |
| Images vs condition prose | Images may support visible observations but cannot prove hidden condition, inspection, repair or completeness. Reconcile obvious visual contradictions before publication. |
| Grade vs condition prose | Neither silently overrides the other. Reassess the grade or rewrite the description under the approved grading rubric; until that rubric exists, avoid interpretive equivalence. |
| Price vs value judgement | Current price controls. Remove or re-review “budget” or value-relative judgement when price changes materially. |

When a conflict cannot be resolved from current data:

1. remove the unsupported statement;
2. expose a governed public limitation when one exists;
3. move the packet to Needs Data;
4. never invent certainty to keep the section populated.

## 8. Review Lifecycle

### 8.1 Target governance states

| State | Meaning | Public behavior |
|---|---|---|
| Draft | Content is being authored and may be incomplete | Not public |
| Needs Data | A material source, reconciliation or measurement is missing | Not public; no placeholder |
| Ready for Review | Required packet and author checklist are complete | Not public |
| Changes Requested | Reviewer found factual, balance, wording or scope problems | Not public |
| Approved | Exact editorial revision passed review but has not necessarily been published | Not public unless publication state is separately valid |
| Published | Exact approved revision and current public facts pass all gates | Public |
| Stale | A governed dependency changed or review age threshold was reached | Owner policy determines immediate hiding; republication blocked until disposition |
| Revoked | Content was deliberately withdrawn due to trust, safety or governance concern | Not public |
| Archived | Machine/publication is intentionally closed as a historical operational record | Not public |

### 8.2 Fit with current repository states

| Target state | Current support |
|---|---|
| Draft | Publication status supports `draft`; editorial revision supports work-in-progress only implicitly |
| Needs Data | Derivable from eligibility failures, but not persisted or owner-friendly |
| Ready for Review | Not represented |
| Changes Requested | Not represented |
| Approved | Publication status supports `approved`, with revision binding fields |
| Published | Fully represented and enforced |
| Stale | Editorial revision mismatch is an effective stale state; machine-fact staleness is not represented |
| Revoked | Not represented; can only approximate by changing away from published |
| Archived | Publication status supports `archived` |

### 8.3 Recommended current-schema lifecycle

Without schema change, use a controlled operating checklist:

```text
Draft
  → Needs Data (checklist flag, external to app)
  → Ready for Review (checklist complete)
  → Changes Requested (review notes)
  → Approved (existing publication status + exact editorial revision)
  → Published (existing publication status + exact published revision)
  → Stale (revision mismatch or external stale register)
  → Approved/Published again, Revoked, or Archived
```

The checklist/external register is an interim governance control, not a public
capability. It should use stable machine code and editorial revision, never
copy private operational data into public documentation.

### 8.4 When schema change becomes genuinely necessary

New persisted semantics become justified when MBMC needs the application itself
to:

- queue Ready for Review / Changes Requested;
- block on machine-state dependencies rather than editorial revision alone;
- retain authorship and review history across revisions;
- persist a revocation reason and actor/time;
- query stale packets reliably;
- support concurrent editors or formal role permissions.

Until then, current revision binding plus a disciplined pilot checklist is the
lowest-risk path.

## 9. Staleness and Invalidation

### 9.1 Rules by event

| Event | Default effect | Public handling | Owner decision |
|---|---|---|---|
| Price change | Raw price may change without invalidating non-price judgement | Flag for review if any fit/summary mentions budget, value or price; otherwise leave judgement unchanged | Define materiality threshold and whether all price-relative copy is prohibited in pilot |
| Battery update | Raw fact changes; current judgement should not depend on interpretation | Review raw value; flag judgement only if it mentions battery, which pilot policy forbids | Define maximum measurement age |
| Cycle update | Same as battery | Review raw value; no judgement impact when interpretation is absent | Define maximum measurement age |
| Repair event | Material trust/condition change | Immediately remove from public consideration or block republication until condition, limitations and judgement are reconciled | Define operational trigger and responsible revoker |
| Included-item change | Material cross-field dependency | Block republication; update structured items and reconcile condition prose | None beyond confirming whether item changes always force review; recommendation: yes |
| Condition update | Material | Block republication and review suitability/Expert Summary dependencies | None; recommendation: always new editorial revision |
| Inventory status change | Eligibility change | Current code automatically excludes any status other than `new_in_stock` | Decide future reserved/sold public behavior outside this phase |
| Model/configuration correction | Material identity and judgement dependency | Block republication; re-review Passport, suitability and Expert Summary | Define which cosmetic naming corrections are non-material |
| Policy change | May affect final support copy or applicability | Flag affected machines/content; block if existing statement becomes false | Define policy ownership and effective-date process |
| Publication age | Not evidence of incorrectness by itself | Flag for periodic review, not automatic favorable/negative inference | Set review cadence; do not auto-unpublish solely for age unless content is time-sensitive |
| Public limitation changes | May enable or invalidate judgement | Re-review any statement that depended on the old limitation; publish updated state | Trust/Content Owner confirms wording |
| Image set changes | May change visible support or expose condition inconsistency | Re-run image/public-condition review; ensure exactly one cover | Define whether reordering alone is material |

### 9.2 Enforcement levels

- **Leave unchanged:** fact change has no declared relationship to judgement and
  does not alter identity, condition, fit or public limitation.
- **Flag for review:** possible dependency exists, but public truth is not
  immediately contradicted.
- **Block republication:** new content cannot be approved until reconciliation.
- **Automatically remove from public output:** current eligibility becomes
  false, or a high-risk trust event requires operational revocation.
- **Owner decision:** policy/materiality threshold is not yet defined.

### 9.3 Current technical limitation

Editorial approval is bound to an editorial revision, not to a complete machine
state. Price, battery, cycle, grade, model/configuration and machine status can
change outside that revision. Status and invalid core facts are caught by
eligibility, but semantically stale judgement is not.

For the pilot, a signed review worksheet must record the relevant machine facts
used by the judgement. A future enforcement option is a deterministic
approval-input fingerprint, but persisting and comparing it reliably likely
requires a new stored field or revisioned publication packet.

## 10. Auditability Assessment

### 10.1 Questions the current architecture can answer

| Audit question | Current answer |
|---|---|
| Who reviewed the current editorial row? | `reviewed_by` |
| When was it reviewed? | `reviewed_at` |
| Which editorial revision is current? | editorial `revision` |
| Which editorial revision was approved? | `approved_editorial_revision` |
| Who approved it and when? | `approved_by`, `approved_at` |
| Which revision was published? | `published_editorial_revision` |
| Who published it and when? | `published_by`, `published_at` |
| When was it first public? | `first_published_at` |
| Does current editorial still match approved/published revision? | Yes, enforced by eligibility |
| Which public candidates were rejected and why? | Safe diagnostic reason and public machine code |

### 10.2 Questions it cannot answer from selected fields

- who wrote the editorial content;
- which exact machine-state snapshot supported the judgement;
- which source or observation supported each statement;
- what changed between editorial revisions;
- why changes were requested;
- whether approval was self-approval;
- which field caused judgement to become stale;
- who revoked or archived content, when and why;
- whether prior editorial/publication revisions remain queryable;
- measurement time for battery, cycles or grade;
- per-field reviewer or approval.

### 10.3 Minimum audit record

The minimum governance record for each published packet should contain:

- public machine code;
- editorial revision;
- author identity;
- reviewer identity and review time;
- approver and publisher identity/time;
- factual input snapshot or deterministic fingerprint;
- judgement-basis worksheet version;
- change summary from prior revision;
- declared dependencies for fit and Expert Summary;
- approval outcome and requested changes;
- revocation/archive actor, time and reason when applicable;
- replacement revision when content is superseded.

For the pilot, fields not in the current schema may live in a controlled
operational review record. Before scaling beyond a small owner-operated
workflow, durable versioned storage becomes necessary.

### 10.4 Privacy boundary

Audit actors and internal review materials must remain server-side and must not
enter public DTOs. Existing tests correctly assert that actor identifiers and
internal operational fields do not leak into serialized public output.

## 11. First Real Pilot

The pilot must create the first real public machine with a complete balanced
suitability pair. It must not fabricate content or expand v1 scope.

### 11.1 Machine selection criteria

Select a machine that:

- is currently `new_in_stock` and expected to remain available through review;
- has stable, correct code, model, configuration, price and one approved cover;
- has a complete approved public gallery showing its actual visible condition;
- has freshly reviewed condition description and included-item checklist;
- has current raw battery and cycle readings;
- has a reviewed grade value;
- has no unresolved contradiction among facts, prose and images;
- has use cases that can be explained from current facts without battery,
  compatibility, upgrade or provenance speculation;
- has no known imminent repair, status or included-item change;
- represents a common enough decision context for reviewers to assess concrete
  wording;
- is not selected because it is easiest to market.

### 11.2 Required inputs

- current machine/publication/editorial records;
- approved public image set;
- public condition observations;
- structured included items;
- raw battery/cycle/grade values with operational measurement context;
- current public limitations;
- model/configuration facts;
- pilot judgement worksheet;
- named author, reviewer, approver and publisher;
- current editorial revision.

### 11.3 Authoring steps

1. Freeze the pilot input snapshot for review.
2. Reconcile condition prose, included items, images and grade.
3. Mark every unknown or unavailable field explicitly in the worksheet.
4. Propose concrete decision contexts, not personas or generic praise.
5. Draft Suitable For and Not Suitable For together.
6. Attach a fact/basis, confidence and invalidation dependency to every item.
7. Remove Low-confidence statements.
8. Draft Expert Summary from the same basis, clearly as judgement.
9. Verify it adds interpretation and does not repeat Decision Summary.
10. Confirm the deterministic Decision Summary will select the balanced-state
    wording.
11. Increment and freeze the editorial revision for review.

### 11.4 Review checklist

Truth review:

- [ ] Code, model, configuration, price and status match the current source.
- [ ] Exactly one approved public cover exists.
- [ ] Condition prose matches observations and does not overstate images.
- [ ] Included items are structured and do not conflict with prose.
- [ ] Battery, cycle and grade remain raw, without invented quality labels.
- [ ] Public limitations match current typed states.
- [ ] Passport identity is current and does not imply complete history.

Decision-quality review:

- [ ] Suitable For and Not Suitable For are both non-empty.
- [ ] Both sides are concrete, scannable and equivalent in semantic weight.
- [ ] Each statement has a named basis and High or Moderate confidence.
- [ ] No statement is derived from specifications alone.
- [ ] No statement depends on unsupported battery, compatibility, upgrade or
      market-value interpretation.
- [ ] Expert Summary identifies its basis and remains human judgement.
- [ ] Expert Summary adds interpretation beyond Decision Summary.
- [ ] Missing information has not become a favorable or negative conclusion.
- [ ] Copy follows MBMC conversation principles and does not pressure contact.

Governance review:

- [ ] Reviewer and review time are bound to the exact editorial revision.
- [ ] Approval and publication point to that same revision.
- [ ] Change summary and stale dependencies are recorded.
- [ ] No deferred capability or Evidence language was introduced.

### 11.5 Publication checklist

- [ ] Recheck inventory status immediately before publication.
- [ ] Recheck price and all identity/configuration facts.
- [ ] Confirm battery/cycle measurement is within the owner-approved pilot age.
- [ ] Confirm included items have not changed.
- [ ] Confirm editorial revision equals reviewed, approved and published
      revision.
- [ ] Confirm publisher and timestamps are present.
- [ ] Run current public projection tests.
- [ ] Confirm the real slug resolves and no private field appears.

### 11.6 Visual QA

Inspect the real public page at:

- 1440 × 1000;
- 1280 × 800;
- 768 × 1024;
- 390 × 844.

Verify:

- both suitability lists render;
- equal semantic and visual weight;
- scannable item length and consistent wording;
- Decision Summary reflects the balanced state;
- Expert Summary is visibly judgement;
- confirmed and unavailable information remain distinct;
- supporting facts remain raw and scoped;
- Passport remains an identity record;
- contact-state exclusivity works;
- no mobile reordering, overflow or reading obstruction occurs.

### 11.7 Post-publication review

- Recheck the public DTO and page immediately after publication.
- Review again after the first operational fact change or within an
  owner-approved pilot interval, whichever comes first.
- Record customer or staff misunderstandings without treating conversion as
  proof of content quality.
- Revoke or unpublish immediately if a material contradiction is discovered.
- At pilot close, decide which checklist controls require code enforcement
  before a second machine.

## 12. Implementation Options

### A. Governance possible with current code and schema

1. Adopt the authority model and two-pass review policy.
2. Use a controlled revision-bound pilot worksheet.
3. Treat Suitable For and Not Suitable For as one indivisible content unit.
4. Use the current editorial revision and approved/published revision binding.
5. Use the existing fail-closed projection and diagnostic reasons.
6. Reconcile condition prose and included items before approval.
7. Keep battery, cycle and grade as raw facts only.
8. Use current deterministic Decision Summary behavior.
9. Use current public limitation templates without expanding their meaning.
10. Archive or move a publication away from `published` when it must leave
    public output.
11. Perform manual stale-dependency checks before republishing.
12. Run the real-machine pilot and viewport QA.

Limitations:

- workflow states and notes live outside the application;
- role authority is procedural, not enforced here;
- machine-fact changes do not automatically invalidate judgement;
- audit history is incomplete.

### B. Small application changes that improve enforcement

These are future recommendations, not part of this documentation task:

1. Add projection validation requiring suitability arrays to be both empty or
   both non-empty.
2. Reject or flag public condition/included-item conflicts before DTO assembly,
   rather than only suppressing `fullbox` at presentation.
3. Add maximum item length, empty-item and duplicate-item validation for fit
   lists.
4. Add an owner-facing read-only preflight report showing eligibility failures,
   revision mismatch and governed warnings.
5. Add tests covering machine-fact changes against declared manual stale
   policies.
6. Add explicit operational logging for publish/archive/revoke actions if the
   mutation path is brought into this repository.
7. Add runtime validation for untrusted Supabase rows and public DTO output.

These changes improve enforcement without changing Decision Dossier product
scope. An owner editing interface is not a “small” change if permissions,
mutations and audit storage are not already available elsewhere.

### C. Future schema or architecture changes

Consider only after the pilot proves the need:

1. Revisioned publication packet or machine-state fingerprint bound to
   editorial approval.
2. Editorial author identity and immutable revision history.
3. Persisted review state: Needs Data, Ready for Review, Changes Requested,
   Stale and Revoked.
4. Review notes and change-reason history.
5. Per-field or per-section provenance/dependency records.
6. Measurement timestamp and method for battery/cycle/grade.
7. Revocation/archive actor, timestamp and reason.
8. Role/permission enforcement for data, editorial, judgement, review and
   publication authorities.
9. Governed source tables only if future interpretation or Evidence requires
   them.

Do not add schema merely to mirror a workflow diagram. Add it when current
revision binding and controlled operational records cannot provide reliable
auditability or stale-content enforcement at the intended scale.

## 13. Risks

| Risk | Severity | Current control | Required response |
|---|---|---|---|
| Generic suitability becomes sales copy | High | Balanced UI omission rule | Framework, basis, confidence and decision-quality review |
| Positive fit receives stronger treatment | High | Same component treatment | Treat pair as one publication unit and review semantic balance |
| Machine fact changes leave judgement stale | High | Editorial revision mismatch only covers editorial edits | Pilot dependency worksheet; future snapshot/fingerprint enforcement |
| Unknown becomes favorable conclusion | High | Typed public limitation copy | Trust review and prohibited inference rules |
| Condition prose conflicts with included items | High | Presentation removes unsupported `fullbox` | Upstream reconciliation and future projection validation |
| Battery/cycle/grade imply quality | High | UI currently displays raw values | Ban interpretation until standard and measurement governance exist |
| Self-approval weakens review | Medium–High | Actor presence only | Owner-approved separation policy or time-separated documented self-review |
| Public content disappears without operational clarity | Medium | Fail-closed projection | Owner preflight diagnostics and review queue outside public UI |
| Audit actors leak publicly | High | Explicit allowlist and privacy tests | Preserve server-only audit boundary |
| External worksheet becomes shadow database | Medium | None | Limit pilot scope; use stable code/revision; move durable needs into governed storage before scale |
| Owner UI assumed but absent | High | None | Audit external tooling/RLS before recommending mutation implementation |
| Deferred capability enters through wording | High | Locked v1 contract | Contract review and automated forbidden-language checks where reliable |

## 14. Acceptance Criteria

Phase 4A governance is ready for a pilot when:

- authority roles and any permitted role overlap are owner-approved;
- the two-pass review rule is adopted;
- a revision-bound review worksheet exists;
- every governed content class has an owner, source and publication threshold;
- Suitable For and Not Suitable For are reviewed and published only as a pair;
- every fit item has a concrete use case, basis, confidence and stale trigger;
- Decision Summary remains deterministic and non-promotional;
- Expert Summary states its basis and remains distinguishable from fact;
- condition prose and included items cannot knowingly conflict at publication;
- battery, cycle and grade remain raw facts with no quality labels;
- public limitations retain dossier-scope wording;
- Passport remains identity-only;
- a stale-event matrix is used before approval and republication;
- approval and publication point to the exact reviewed editorial revision;
- the first pilot passes truth, decision-quality, governance, publication and
  four-viewport visual QA checklists;
- no deferred section, placeholder or complete Evidence claim is introduced;
- the current public projection and privacy regression tests remain passing.

Phase 4A is ready to scale beyond one pilot only when:

- the pilot reveals no unresolved trust contradiction;
- owner tooling and actual database permissions have been audited;
- the team can reliably identify stale judgement after material fact changes;
- audit records can answer who authored, reviewed, approved and replaced the
  published packet;
- any necessary enforcement gaps are assigned to Option B or C before volume
  increases.

## 15. Owner Decisions

The following decisions require owner judgement:

1. **Role overlap:** May the same person author, review, approve and publish?
   Recommendation: require a second reviewer for the first pilot; otherwise
   require explicit time-separated self-review.
2. **Judgement basis format:** Where will the pilot worksheet live and who owns
   retention? Recommendation: a controlled operational record keyed by machine
   code and editorial revision, not a public document.
3. **Suitability confidence:** Is Moderate-confidence human judgement
   publishable? Recommendation: yes, only with explicit basis and limitations.
4. **List balance limits:** What maximum number and length of items is
   acceptable? Recommendation: 1–5 short items per side, with semantic balance
   reviewed rather than numerical equality alone.
5. **Price-relative judgement:** May pilot fit mention budget? Recommendation:
   only absolute, current-price context; prohibit comparative value claims.
6. **Battery/cycle freshness:** What maximum interval is allowed between
   measurement and publication? This cannot be inferred from the repository.
7. **Grade authority:** What operational rubric defines each grade?
   Recommendation: keep raw grade display but prohibit interpretation until the
   rubric is approved.
8. **Material model correction:** Which naming-only changes may avoid full
   judgement review? Recommendation: only corrections proven not to alter
   configuration or customer inference.
9. **Price-change materiality:** Which price changes trigger review?
   Recommendation: any change triggers a check; only price-dependent judgement
   requires new editorial approval.
10. **Repair-event response:** Who may immediately revoke public content and
    what operational signal triggers it?
11. **Publication-age cadence:** How often should unchanged judgement be
    re-reviewed? Recommendation: owner-defined review flag, not automatic
    unpublication solely due to age.
12. **Revocation semantics:** Until a persisted revoked state exists, which
    current publication transition and external record represent revocation?
13. **Pilot machine:** Which real machine best satisfies the selection criteria?
14. **Pilot success:** Who signs off truth, decision quality and visual QA?

## 16. Recommended Sequence

### Phase 4A.1 — Governance baseline, no code

1. Approve authority roles and overlap.
2. Approve classification and prohibited inference rules.
3. Approve publication thresholds.
4. Approve suitability worksheet, confidence model and wording patterns.
5. Approve staleness/materiality rules that are currently owner decisions.
6. Audit the actual external owner tooling, Supabase RLS, mutations and database
   history not present in this repository.

### Phase 4A.2 — One real pilot, current architecture

1. Select one eligible machine.
2. Create the factual snapshot and reconcile content.
3. Author and review one balanced suitability pair and Expert Summary.
4. Bind review, approval and publication to one editorial revision.
5. Run projection tests and public-page visual QA.
6. Monitor, record misunderstandings and perform post-publication review.

### Phase 4A.3 — Enforcement review

1. Compare pilot failures with current gates.
2. Implement only high-value Option B validation that prevents demonstrated
   errors.
3. Decide whether authoring UI belongs in this repository or existing owner
   tooling.
4. Introduce Option C storage only for audit or staleness needs proven by the
   pilot.

### Explicitly deferred

- Benefits;
- Trade-offs;
- Timeline;
- complete Evidence and provenance;
- complete Care;
- Related Machines;
- Recommendation engine, quiz or scoring;
- Decision Stories;
- complete inspection;
- complete ownership or repair history;
- qualitative battery, cycle or grade claims;
- public UI placeholders for any deferred capability.
