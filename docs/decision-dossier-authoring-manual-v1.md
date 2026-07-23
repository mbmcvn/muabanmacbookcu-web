---
title: Decision Dossier Authoring Manual v1
status: proposed
scope: decision-quality-authoring
date: 2026-07-23
product_contract: docs/decision-dossier-v1-contract.md
governance_plan: docs/phase-4a-public-content-governance-plan.md
---

# Decision Dossier Authoring Manual v1

## How to use this manual

This manual defines how MBMC authors turn approved machine information into
decision-support content for Decision Dossier v1.

It is not a general editorial style guide. It does not teach brand decoration,
SEO copywriting or conversion writing. It teaches authors to:

- distinguish observation from interpretation;
- make the basis of judgement inspectable;
- give positive fit and stopping conditions equal care;
- preserve uncertainty when information is missing;
- remove unsupported content instead of filling space;
- help the customer decide without pushing the customer to buy.

The locked [Decision Dossier Contract
v1.0](decision-dossier-v1-contract.md) controls product meaning. The [Phase 4A
governance plan](phase-4a-public-content-governance-plan.md) controls authority,
review, publication and staleness. If this manual conflicts with either
document, the contract and governance plan take precedence.

Examples in this manual are abstract writing patterns. Bracketed text such as
`[use case]` or `[public fact]` is a placeholder for an authoring decision, not
example content for a real machine.

## 1. Writing Philosophy

### 1.1 The author’s job

The author does not make a machine sound desirable.

The author helps a customer answer:

1. Is this machine worth continuing to consider?
2. In which concrete situations could it fit?
3. In which concrete situations should someone stop?
4. What is MBMC interpreting?
5. What does the public dossier actually support?
6. What does it not yet support?

The writing is successful when a customer can reach a confident **yes**, **no**
or **not yet** and understand why.

### 1.2 The quality hierarchy

Use this hierarchy when two writing goals compete:

```text
Truth
  → Scope
    → Balance
      → Understanding
        → Brevity
          → Persuasion
```

Persuasion is last and is never an independent objective. If a sentence becomes
more persuasive by becoming less precise, remove or rewrite it.

### 1.3 Product Laws applied to writing

| Product Law | Authoring behavior |
|---|---|
| Reduce Noise | Include only information that changes understanding or the next decision. |
| Clarity Before Beauty | Prefer an exact plain sentence over polished ambiguity. |
| Progressive Disclosure | Put orientation before detail; do not preload every fact into summary copy. |
| Explain Trade-offs | State stopping conditions with the same care as positive fit. Do not introduce a Benefits or Trade-offs section in v1. |
| Never Rush a Decision | Never use urgency, scarcity or assumed commitment. |
| People Before Machines | Describe a customer situation, not a specification in isolation. |
| Evidence Before Claims | Do not make a claim stronger than its current public basis. Do not call v1 supporting information complete Evidence. |
| Honest Uncertainty | Say what the public dossier does not contain without turning absence into a conclusion. |
| Calm Is a Feature | Use restrained, predictable language. |
| One Decision at a Time | Give each section one cognitive job and avoid repetition. |

### 1.4 Four sentence tests

Before keeping any sentence, ask:

1. **Source test:** What current public fact, approved description or governed
   judgement basis allows us to say this?
2. **Scope test:** Could a reader understand this more broadly than the source
   permits?
3. **Decision test:** What decision does this sentence help the customer make?
4. **Removal test:** If this sentence disappeared, would understanding become
   worse?

If the Source test fails, reject the sentence. If only the Removal test fails,
remove it as noise.

### 1.5 The author must be willing to omit

An empty optional section is not an authoring failure.

Publishing weak or unsupported judgement is a failure. In v1:

- no balanced fit basis → omit both suitability sections;
- no additional human interpretation → omit Expert Summary;
- no supported public fact → omit that fact;
- no governed limitation state → do not invent a limitation;
- no meaningful condition description after reconciliation → do not keep
  unsupported filler.

## 2. Writing Process

The required sequence is:

```text
Observe
  ↓
Interpret
  ↓
Write
  ↓
Review
  ↓
Publish
```

Do not start by drafting polished copy. A sentence written before its basis is
identified is harder to review and easier to rationalize after the fact.

### 2.1 Observe

**Question:** What does the current review packet actually contain?

Collect the approved or reviewable inputs:

- public machine identity and configuration;
- current price and inventory state;
- approved public images;
- public condition observations;
- structured included items;
- raw battery health, cycle count and grade;
- current public limitations;
- any approved model-level reference used by judgement;
- the editorial revision being prepared.

