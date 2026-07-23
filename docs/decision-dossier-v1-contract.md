---
title: Decision Dossier Contract v1.0
status: locked-v1
effective_date: 2026-07-23
scope: product-governance
canonical_source: docs/decision-dossier-v1-contract.md
---

# Decision Dossier Contract v1.0

## Contract control

| Field | Value |
|---|---|
| Status | Locked product baseline for the first public release |
| Effective date | 2026-07-23 |
| Canonical source | `docs/decision-dossier-v1-contract.md` |
| Product authority | MBMC Product Owner |
| Trust and content authority | MBMC Trust/Content Owner |
| Technical custodian | MBMC Engineering Owner |
| Applies to | The public Machine Detail experience at `/may/[slug]` |

This document is the stable product contract for Decision Dossier v1. It
governs product responsibility, publication, omission, truth boundaries,
cognitive order and contact behavior. It is not an implementation guide, UI
specification, database schema or API contract.

The Product Owner approves changes to product meaning. The Trust/Content Owner
approves publishable claims and uncertainty wording. The Engineering Owner
preserves the contract in implementation and automated checks. One person may
hold more than one role, but the responsibilities remain distinct.

## 1. Product purpose

The Decision Dossier is a decision-support experience. Its primary purpose is
to reduce customer uncertainty about a specific used MacBook so that the
customer can decide with greater understanding and agency.

It organizes identity, fit, limitations, judgement and public information into
a deliberate reading sequence. Success is not measured only by contact or
conversion. A successful dossier helps a customer understand why they should
continue, stop, ask a question or defer the decision.

The Decision Dossier is not:

- a conventional ecommerce product page optimized around image, price and
  conversion;
- a specification sheet that leaves the customer to infer suitability from
  technical data;
- a trust badge that asks the customer to accept MBMC authority without
  inspectable support;
- a sales landing page that uses persuasion, urgency or scarcity;
- a complete machine-history, ownership-history, repair-history or inspection
  record.

The governing product position is:

> The machine is the subject; decision quality is the product responsibility.

## 2. Cognitive contract

The stable cognitive order is:

| Step | Customer question | Product purpose |
|---:|---|---|
| 1 | Which machine am I looking at? | Establish public identity, current availability, primary image, configuration and price without claiming fit. |
| 2 | Should I continue considering it? | Give a concise orientation before the customer processes detail. |
| 3 | Who is it suitable for? | State reviewed positive fit in customer terms when balanced content is publishable. |
| 4 | Who should avoid it? | Make stopping conditions equally visible so fit is not sales persuasion. |
| 5 | What is MBMC's judgement? | Present optional human interpretation as judgement, separate from public fact. |
| 6 | What is confirmed in the public dossier? | Define the narrow set of identity-level information confirmed by the current public record. |
| 7 | What does the public dossier not yet contain? | Expose consequential public-information limits without converting them into machine defects or favorable conclusions. |
| 8 | What supporting public information can I inspect? | Provide approved condition facts and images without overstating provenance or completeness. |
| 9 | What is this machine's current public identity record? | Organize current identity in Passport while stating that the record is not complete history. |
| 10 | What should I do if uncertainty remains? | Offer a calm, machine-specific human handoff without pressure or forced commitment. |

Specifications may support the reading after Passport, but they do not create
a new cognitive step and must not displace fit, judgement or uncertainty.

Optional sections may be omitted when their publication threshold is not met.
Omission does not reorder the remaining questions. The page must explain an
important absence when silence could cause a favorable or unsafe inference.

## 3. Section contract

### Hero

| Rule | Contract |
|---|---|
| Primary cognitive question | Which machine am I looking at? |
| Allowed content | Public machine name, availability, contextual label, configuration, price, approved gallery and machine-specific contact action. |
| Forbidden content | Suitability claims, inspection conclusions, urgency, scarcity, unsupported quality claims, complete-history language or claims inferred from the model alone. |
| Publication threshold | A machine has passed the existing public publication boundary and has its required public identity, price and cover image. |
| Omission behavior | The public detail page must not publish without its required Hero identity. Optional values are omitted rather than guessed. |
| Duplication policy | Identity and configuration may be repeated later only where Passport or a genuine reference purpose requires them. |
| Trust risks | Ecommerce dominance, price or contact overpowering decision guidance, and a gallery being mistaken for proof of hidden condition. |

### Decision hook

| Rule | Contract |
|---|---|
| Primary cognitive question | What kind of reading comes next? |
| Allowed content | One short, visually lightweight sentence bridging machine orientation into need, fit or uncertainty. |
| Forbidden content | A heading, card, recommendation, specification, marketing claim, CTA or second Decision Summary. |
| Publication threshold | Always present in the v1 dossier. |
| Omission behavior | May be removed only through owner-approved contract change; it must not be replaced by promotional copy. |
| Duplication policy | It introduces the dossier and must not restate the Decision Summary paragraph. |
| Trust risks | Becoming a slogan, recommendation or additional conversion surface. |

### Decision Summary

| Rule | Contract |
|---|---|
| Primary cognitive question | Should I continue considering this machine? |
| Allowed content | One short paragraph, or no more than five short bullets, directing attention to fit, non-fit and material public limitations. |
| Forbidden content | Specifications, generic praise, recommendation, “best” language, purchase pressure or unsupported conclusions. |
| Publication threshold | Always present. Copy must reflect whether balanced suitability is actually publishable. |
| Omission behavior | Never silently omitted in v1. When balanced suitability is absent, it must say that a balanced assessment is not available and direct the customer to confirmed information and limitations. |
| Duplication policy | Must not repeat Hero identity, Expert Summary or the detailed limitations list. |
| Trust risks | Becoming marketing copy or implying suitability before the customer context is known. |

### Suitable For

| Rule | Contract |
|---|---|
| Primary cognitive question | Who can reasonably continue considering this machine? |
| Allowed content | Concise, reviewed, audience- or use-context-specific fit statements. |
| Forbidden content | Model-derived assumptions, universal suitability, vague praise, specifications without interpretation, or claims unsupported by reviewed editorial content. |
| Publication threshold | At least one approved Suitable For item and at least one approved Not Suitable For item in the same reviewed publication revision. |
| Omission behavior | If the balancing threshold is not met, both suitability sections are omitted. |
| Duplication policy | Must not paraphrase Benefits, specifications or Expert Summary merely to fill the section. |
| Trust risks | Positive fit receiving greater quantity, prominence or certainty than limitations. |

### Not Suitable For

| Rule | Contract |
|---|---|
| Primary cognitive question | Who should avoid this machine or stop considering it? |
| Allowed content | Concise, reviewed stopping conditions expressed in customer or workload terms. |
| Forbidden content | Fear language, invented defects, generic disclaimers, hidden trade-offs or negative claims inferred from missing data. |
| Publication threshold | The same reviewed, balanced publication threshold as Suitable For. |
| Omission behavior | If either side lacks approved content, both sections are omitted. |
| Duplication policy | Must not be collapsed into fine print or embedded inside positive fit. |
| Trust risks | Reduced visual weight, softer wording or shorter coverage turning the pair into disguised persuasion. |

### Đánh giá từ MBMC

| Rule | Contract |
|---|---|
| Primary cognitive question | What is MBMC's human judgement about this machine? |
| Allowed content | Reviewed human interpretation, with language that makes its judgement status explicit. |
| Forbidden content | Verified-fact styling, inspection claims, provenance claims, generic sales praise or machine facts already stated elsewhere. |
| Publication threshold | A non-empty, reviewed Expert Summary approved for the current public revision. |
| Omission behavior | Omit the section when no approved judgement exists. Do not generate a substitute. |
| Duplication policy | Must add interpretation beyond Decision Summary and must not repeat Hero, suitability lists or confirmed public facts. |
| Trust risks | Authority being mistaken for verification, or judgement becoming marketing copy. |

### Đã xác minh trong hồ sơ công khai

| Rule | Contract |
|---|---|
| Primary cognitive question | What identity-level information is confirmed by this public dossier? |
| Allowed content | Current public machine code, public model, public availability and public image count, plus an explicit scope limitation. |
| Forbidden content | Complete inspection, repair, provenance, ownership, warranty or comprehensive-condition conclusions. |
| Publication threshold | The machine has passed the public publication boundary and the displayed fields come from its approved public projection. |
| Omission behavior | The section remains present for every published v1 dossier. Individual unsupported fields are omitted only if the public contract permits their absence. |
| Duplication policy | Passport may organize identity again, but this section establishes confirmation scope and must not expand into a second Passport. |
| Trust risks | The words “Đã xác minh” being read as a whole-machine inspection conclusion. The public-dossier scope must remain inseparable from the heading and explanation. |