For every input, record:

- source;
- current value;
- observation or measurement time when available;
- whether it is fact, description, judgement or unavailable information;
- whether it conflicts with another input;
- whether it may change before publication.

**Observe output:** a reconciled fact sheet and a conflict list.

Do not continue while a material contradiction remains unresolved.

### 2.2 Interpret

**Question:** What can the facts reasonably mean for a bounded customer
situation?

For each proposed interpretation, record:

| Item | Required entry |
|---|---|
| Customer situation | A concrete use case, need or stopping condition |
| Basis | The current public facts and approved references used |
| Interpretation | The bounded meaning MBMC draws from that basis |
| Confidence | High, Moderate or Low under Phase 4A governance |
| Scope | Conditions under which the interpretation holds |
| Uncertainty | What the dossier still cannot substantiate |
| Invalidation trigger | Which fact change would require review |

Interpretation may connect facts to a decision. It may not:

- overwrite a fact;
- use a missing value as proof;
- treat common model knowledge as approved public data;
- turn raw battery, cycle or grade values into a quality label;
- claim universal suitability;
- conceal a stopping condition.

**Interpret output:** a reviewable judgement worksheet.

Low-confidence interpretations do not move to writing.

### 2.3 Write

**Question:** What is the shortest accurate wording that preserves basis,
scope and balance?

Write in this order:

1. Suitable For and Not Suitable For together.
2. Đánh giá từ MBMC, only if it adds interpretation.
3. Public condition description, reconciled with structured items.
4. Confirm the governed public-limitation states.
5. Confirm raw battery, cycle and grade presentation.
6. Confirm the current Decision Summary template will select the correct
   balanced or fallback state.

Do not write sections in page order merely to fill them. Fit is written as a
pair because one side changes the meaning of the other.

**Write output:** a complete editorial revision or an explicit omission
decision for each optional field.

### 2.4 Review

Review happens in two passes.

#### Truth review

Check:

- every statement against its source;
- prose against structured facts;
- condition description against images and included items;
- all unavailable-information states;
- raw facts for accidental interpretation;
- freshness and material changes since observation.

#### Decision-quality review

Check:

- concrete customer situations;
- semantic balance between Suitable and Not Suitable;
- scope and uncertainty;
- repetition across sections;
- marketing or pressure language;
- whether Expert Summary adds meaning;
- whether a customer could infer more certainty than MBMC has.

**Review output:** approved exact revision, changes requested or Needs Data.

An author must not silently revise text after approval. Any material revision
returns to review.

### 2.5 Publish

Before publication:

- verify that the reviewed editorial revision is still current;
- verify that machine state and declared judgement dependencies have not
  changed;
- verify that approved and published revision bindings match;
- verify that all omissions remain truthful;
- verify that no deferred capability or placeholder appeared;
- run the publication checklist in Section 12.

**Publish output:** one exact, reviewed, revision-bound public packet.

Publication does not make judgement a fact. It makes the judgement approved for
public use within its recorded scope.

## 3. Suitable For

### 3.1 Purpose

Suitable For answers:

> In which concrete situation could this machine remain a reasonable option?

It does not answer:

- Is this a good machine?
- Is this the best value?
- Should everyone buy it?
- Is this machine suitable for the current visitor?

### 3.2 How to derive it

For each candidate item:

1. Name one concrete use case, need or priority.
2. Identify the facts that matter to that situation.
3. State what those facts allow MBMC to interpret.
4. Add the boundary or condition that keeps the statement honest.
5. Identify the corresponding stopping condition for Not Suitable For.
6. Assign confidence.
7. Remove the item if confidence is Low.

Do not derive fit from specifications alone.

Weak derivation:

```text
[specification] → suitable
```

Required derivation:

```text
[customer situation]
  + [supported fact]
  + [scope or limitation]
  → [bounded human judgement]
```

### 3.3 Approved structures

Good structural patterns:

- “Phù hợp nếu bạn [concrete use case] và [bounded requirement].”
- “Nên tiếp tục cân nhắc nếu bạn ưu tiên [supported priority] hơn
  [explicit competing need].”
- “Có thể phù hợp với [specific situation], trong phạm vi
  [supported limitation].”
- “Phù hợp nếu nhu cầu của bạn dừng ở [bounded outcome] và không cần
  [unsupported capability].”

These are frameworks. Replace brackets only with reviewed content from the
current packet.

### 3.4 Good, average and rejected patterns