### Chưa đủ thông tin

| Rule | Contract |
|---|---|
| Primary cognitive question | What does the current public dossier not yet contain? |
| Allowed content | Typed, public-safe statements about unavailable inspection, warranty, source-verification or repair information and future approved limitation categories. |
| Forbidden content | Speculation about why information is missing, hidden-information implications, machine-defect claims, or favorable conclusions such as “never repaired.” |
| Publication threshold | At least one governed public status requires a limitation statement. |
| Omission behavior | Omit only when no governed public limitation applies. Never suppress a consequential limitation to make the machine appear safer. |
| Duplication policy | State each limitation once. Supporting-information omissions should not create repetitive generic warnings. |
| Trust risks | Customers mistaking a public-record limitation for a machine defect, or mistaking silence for a favorable fact. |

### Supporting public information

| Rule | Contract |
|---|---|
| Primary cognitive question | What approved public facts and images can I inspect? |
| Allowed content | Public condition description, battery health, cycle count, cosmetic grade, structured included items and all approved public images. Native progressive disclosure is allowed when access remains complete. |
| Forbidden content | “Complete Evidence,” inspection conclusions, hidden-condition claims, interpretations without approval, or prose contradicted by structured public data. |
| Publication threshold | Each item has an approved public value. Images have passed the existing publication gate. |
| Omission behavior | Omit unsupported individual facts. Omit an empty group rather than render a placeholder. Preserve access to every approved public image. |
| Duplication policy | Gallery and later images may reuse the same assets only for distinct browsing and closer-inspection purposes. Repeated image grids should use progressive disclosure. |
| Trust risks | Technical facts without meaning, images being treated as proof of internal condition, and prose overstating included items. |

### MBMC Passport

| Rule | Contract |
|---|---|
| Primary cognitive question | What is the machine's current public identity record? |
| Allowed content | Machine code, public model, public status, first-publication date when available, and the explicit current-record scope statement. |
| Forbidden content | Complete history, ownership history, repair history, inspection history, provenance or completeness claims. |
| Publication threshold | A published machine has a current public Passport identity record. |
| Omission behavior | Required in v1. Unsupported optional fields are omitted. Empty Timeline or future Passport fields must not appear. |
| Duplication policy | It may repeat minimum identity needed to make the record coherent, but must not repeat Hero price, CTA or the verified-information explanation. |
| Trust risks | “MBMC Passport” behaving as an authority badge or implying a complete lifecycle record. |

### Technical Reference

| Rule | Contract |
|---|---|
| Primary cognitive question | Is there additional allowlisted technical reference information I may need? |
| Allowed content | Additional technical fields with a genuine reference purpose, currently display detail, camera, ports, Touch ID and weight when populated. |
| Forbidden content | Hero-derived model, chip, RAM, storage, color, screen-size or release-year repetition; suitability inference; private or unallowlisted fields. |
| Publication threshold | At least one populated, allowlisted additional reference field. |
| Omission behavior | Omit the entire section when no additional reference field exists. Never render a future-data placeholder. |
| Duplication policy | A Hero fact may recur only after explicit review establishes a distinct reference purpose. |
| Trust risks | Creating a second information hierarchy, increasing specification noise or moving technical data ahead of fit and uncertainty. |

### Final Decision Panel

| Rule | Contract |
|---|---|
| Primary cognitive question | What should I do if uncertainty remains? |
| Allowed content | Calm invitation to explain remaining uncertainty, machine-specific identity, predictable public handoff/support statements and existing contact action. |
| Forbidden content | Urgency, scarcity, closing pressure, commitment assumptions, complete Care claims or generic conversion copy. |
| Publication threshold | Always present after decision, trust, supporting information and reference content. |
| Omission behavior | May not be removed without an owner-approved replacement that resolves uncertainty without pressure. |
| Duplication policy | It owns unresolved-uncertainty contact. It must not repeat Hero sales framing or compete with a visible sticky contact utility. |
| Trust risks | Becoming a final sales close instead of returning agency to the customer. |

### Sticky contact utility

| Rule | Contract |
|---|---|
| Primary cognitive question | How can I retain access to the same machine-specific contact action while reading? |
| Allowed content | Compact machine identity, reference configuration, price on supported layouts and the existing machine-specific contact action. |
| Forbidden content | A second simultaneous dominant CTA, urgency, new conversion claims or content that replaces dossier reading. |
| Publication threshold | It may appear only after the Hero CTA leaves the viewport and before the final Decision Panel enters it. |
| Omission behavior | Hidden while Hero CTA is visible; hidden when the final Decision Panel is visible; initially hidden until state is known. |
| Duplication policy | Continuity is its only justification. It must not create a competing contact state. |
| Trust risks | Persistent conversion pressure, obstruction on small screens and simultaneous primary actions. |

## 4. Immutable product rules

The following rules define Decision Dossier v1 and cannot be changed as routine
implementation detail:

1. **Decision before detail.** Decision orientation, suitability, judgement and
   uncertainty precede supporting detail and technical reference.
2. **Balanced publication.** Suitable For must not appear without the approved
   balancing rule. If one side is unavailable, both sides are omitted.
3. **Equal non-fit weight.** Not Suitable For receives equal semantic and visual
   weight to Suitable For.
4. **Judgement remains judgement.** Human judgement is never presented as
   verified fact, inspection or Evidence.
5. **Absence is not a favorable conclusion.** Missing information cannot become
   “no repair,” “has warranty,” “verified source,” “passed inspection” or any
   equivalent inference.
6. **Facts are not complete Evidence.** Public facts and images cannot be
   labelled complete Evidence without governed provenance and claim linkage.
7. **Passport is not history.** Passport must not imply complete history.
8. **Reference must earn repetition.** Technical Reference cannot duplicate
   Hero information without a distinct, approved reference purpose.
9. **One dominant contact state.** Hero, sticky utility and final Decision Panel
   cannot compete as simultaneous primary machine-specific CTAs.
10. **Resolve; do not rush.** The Decision Panel resolves uncertainty and never
    manufactures urgency.
11. **No capability placeholders.** A section exists only when its current
    product responsibility and publication threshold are truthful.
12. **Specifications stay subordinate.** Future features cannot move
    specifications ahead of suitability, judgement or uncertainty.
13. **Structured truth wins.** Unsupported prose cannot override contradictory
    structured public information.
14. **Omission beats invention.** When the source cannot support a public
    statement, omit it or describe the limitation.
15. **Mobile order is product order.** Responsive presentation may stack or
    disclose content, but it cannot change the cognitive sequence.

## 5. Terminology contract

| Term | Contract meaning |
|---|---|
| Internal vocabulary | Engineering and product names such as Known, Unknown, Evidence or `MachineEvidenceGrid`. Internal names do not authorize stronger public claims. |
| User-facing Vietnamese copy | The language customers read. It must communicate scope directly without requiring internal MBMC vocabulary. |
| Verified public information | A display-safe value confirmed within the approved public projection. It confirms the public record only; it is not automatically a complete inspection conclusion. |
| Human judgement | Reviewed interpretation written by a person. It may explain fit or meaning but remains distinguishable from public fact. |
| Supporting information | Approved facts or images that help the customer inspect the current public record. Supporting information is not automatically claim-level Evidence. |
| Evidence | Reserved for a future public artifact linked to a named claim with provenance, method, timestamp and explicit limitation. V1 does not publish complete Evidence. |
| Unknown | Internal concept for information the public projection cannot currently substantiate. It does not mean false, failed, absent in reality or unfavorable. |
| Unavailable public information | User-facing statement about what the current public dossier does not contain. It describes dossier scope, not hidden operational facts. |
| Passport | The structured current public identity record for a machine. |
| Complete history | A governed lifecycle record covering all promised history dimensions. V1 Passport is explicitly not this. |

The user-facing terms “Đã xác minh trong hồ sơ công khai” and “Chưa đủ
thông tin” are a deliberate scoped translation of verified and unavailable
public information. The public page must not expose “Known” and “Unknown” when
those terms would force the customer to understand MBMC's internal taxonomy.

## 6. Contact-state contract

The machine-specific primary contact state follows this policy:

1. **Hero CTA visible → sticky hidden.**
2. **Hero CTA leaves the viewport → sticky may appear.**
3. **Final Decision Panel enters the viewport → sticky hidden.**
4. **Final Decision Panel → unresolved uncertainty handoff.**

The sticky utility is continuity, not a fourth decision step. It may not appear
before visibility state is known. Contact destinations and machine context
remain consistent across surfaces.

All contact copy must avoid:

- urgency or countdown language;
- scarcity or “last chance” language;
- assumed purchase commitment;
- shame, fear or pressure;
- claims that contacting MBMC confirms suitability.

## 7. Content-governance rules