| Rating | Pattern | Why |
|---|---|---|
| Good | “Phù hợp nếu bạn [specific task] trong phạm vi [bounded intensity] và ưu tiên [supported need].” | Starts with the person, defines scope and avoids universal fit. |
| Good | “Nên tiếp tục cân nhắc nếu [supported fact] đáp ứng đúng yêu cầu [specific requirement] của bạn.” | Connects a fact to a concrete need without upgrading the fact into proof of everything. |
| Average | “Phù hợp cho công việc văn phòng.” | Understandable but too broad; workload, software and intensity are undefined. Narrow before publication. |
| Average | “Phù hợp nếu bạn cần [specification].” | Restates a machine fact without explaining the customer outcome. |
| Rejected | “Máy mạnh, phù hợp mọi nhu cầu.” | Hype, universal claim and no basis. |
| Rejected | “Lựa chọn tốt nhất trong tầm giá.” | Comparative value claim without governed comparison. |
| Rejected | “Pin tốt nên phù hợp để dùng cả ngày.” | Invents interpretation and future outcome from a raw value. |

### 3.5 Forbidden wording

Reject:

- “tốt nhất,” “đáng tiền nhất,” “quốc dân”;
- “mọi nhu cầu,” “ai cũng dùng được”;
- “máy mạnh,” “cấu hình khủng,” “pin trâu”;
- “yên tâm dùng lâu dài” without a governed basis;
- “đủ dùng” without naming the use and boundary;
- “không cần suy nghĩ” or any decision-pressure wording;
- a specification presented as a fit statement;
- claims based on unknown warranty, repair, source or inspection status.

### 3.6 Length and balance

- Use 1–5 short bullets.
- Prefer one sentence per bullet.
- Each bullet should express one decision condition.
- Do not make positive bullets longer, more specific or more confident than
  the negative side as a general pattern.
- Numerical equality is not enough; reviewers assess semantic weight.

### 3.7 Omission

If no Not Suitable For statement meets the same publication threshold, do not
publish Suitable For. The pair is one governed unit.

## 4. Not Suitable For

### 4.1 Purpose

Not Suitable For answers:

> In which concrete situation should a customer stop considering this machine?

It is not:

- a list of invented defects;
- a disclaimer to protect MBMC;
- a way to frighten the customer into another purchase;
- an upsell to a more expensive machine.

### 4.2 How to write limitations

Write a stopping condition from the customer’s unmet requirement:

```text
[required outcome]
  + [machine limitation or unavailable basis]
  → [clear reason to stop or ask for more information]
```

Good structural patterns:

- “Không phù hợp nếu bạn cần [specific requirement] mà hồ sơ hiện tại không
  đủ cơ sở để xác nhận.”
- “Nên dừng lại nếu công việc của bạn thường xuyên [bounded workload] và cần
  [unsupported capability].”
- “Không nên chọn chiếc máy này chỉ dựa trên [raw fact] nếu mục tiêu của bạn là
  [outcome that raw fact cannot prove].”
- “Không phù hợp nếu [customer requirement] là điều kiện bắt buộc.”

### 4.3 Avoid fear

Do not imply danger merely because information is unavailable.

Rejected:

- “Máy có thể đã sửa nên khá rủi ro.”
- “Không rõ nguồn gốc, nên cân nhắc kỹ.”
- “Pin có thể xuống nhanh.”

These sentences turn missing public information into an operational claim.

Use the governed public-limitation wording in its own section. A suitability
item may say a customer should stop when a missing fact is mandatory to their
decision, but it must not speculate about the answer.

### 4.4 Avoid sales

Do not use Not Suitable For to redirect the customer toward a more expensive
option.

Rejected:

- “Không phù hợp nếu cần hiệu năng cao; nên nâng cấp lên dòng cao hơn.”
- “Nếu còn phân vân, chọn bản đắt hơn sẽ an tâm.”
- “Không dành cho người dùng chuyên nghiệp” when “professional” is undefined.

The section ends at the stopping condition. Recommendation and Related Machines
are not v1 capabilities.

### 4.5 Good, average and rejected patterns

| Rating | Pattern | Why |
|---|---|---|
| Good | “Không phù hợp nếu bạn cần [specific capability] như một điều kiện bắt buộc.” | Concrete and customer-led. |
| Good | “Nên dừng lại nếu [missing public result] là thông tin bạn phải có trước khi quyết định.” | Treats missing information as a decision dependency, not a defect. |
| Average | “Không phù hợp cho công việc nặng.” | Directionally useful but “nặng” is undefined. |
| Average | “Không phù hợp nếu cần nhiều RAM.” | “Nhiều” and the workload are undefined; may merely restate specification. |
| Rejected | “Không phù hợp với người khó tính.” | Blames the customer and carries no decision information. |
| Rejected | “Cấu hình yếu, nên mua máy khác.” | Hype in negative form and an upsell. |
| Rejected | “Không phù hợp vì máy chưa được kiểm định.” | Changes an unavailable public result into an operational conclusion. |