| Content | Approval requirement | Publication rule |
|---|---|---|
| Suitable For | Reviewed editorial approval for the current public revision by the Product/Content authority. | Publish only with an approved Not Suitable For counterpart. |
| Not Suitable For | Reviewed editorial approval for the same revision and equivalent scrutiny as positive fit. | Publish only with an approved Suitable For counterpart and equal treatment. |
| Expert Summary | Human-authored or human-reviewed approval, explicitly classified as judgement. | Publish only when it adds decision interpretation and makes no unsupported factual claim. |
| Condition description | Reviewed public prose consistent with structured condition and included-items data. | Remove unsupported clauses; omit the result if nothing meaningful remains. |
| Included items | Structured public item states and approved accessory names. | Render only affirmative or explicitly governed values; prose cannot add an unconfirmed item. |
| Battery and cycle interpretation | Product/Trust-approved interpretive standard with defined ranges, limitations and source scope. | V1 may show raw approved values; it must not add “good,” “bad,” longevity or suitability interpretation without approval. |
| Grade interpretation | Product/Trust-approved definition of each public grade and its limitations. | V1 may show the approved grade value; it must not imply a universal condition conclusion. |
| Public limitations | Governed typed status and approved scope wording. | Describe the public dossier's information state without inferring operational reality. |
| Passport fields | Approved public identity or lifecycle source with defined completeness and visibility. | V1 publishes only current identity fields. New field families require scope review. |

Conflict rules:

1. Structured public data takes precedence over unsupported prose.
2. Contradictory claims are removed or reconciled before publication.
3. Omission is preferred over invented certainty.
4. Missing structured data does not prove the opposite claim.
5. A public label cannot be stronger than the source and review process behind
   it.
6. Content approval applies to a specific public revision; later source changes
   require renewed consistency checks.

## 8. Deferred capability boundaries

V1 does not include the following capabilities:

| Deferred capability | What must become true before inclusion |
|---|---|
| Benefits | Reviewed structured content must explain user-relevant outcomes without duplicating suitability or converting specifications into marketing claims. |
| Trade-offs | A governed content model must state what is gained and sacrificed, with balanced review and a defined relationship to suitability. |
| Timeline | Public-safe governed lifecycle events, dates, event types, source rules, redaction rules and completeness language must exist. |
| Complete Evidence provenance | Evidence artifacts must support named claims and carry public-safe provenance, method, timestamp, reviewer/source and limitations. |
| Complete Care | Approved policy definitions, scope, exclusions, process and predictable post-purchase outcomes must exist. |
| Related Machines | Selection must be explainable, public-safe and tied to a decision reason rather than generic merchandising. |
| Recommendation engine | Inputs, reasoning, uncertainty, trade-offs, safeguards and human-judgement boundaries must be governed and testable. |
| Decision Stories | Consent, editorial governance, truthful decision context and a maintained content source must exist. |
| Complete inspection | A defined inspection protocol, coverage, result semantics, timestamp, responsible source and public limitations must exist. |
| Complete ownership history | Governed, public-safe sources and an explicit completeness standard must exist. |
| Complete repair history | Governed repair events, source verification, redaction and a distinction between “no event” and “no information” must exist. |

Passing a UI or DTO field into the page is not sufficient to satisfy these
entry conditions. Deferred capabilities must not appear as empty cards,
disabled controls, “coming soon” sections or trust-signalling labels.

## 9. Change-control rules

Every proposed change must answer:

1. Which single cognitive question does it help?
2. What verified data or approved judgement supports it?
3. What existing section or statement does it duplicate?
4. What new inference could a customer draw from it?
5. Could it increase persuasion while reducing understanding?
6. Could it imply completeness beyond the source?
7. Does it preserve the mobile reading order?
8. Does it preserve one dominant contact state?

A change cannot proceed until these answers are recorded in its product plan,
issue or review.

Explicit owner judgement is required when a change affects:

- section order;
- terminology strength;
- publication thresholds;
- contact-state policy;
- Evidence semantics;
- Passport scope;
- suitability balance.

Engineering may make behavior-preserving implementation changes without owner
judgement only when the answers above remain unchanged and contract-level
acceptance tests continue to pass.

Changes to this contract require:

1. Product Owner approval;
2. Trust/Content Owner approval when wording, claims, thresholds, Evidence,
   Passport or uncertainty are affected;
3. Engineering impact review;
4. an entry in the change log;
5. a version decision under Section 12.

## 10. Contract-level acceptance tests

The following criteria are normative and should become or remain automated
where practical:

### Order and orientation

- Hero precedes decision hook.
- Decision hook precedes Decision Summary.
- Decision Summary precedes suitability, judgement, confirmed information and
  limitations.
- Suitability and non-suitability, when present, precede Expert Summary.
- Confirmed and unavailable public information precede supporting information.
- Supporting information precedes Passport.
- Passport precedes Technical Reference.
- Technical Reference, when present, precedes the final Decision Panel.
- Mobile preserves the same semantic and reading order.
- On mobile, the decision hook and Decision Summary remain ahead of detailed
  dossier content, and contact utilities do not displace that orientation.

### Publication and omission

- Suitable For and Not Suitable For publish only as a balanced pair.
- Both use equivalent semantic structure and visual weight.
- Expert Summary is absent when no approved judgement exists.
- Limitations appear only from governed public statuses and are not suppressed
  when applicable.
- Empty Technical Reference is absent.
- Deferred capabilities do not render placeholders.

### Wording and trust boundaries

- The verified heading retains explicit public-dossier scope.
- Verified copy does not claim comprehensive inspection.
- Limitation copy describes public-record availability, not machine defects or
  favorable operational conclusions.
- Human judgement is labelled separately from verified public information.
- Supporting facts and images are not called complete Evidence.
- Passport states that it is not complete history.
- No urgency, scarcity or forced-commitment language appears.
- Contradictory structured data and prose cannot publish together; unsupported
  prose is removed or the record fails content review.

### Duplication and disclosure

- Decision Summary contains no specifications.
- Technical Reference contains no Hero-derived field without an approved
  reference purpose.
- Repeated approved images remain accessible and may use progressive
  disclosure without JavaScript-only access.
- Passport repeats only the identity required to make the record coherent.

### Contact-state exclusivity

- While the Hero CTA intersects the viewport, the sticky contact utility is
  absent.
- After the Hero CTA leaves and before the final Decision Panel enters, the
  sticky utility may be present.
- While the final Decision Panel intersects the viewport, the sticky utility is
  absent.
- The sticky utility is absent on initial render until visibility state is
  established.

## 11. Known limitations

Decision Dossier v1 currently has these known limitations:

- no real public machine has a complete balanced Suitable For / Not Suitable
  For pair, so the central balanced state still requires real-content visual
  QA;
- battery health, cycle count and cosmetic grade lack approved user-facing
  interpretation;
- the public-limitations taxonomy is narrow and status-level;
- Passport is a current identity record, not full history;
- supporting facts and public images lack claim-level provenance;
- inspection remains publicly unavailable rather than a complete inspection
  result;
- warranty, source verification and repair status remain coarse unknown states;
- Expert Summary depends on optional reviewed editorial content;
- the Technical Reference may be absent because additional allowlisted fields
  are not populated.

These limitations are not defects to hide. They define the truthful boundary
of v1 and must remain visible where their absence could change a decision.

## 12. Versioning

### Version policy

The contract version is **Decision Dossier Contract v1.0**.

- **Patch (`v1.0.x`)**: clarification that does not change cognitive order,
  publication thresholds, customer inference, terminology strength, contact
  policy or capability scope.
- **Minor (`v1.x`)**: additive governed capability that preserves every v1
  immutable rule and does not change an existing section's meaning.
- **Major (`v2.0`)**: change to cognitive order, suitability balance,
  terminology strength, Evidence meaning, Passport scope, contact-state policy,
  publication thresholds or another immutable rule.

The public DTO version is a separate technical concern. Changing this product
contract does not itself authorize an API change, and an additive DTO change
does not itself authorize stronger product semantics.

### Review triggers

Review this contract when:

- a deferred capability is proposed for inclusion;
- a new public data source or DTO version changes claim scope;
- a real balanced suitability pair is first approved;
- Evidence provenance or inspection results become publishable;
- Passport gains lifecycle or history fields;
- contact behavior or section order is proposed to change;
- user research or a production trust incident shows a material
  misunderstanding;
- Product Laws or the Trust System are revised.

### Change log

| Version | Date | Change | Approval |
|---|---|---|---|
| v1.0 | 2026-07-23 | Established the first stable Decision Dossier product contract from the Phase 3 release, Phase 3C UX audit and Phase 3.5 surgical polish. | Initial contract baseline |