### 4.6 Equal care

Review Not Suitable For with the same questions, time and specificity as
Suitable For. Do not:

- shorten negative bullets into vague caveats;
- place multiple stopping conditions in one hard-to-scan paragraph;
- soften a real stopping condition to protect conversion;
- use tentative language on the negative side when the positive side is
  confident on the same basis.

## 5. Decision Summary

### 5.1 Purpose

Decision Summary helps the customer decide whether the rest of the dossier is
worth reading. It is orientation, not a recommendation.

It must:

- identify the next decision work;
- point to both fit and limitations when balanced content exists;
- tell the truth when balanced content is unavailable;
- avoid technical detail.

### 5.2 Current v1 ownership

Decision Summary is currently product-owned template behavior, not free-form
per-machine editorial content.

Authors do not write a bespoke summary to make a machine sound stronger.
Authors ensure that:

- the suitability pair meets publication threshold;
- limitations are current;
- the resulting balanced or fallback template is truthful.

A template wording change requires Product Owner review.

### 5.3 Maximum length

- One short paragraph; or
- no more than five short bullets if the product contract later selects that
  permitted format.

For the current v1 implementation, use one short paragraph.

The summary must not contain:

- configuration;
- price;
- condition details;
- an Expert Summary compressed into one sentence;
- a purchase or contact instruction;
- “recommended,” “best,” “preferred” or equivalent language.

### 5.4 Tone

Use calm orientation:

- “Read both…”
- “The current public dossier contains…”
- “The current dossier does not yet contain enough balanced judgement…”

Avoid:

- “This machine is a great choice…”
- “Do not miss…”
- “You can buy with confidence…”
- “Everything you need is here…”

### 5.5 Fallback behavior

When balanced suitability is unavailable:

- say that the dossier does not yet contain enough balanced judgement about fit
  and stopping conditions;
- direct the reader to confirmed public information and unavailable
  information;
- do not imply a positive default;
- do not point to omitted sections;
- do not generate suitability from configuration.

## 6. Đánh giá từ MBMC

### 6.1 Purpose

Đánh giá từ MBMC is human judgement. It answers:

> Given the current facts, scope and limitations, what does MBMC think matters
> most to this decision?

It does not certify the machine and does not replace Suitable / Not Suitable.

### 6.2 Required basis

Before writing, list:

- the exact public facts used;
- the public limitations that constrain the judgement;
- the customer situation being interpreted;
- confidence;
- invalidation triggers.

The section must identify its basis in the prose or make that basis clear enough
for review. Do not call supporting facts “Evidence” in public copy under v1.

### 6.3 Allowed uncertainty

Human judgement may say:

- “Dựa trên [current public facts]…”
- “Trong phạm vi hồ sơ hiện có…”
- “MBMC đánh giá…”
- “Nhận định này phù hợp khi…”
- “Hồ sơ hiện chưa đủ cơ sở để kết luận…”

Uncertainty is not weakness. It tells the customer where judgement stops.

### 6.4 Required difference from Decision Summary

Decision Summary tells the customer how to read.

Đánh giá từ MBMC explains what MBMC interprets.

If Expert Summary merely repeats that the customer should read fit and
limitations, omit it.

### 6.5 Good, average and rejected patterns

| Rating | Pattern | Why |
|---|---|---|
| Good | “Dựa trên [facts], MBMC đánh giá chiếc máy đáng tiếp tục cân nhắc trong trường hợp [bounded situation]. Hồ sơ hiện chưa đủ cơ sở để kết luận [unavailable matter].” | Shows basis, interpretation and uncertainty. |
| Good | “Điểm đáng chú ý cho quyết định này là [interpreted relationship], không phải chỉ riêng [specification].” | Adds human meaning without pretending verification. |
| Average | “MBMC đánh giá máy phù hợp cho nhu cầu cơ bản.” | Identifies judgement but lacks basis and defined scope. |
| Average | “Đây là lựa chọn cân bằng.” | “Cân bằng” is undefined and likely promotional. |
| Rejected | “MBMC xác nhận máy rất tốt.” | Turns judgement into verified fact and hype. |
| Rejected | “Máy đã được kiểm tra kỹ và hoàn toàn yên tâm.” | Unsupported complete-inspection and reassurance claims. |
| Rejected | “Đây là chiếc máy MBMC khuyên mua.” | Recommendation claim without customer context or governed capability. |

## 7. Public Condition Description

### 7.1 Purpose

The public condition description records specific, approved, observable
condition information. It does not summarize the machine’s total quality.

### 7.2 Observable only

Write what can be directly observed or confirmed in the governed source:

- location;
- visible mark or condition;
- extent when supportable;
- included item confirmed by the structured record.

Structural pattern:

> “[Location] has [observable condition].”

Only add effect on use when that effect was actually established through an
approved process. Visible appearance alone cannot establish internal operation.

### 7.3 No exaggeration

Avoid undefined intensifiers:

- đẹp;
- rất đẹp;
- như mới;
- hoàn hảo;
- xuất sắc;
- nguyên bản;
- zin;
- fullbox.

An intensifier may not replace a concrete observation. `fullbox` is unsupported
unless the structured included-items record confirms the box; even then,
listing the confirmed items is clearer.

### 7.4 No hidden inference

Do not infer:

- repair history from appearance;
- source history from accessories or packaging;
- inspection result from images;
- internal condition from exterior condition;
- absence of damage from missing observations;
- completeness from a limited image set.

### 7.5 Good, average and rejected patterns

| Rating | Pattern | Why |
|---|---|---|
| Good | “[Specific location] có [visible condition] trong phạm vi [observable extent].” | Concrete and bounded. |
| Good | “Hồ sơ công khai ghi nhận [confirmed item/condition]; các phần khác không được suy ra từ mô tả này.” | Explicit scope where needed. |
| Average | “Ngoại hình khá.” | Too subjective and gives no observable detail. |
| Average | “Có dấu hiệu sử dụng.” | Plausible but too broad to inspect. |
| Rejected | “Máy đẹp như mới, nguyên zin.” | Hype and hidden history inference. |
| Rejected | “Máy fullbox” when box is not structurally confirmed | Contradicts or exceeds the public record. |
| Rejected | “Không ảnh hưởng sử dụng” without an approved operational basis | Converts appearance observation into a functional conclusion. |

### 7.6 Reconciliation rule

Structured public facts override unsupported prose.

If prose conflicts with included items, grade, images or current condition:

1. verify the source;
2. correct the structured fact when the source proves it is wrong; otherwise
3. remove or narrow the prose;
4. request data when neither source resolves the conflict;
5. do not publish until a material contradiction is resolved.

## 8. Battery, Cycle and Grade

### 8.1 Raw facts

Decision Dossier v1 may display:

- raw battery-health percentage;
- raw integer cycle count;
- raw public grade.

Authors copy or confirm these values from governed structured fields. Authors
do not rewrite them into marketing language.

### 8.2 Interpretation is not yet approved

Do not write:

- pin tốt / pin xấu / pin trâu;
- chu kỳ thấp / cao;
- còn dùng được lâu;
- đủ dùng cả ngày;
- ngoại hình đẹp because of grade;
- grade A means “like new”;
- a quality band or suitability conclusion.

The current system lacks approved:

- measurement method and timestamp;
- threshold definitions;
- model-specific applicability;
- tolerance and uncertainty;
- grade rubric for user-facing interpretation.

### 8.3 Global versus model-specific thresholds

Authors do not create thresholds.

- No global threshold is approved.
- No model-specific threshold is approved.
- Do not borrow thresholds from marketplace convention, personal experience or
  another seller.
- Until governance is approved, omit interpretation and retain the raw value.

### 8.4 Staleness

Battery and cycle values change with use. Before publication, the author checks
that:

- the value is the latest governed reading;
- the Phase 4A pilot freshness rule is satisfied;
- no service or material use occurred afterward;
- fit and Expert Summary do not depend on qualitative interpretation.

Do not use publication date as measurement date.

## 9. Public Limitations

### 9.1 Purpose

Public limitations explain what the current public dossier does not yet
contain. They do not describe a defect unless a governed fact explicitly does
so.

### 9.2 Current v1 ownership

Public limitations are governed templates derived from typed statuses. Authors
verify the status and the selected template. They do not create speculative
per-machine explanations.

### 9.3 Required structure

Start from the public dossier:

> “Hồ sơ công khai hiện chưa có [governed information or result].”

This structure prevents two common errors:

- making a statement about the machine instead of the record;
- implying a hidden reason for the absence.

### 9.4 Allowed content

- which governed public result is unavailable;
- the scope of the current public dossier;
- a neutral statement that more information is required for a conclusion.

### 9.5 Forbidden transformations

| Unavailable state | Forbidden conclusion |
|---|---|
| Inspection result unavailable | Machine failed inspection / machine was never inspected |
| Warranty undetermined | No warranty / warranty exists |
| Source verification unknown | Unknown origin / verified origin |
| Repair conclusion unavailable | Never repaired / repaired |

Do not add:

- why the information is missing unless that reason is governed and approved;
- reassurance that MBMC “knows internally”;
- language suggesting undisclosed hidden information;
- fear or urgency.

### 9.6 Good, average and rejected patterns

| Rating | Pattern | Why |
|---|---|---|
| Good | “Hồ sơ công khai hiện chưa có [governed result].” | Describes the dossier, not the machine. |
| Average | “Chưa rõ [topic].” | Honest but scope is ambiguous. |
| Rejected | “Máy không có [result].” | Converts unavailable information into absence. |
| Rejected | “Thông tin đang được MBMC giữ kín.” | Implies hidden information. |
| Rejected | “Không cần lo về [unknown].” | Reassurance without basis. |

## 10. Language Rules

These rules serve decision quality. They are not decorative brand preferences.

### 10.1 Active voice

Prefer:

- “MBMC đánh giá…”
- “Hồ sơ công khai hiện chưa có…”
- “Bạn nên dừng lại nếu…”

Avoid hiding responsibility:

- “Được đánh giá là…”
- “Được cho là…”
- “Có thể hiểu rằng…” without naming whose judgement it is.

### 10.2 Concrete wording

Replace vague words with a bounded situation:

| Vague | Required revision |
|---|---|
| nhu cầu cơ bản | Name the task and intensity |
| công việc nặng | Name the workload and required outcome |
| dùng lâu dài | Name the period only if governed; otherwise remove |
| hiệu năng tốt | Name the fact and the bounded use-case interpretation |
| pin ổn | Keep the raw value; interpretation is not approved |
| ngoại hình đẹp | Describe visible condition |
| giá hợp lý | State current price; comparative value is not governed |

### 10.3 Short sentences

- One primary claim per sentence.
- One decision condition per list item.
- Prefer direct subject–verb–object order.
- Split a sentence when “và” joins two claims with different sources.
- Remove throat-clearing phrases.

### 10.4 No hype

Do not use:

- siêu, cực, hoàn hảo, xuất sắc;
- đáng tiền, hời, best choice;
- zin, chuẩn, yên tâm tuyệt đối;
- hot, hiếm, không thể bỏ lỡ.

### 10.5 No persuasion pressure

Do not:

- ask the customer to hurry;
- imply scarcity;
- assume contact or purchase;
- shame uncertainty;
- use confidence language MBMC has not earned;
- make stopping feel like failure.

### 10.6 Calibrated certainty

Use certainty that matches the content class:

| Content class | Preferred grammar |
|---|---|
| Structured fact | “[Field] là [value].” |
| Observable description | “[Location] có [visible condition].” |
| Human judgement | “MBMC đánh giá…”, “Có thể phù hợp nếu…” |
| Unavailable information | “Hồ sơ công khai hiện chưa có…” |
| Unsupported claim | Do not write it |

### 10.7 Customer language

Explain with the customer’s task and concern, not internal taxonomy. Do not
publish “Known,” “Unknown,” projection, DTO, revision or eligibility language.

## 11. Consistency Checklist

Use this checklist after drafting and before formal review.

### Across all content

- [ ] Every statement has a current source or approved judgement basis.
- [ ] Facts, descriptions, judgement and unavailable information are not mixed.
- [ ] Structured facts and prose do not conflict.
- [ ] Missing information has not become a positive or negative conclusion.
- [ ] No sentence implies complete inspection, Evidence or history.
- [ ] No deferred capability appears through wording.

### Suitable / Not Suitable

- [ ] Both lists exist or both are omitted.
- [ ] Each item names a concrete customer situation.
- [ ] Each item has High or Moderate confidence.
- [ ] Both lists receive equivalent specificity, certainty and care.
- [ ] No item is only a specification.
- [ ] No item depends on unapproved battery, cycle or grade interpretation.
- [ ] No item redirects the customer to another machine.

### Decision Summary / Expert Summary

- [ ] Decision Summary uses the correct governed template state.
- [ ] Decision Summary contains no specifications or recommendation.
- [ ] Expert Summary identifies its basis.
- [ ] Expert Summary adds interpretation rather than repeating other sections.
- [ ] Expert Summary is clearly human judgement.

### Condition / supporting facts

- [ ] Condition copy is observable and bounded.
- [ ] Included items match structured fields.
- [ ] Images do not silently carry a hidden-condition inference.
- [ ] Battery, cycle and grade remain raw facts.

### Public limitations / Passport

- [ ] Each limitation describes the public dossier.
- [ ] No limitation speculates about cause.
- [ ] Passport identity matches current public identity and status.
- [ ] Passport does not imply complete history.

### Language

- [ ] Sentences are active, concrete and short.
- [ ] Vague workload or quality words are defined or removed.
- [ ] Hype, urgency, scarcity and reassurance without basis are absent.
- [ ] Repeated claims have been removed.

## 12. Publication Checklist

The author completes this checklist with the reviewer and publication owner.

### Packet integrity

- [ ] Machine code and editorial revision are recorded.
- [ ] The reviewed facts are still current.
- [ ] Declared judgement dependencies have not changed.
- [ ] Conflicts and Needs Data items are resolved or content is omitted.
- [ ] Author, reviewer and review time are recorded in the operational process.

### Content gates

- [ ] Suitable and Not Suitable meet the balanced publication rule.
- [ ] Decision Summary will use the correct state.
- [ ] Expert Summary is optional, reviewed and basis-led.
- [ ] Condition description and included items are reconciled.
- [ ] Battery, cycle and grade contain no qualitative interpretation.
- [ ] Public limitations match typed states.
- [ ] Passport contains current identity only.

### Trust gates

- [ ] No unsupported claim remains.
- [ ] No public fact or image is labelled complete Evidence.
- [ ] No completeness claim appears.
- [ ] No unknown is converted into certainty.
- [ ] No marketing, pressure or fake reassurance appears.
- [ ] Omission is used wherever the threshold is not met.

### Revision and publication

- [ ] Current editorial revision equals reviewed revision.
- [ ] Approved editorial revision equals reviewed revision.
- [ ] Published editorial revision will equal reviewed revision.
- [ ] Publication actor and timestamps will be recorded.
- [ ] A post-publication page and DTO check is assigned.

### Visual QA for the first real balanced packet

- [ ] 1440 × 1000 reviewed.
- [ ] 1280 × 800 reviewed.
- [ ] 768 × 1024 reviewed.
- [ ] 390 × 844 reviewed.
- [ ] Fit lists remain equally legible.
- [ ] Decision Summary reflects the balanced state.
- [ ] Human judgement remains distinguishable from fact.
- [ ] Public limitations remain clear.
- [ ] Only one primary contact state dominates.

## 13. Examples

### 13.1 How to read the examples

These examples test writing structure only. They are not content for a real or
fictional machine. Bracketed values must be replaced by reviewed inputs from
the current packet.

### 13.2 Good

Suitable:

> “Phù hợp nếu bạn [specific task] trong phạm vi [bounded intensity] và ưu tiên
> [supported need].”

Not Suitable:

> “Không phù hợp nếu bạn cần [specific unsupported requirement] như một điều
> kiện bắt buộc.”

Expert Summary:

> “Dựa trên [named public facts], MBMC đánh giá chiếc máy đáng tiếp tục cân nhắc
> trong trường hợp [bounded situation]. Hồ sơ hiện chưa đủ cơ sở để kết luận
> [unavailable matter].”

Condition:

> “[Specific location] có [observable condition] trong phạm vi [observable
> extent].”

Public limitation:

> “Hồ sơ công khai hiện chưa có [governed result].”

Why these pass:

- each sentence has one responsibility;
- scope is visible;
- judgement is attributed;
- missing information remains missing;
- no machine is promoted.

### 13.3 Average

Suitable:

> “Phù hợp cho công việc văn phòng.”

Expert Summary:

> “Đây là lựa chọn cân bằng cho nhu cầu cơ bản.”

Condition:

> “Ngoại hình khá, có dấu hiệu sử dụng.”

Public limitation:

> “Chưa rõ thông tin sửa chữa.”

Why these need revision:

- customer situations are broad;
- “cân bằng,” “cơ bản” and “khá” are undefined;
- basis and scope are missing;
- limitation wording does not clearly describe the public dossier.

Average content is not automatically publishable. It returns to authoring.

### 13.4 Rejected

Suitable:

> “Máy mạnh, pin trâu, phù hợp mọi nhu cầu.”

Not Suitable:

> “Không phù hợp với người khó tính; nên mua bản cao hơn.”

Expert Summary:

> “MBMC xác nhận đây là chiếc máy tốt nhất trong tầm giá.”

Condition:

> “Máy đẹp như mới, fullbox, nguyên zin.”

Public limitation:

> “Máy không có lịch sử sửa chữa nên có thể yên tâm.”

Why these are rejected:

- hype and universal claims;
- unsupported battery and value interpretation;
- customer blame and upsell;
- judgement impersonating verification;
- structured-item and hidden-history inference;
- unknown repair information converted into a favorable conclusion.

Rejected content is deleted, not softened until it merely sounds less
aggressive.

## 14. Common Mistakes

### 14.1 Starting with the specification

Mistake:

```text
[RAM amount] → suitable for [broad audience]
```

Correction:

Start with a defined customer requirement, then explain whether current facts
support a bounded judgement.

### 14.2 Writing positive fit first and forcing balance later

Mistake:

Authors produce strong Suitable items, then add generic Not Suitable caveats.

Correction:

Draft both sides from the same decision dimension and packet. If the negative
side cannot be supported, omit both.

### 14.3 Treating uncertainty as a defect

Mistake:

“No public repair conclusion” becomes “possibly repaired.”

Correction:

Describe only the dossier’s information state.

### 14.4 Treating uncertainty as reassurance

Mistake:

“No repair information” becomes “no repairs found” or “safe to assume
original.”

Correction:

Missing information does not prove the favorable opposite.

### 14.5 Repeating one claim everywhere

Mistake:

The same fit sentence appears in Decision Summary, Suitable For and Expert
Summary.

Correction:

- Decision Summary orients.
- Suitable For defines fit.
- Expert Summary interprets.

If Expert Summary adds nothing, omit it.

### 14.6 Turning raw facts into quality

Mistake:

Battery percentage, cycles or grade receives “good,” “low,” “beautiful” or
longevity language.

Correction:

Keep the raw value until an approved interpretation standard exists.

### 14.7 Letting images prove too much

Mistake:

Clean exterior images become proof of internal condition, repair history or
inspection.

Correction:

Images support visible observation only.

### 14.8 Using vague customer categories

Mistake:

“students,” “office users,” “professionals,” “basic users” without a defined
task or requirement.

Correction:

Describe the work, intensity, constraint or decision dependency.

### 14.9 Confusing approval with truth

Mistake:

An approved sentence is treated as permanently correct.

Correction:

Approval is bound to the reviewed revision and factual basis. Material changes
can make approved judgement stale.

### 14.10 Filling optional sections

Mistake:

The author writes generic copy because an empty field feels unfinished.

Correction:

Omission is part of the product contract.

### 14.11 Hiding the limitation inside careful language

Mistake:

A real stopping condition is softened until customers must infer it.

Correction:

State the stopping condition directly, without fear or sales.

### 14.12 Writing the contact outcome

Mistake:

“Contact MBMC now to secure the machine.”

Correction:

Authoring ends with understanding. The final Decision Panel handles unresolved
uncertainty without urgency.

## 15. Future Compatibility with the Evidence System

Decision Dossier v1 does not publish complete Evidence. Authors must not use the
word as a stronger label for public facts, images or judgement.

Authoring can still prepare for a future Evidence System by making every claim
separable and reviewable.

### 15.1 Future-compatible claim record

For each judgement, keep these concepts distinct in the authoring worksheet:

| Concept | Authoring responsibility |
|---|---|
| Claim | The exact bounded statement proposed for public use |
| Claim class | Fact, approved description, human judgement or unavailable information |
| Basis | Current facts or approved references used |
| Scope | Where the claim applies |
| Uncertainty | What the basis does not establish |
| Confidence | High, Moderate or Low |
| Invalidation trigger | Which change requires review |
| Editorial revision | The exact packet containing the claim |

These fields do not create Evidence. They prevent future provenance work from
having to untangle claims that mix fact, judgement and reassurance.

### 15.2 What future Evidence must add

Before a public artifact may be called Evidence, future governance must supply:

- a named claim relationship;
- public-safe provenance;
- method;
- timestamp;
- source or responsible reviewer;
- limitations;
- validity or supersession behavior.

An image alone does not prove a hidden claim. A number alone does not explain
its measurement. An MBMC judgement does not become Evidence because it is
approved.

### 15.3 Writing practices to preserve

Future Evidence work must preserve:

- the distinction between fact and human judgement;
- equal visibility of fit and stopping conditions;
- public limitations;
- omission over invented certainty;
- Passport’s explicit scope;
- Decision before detail;
- one dominant contact state;
- customer agency over conversion.

### 15.4 What authors must not pre-empt

Do not create:

- evidence IDs in public prose;
- provenance claims from memory;
- measurement dates that are actually publication dates;
- complete-inspection language;
- Timeline or repair-history copy;
- “verified” labels beyond current public-dossier scope;
- placeholders for a future Evidence section.

Future compatibility means disciplined separation today, not pretending the
future system already exists.
