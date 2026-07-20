import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { projectPublicCandidates, publicDetailBySlug, publicSummaries } from "./project-public-candidates.ts";
import {
  countFacetOption,
  emptyInventoryFacets,
  filterAndSortPublicInventory,
  filterNormalizedPublicInventory,
  normalizeChipFacet,
  normalizePublicInventory,
  normalizeRamFacet,
  normalizeScreenFacet,
  parseInventoryUrlState,
  removeFacetOption,
  serializeInventoryUrlState,
  sortNormalizedPublicInventory,
  toggleMultiFacet,
} from "./public-inventory-query.ts";
import { loadPublicInventoryState } from "./public-inventory-load-state.ts";
import { nextOpenFilter, selectFacetValues, selectionKeepsFilterOpen } from "../../app/(sales)/may-dang-co/_components/inventory-filter-interaction.ts";
import { formatMachineCardCondition, formatMachineCardDisplayName, formatMachineCardSpecs, getMachineCardBatteryFact } from "../../app/(sales)/may-dang-co/_components/machine-card-presentation.ts";
import { buildDecisionFacts } from "../../app/(sales)/may/[slug]/_components/decision-facts-presentation.ts";
import { formatCompactStorage } from "../../lib/presentation/machine.ts";

function row(code="MBMC-A001",overrides={}){
  const revision=3;
  return {machine_id:code,status:"new_in_stock",deleted_at:null,model_text:"MacBook Air M2 2022 13 inch",chip:"Apple M2",ram_gb:8,ssd_gb:256,color:"Midnight",retail_price_expected:15_800_000,battery_health:92,battery_cycle:120,rank:"A",
    machine_publications:{status:"published",slug:code.toLowerCase(),revision:4,approved_by:"private-owner",approved_at:"2026-07-20T01:00:00Z",approved_editorial_revision:revision,published_by:"private-owner",first_published_at:"2026-07-20T02:00:00Z",published_at:"2026-07-20T02:00:00Z",published_editorial_revision:revision,updated_at:"2026-07-20T02:00:00Z"},
    machine_editorials:{revision,public_condition_summary:"Ngoại hình tốt.",expert_summary:null,suitable_for:[],not_suitable_for:[],contextual_label:null,included_items:{charger:null,cable:null,box:null,bag:null,accessories:[]},policy_applicability:[],reviewed_by:"private-owner",reviewed_at:"2026-07-20T00:30:00Z"},
    machine_images:[{id:`${code}-cover`,public_url:`https://img.example/${code}.webp`,image_type:"cover",image_stage:"listing",visibility:"public",sort_order:0,is_cover:true}],...overrides};
}

function reason(result,name){return !result.eligible&&result.reasons.includes(name);}

test("multiple eligible rows become exact public summaries",()=>{const items=publicSummaries([row("MBMC-A002"),row("MBMC-A001")]);assert.deepEqual(items.map(x=>x.code),["MBMC-A001","MBMC-A002"]);assert.equal(items.every(x=>x.schemaVersion==="public-machine-summary.v1"),true);});
test("sold, unpublished, and archived rows are excluded",()=>{const draft=row("MBMC-DRAFT");draft.machine_publications={...draft.machine_publications,status:"draft",approved_by:null,approved_at:null,approved_editorial_revision:null,published_by:null,first_published_at:null,published_at:null,published_editorial_revision:null};const archived=row("MBMC-ARCH");archived.machine_publications={...archived.machine_publications,status:"archived"};assert.deepEqual(publicSummaries([row("MBMC-SOLD",{status:"sold"}),draft,archived]),[]);});
test("stale revision, missing price, and missing public cover are denied",()=>{const stale=row("MBMC-STALE");stale.machine_editorials={...stale.machine_editorials,revision:4};const noPrice=row("MBMC-NOPRICE",{retail_price_expected:null});const noImage=row("MBMC-NOIMAGE",{machine_images:[]});const [a,b,c]=projectPublicCandidates([stale,noPrice,noImage]);assert.equal(reason(a,"editorial_revision_mismatch"),true);assert.equal(reason(b,"invalid_retail_price"),true);assert.equal(reason(c,"invalid_public_cover"),true);});
test("private images never enter summary or gallery",()=>{const candidate=row();candidate.machine_images.push({id:"private",public_url:"https://private.example/proof.webp",image_type:"proof",image_stage:"source",visibility:"staff",sort_order:-1,is_cover:false});const detail=publicDetailBySlug([candidate],"mbmc-a001");assert.ok(detail);assert.equal(JSON.stringify(detail).includes("private.example"),false);});
test("summaries contain no operational fields or internal actor values",()=>{const summary=publicSummaries([row()])[0];const serialized=JSON.stringify(summary);for(const forbidden of ["approved_by","reviewed_by","deleted_at","machine_images","private-owner"])assert.equal(serialized.includes(forbidden),false);});
test("search covers model, chip, RAM and SSD configuration",()=>{const items=publicSummaries([row()]);for(const query of ["MacBook Air","Apple M2","8gb ram","256gb ssd"])assert.equal(filterAndSortPublicInventory(items,query,"Tất cả","relevance").length,1,query);});
test("price filters and sorting use DTO money deterministically",()=>{const items=publicSummaries([row("MBMC-HIGH",{retail_price_expected:19_000_000}),row("MBMC-LOW",{retail_price_expected:12_000_000}),row("MBMC-MID",{retail_price_expected:16_000_000})]);assert.deepEqual(filterAndSortPublicInventory(items,"","Dưới 15 triệu","relevance").map(x=>x.code),["MBMC-LOW"]);assert.deepEqual(filterAndSortPublicInventory(items,"","Tất cả","price-desc").map(x=>x.code),["MBMC-HIGH","MBMC-MID","MBMC-LOW"]);});
test("detail resolves only an eligible immutable public slug",()=>{assert.equal(publicDetailBySlug([row()],"mbmc-a001")?.schemaVersion,"public-machine-detail.v1");assert.equal(publicDetailBySlug([row()],"unknown"),null);assert.equal(publicDetailBySlug([row("MBMC-SOLD",{status:"sold"})],"mbmc-sold"),null);});
test("one malformed candidate cannot break other valid results",()=>{const malformed={get machine_id(){throw new Error("bad row")}};let failures=0;const results=projectPublicCandidates([malformed,row()],()=>failures++);assert.equal(failures,1);assert.equal(results.length,1);assert.equal(results[0].eligible,true);});
test("production pages do not import the removed static fixture",()=>{for(const relative of ["../../app/(sales)/may-dang-co/page.tsx","../../app/(sales)/may/[slug]/page.tsx"]){const source=readFileSync(new URL(relative,import.meta.url),"utf8");assert.doesNotMatch(source,/static-machine-repository|MBMC-SPJ9|MacBook Air M2 2022 13 inch/);}});
test("two valid published candidates render two cards and both detail slugs resolve",()=>{
  const rows=[row("MBMC-A001"),row("MBMC-A002")];
  assert.equal(publicSummaries(rows).length,2);
  assert.equal(publicDetailBySlug(rows,"mbmc-a001")?.summary.code,"MBMC-A001");
  assert.equal(publicDetailBySlug(rows,"mbmc-a002")?.summary.code,"MBMC-A002");
});

test("one rejected candidate does not hide another valid card",()=>{
  const invalid=row("MBMC-BAD",{retail_price_expected:null});
  assert.deepEqual(publicSummaries([invalid,row("MBMC-GOOD")]).map(item=>item.code),["MBMC-GOOD"]);
});

test("projection rejection is a successful empty inventory, not unavailable",async()=>{
  const state=await loadPublicInventoryState(async()=>publicSummaries([row("MBMC-SOLD",{status:"sold"})]));
  assert.deepEqual(state,{status:"ready",machines:[]});
});

test("configuration and PostgREST failures become unavailable",async()=>{
  for(const code of ["PUBLIC_INVENTORY_CONFIG_MISSING","PGRST200"]){
    const state=await loadPublicInventoryState(async()=>{const error=new Error("safe");error.code=code;throw error;});
    assert.deepEqual(state,{status:"unavailable"});
  }
});

test("candidate exclusion diagnostics contain only safe fields",()=>{
  const diagnostics=[];
  const results=projectPublicCandidates([row("MBMC-BAD",{retail_price_expected:null}),row("MBMC-GOOD")],diagnostic=>diagnostics.push(diagnostic));
  assert.equal(results.some(result=>result.eligible),true);
  assert.deepEqual(diagnostics,[{stage:"ELIGIBILITY_REJECTED",code:"candidate_excluded",machineCode:"MBMC-BAD",exclusionReason:"invalid_retail_price"}]);
  const serialized=JSON.stringify(diagnostics);
  for(const forbidden of ["approved_by","reviewed_by","machine_id","private-owner","uuid","staff"]){assert.equal(serialized.includes(forbidden),false);}
});

test("repository query selects deployed publication relationships without wildcard fields",()=>{
  const source=readFileSync(new URL("./repositories/supabase-public-machine-repository.ts",import.meta.url),"utf8");
  assert.match(source,/machine_publications!inner/);
  assert.match(source,/machine_publications\.status/);
  assert.doesNotMatch(source,/select\([^)]*\*/);
  assert.match(source,/visibility, sort_order, is_cover/);
});

test("public inventory card prefers battery health when available",()=>{
  assert.deepEqual(getMachineCardBatteryFact(95,126),{label:"Pin",value:"95%"});
});

test("public inventory card falls back to cycle count without battery health",()=>{
  assert.deepEqual(getMachineCardBatteryFact(null,126),{label:"Lần sạc",value:"126"});
});

test("public inventory card hides battery information when no battery values exist",()=>{
  assert.equal(getMachineCardBatteryFact(null,null),null);
});

test("public inventory card no longer renders an inspection row",()=>{
  const source=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/MachineCard.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(source,/Kiểm định|machine\.inspection/);
});

test("public inventory card removes Apple Silicon tokens from display titles",()=>{
  const examples=[
    ["MacBook Air M1 2020 13 inch","MacBook Air 2020 13 inch"],
    ["MacBook Pro M1 Pro 2021 16 inch","MacBook Pro 2021 16 inch"],
    ["MacBook Pro M1 Max 2021 16 inch","MacBook Pro 2021 16 inch"],
    ["MacBook Air M2 2022 13 inch","MacBook Air 2022 13 inch"],
    ["MacBook Pro M2 Pro 2023 14 inch","MacBook Pro 2023 14 inch"],
    ["MacBook Pro M2 Max 2023 16 inch","MacBook Pro 2023 16 inch"],
    ["MacBook Pro - Apple M3 Max - 2023 16 inch","MacBook Pro 2023 16 inch"],
  ];
  for(const [before,after] of examples)assert.equal(formatMachineCardDisplayName(before),after);
});

test("public inventory card removes Intel processor tokens from display titles",()=>{
  for(const processor of ["Intel i3","Intel i5","Intel i7","Intel i9","Intel Core i7"]){
    assert.equal(formatMachineCardDisplayName(`MacBook Pro ${processor} 2020 13 inch`),"MacBook Pro 2020 13 inch");
  }
});

test("chip searches still use unmodified public machine data",()=>{
  const machines=publicSummaries([
    row("MBMC-M1PRO",{model_text:"MacBook Pro M1 Pro 2021 16 inch",chip:"M1 Pro"}),
    row("MBMC-INTEL",{model_text:"MacBook Pro Intel i7 2020 13 inch",chip:"Intel i7"}),
  ]);
  assert.deepEqual(filterAndSortPublicInventory(machines,"M1 Pro","Tất cả","relevance").map(machine=>machine.code),["MBMC-M1PRO"]);
  assert.deepEqual(filterAndSortPublicInventory(machines,"Intel i7","Tất cả","relevance").map(machine=>machine.code),["MBMC-INTEL"]);
});

test("public inventory card formats exact 1024GB multiples as compact TB",()=>{
  const examples=[[256,"256GB"],[512,"512GB"],[1024,"1TB"],[2048,"2TB"],[4096,"4TB"],[1536,"1536GB"]];
  for(const [gigabytes,formatted] of examples)assert.equal(formatCompactStorage(gigabytes),formatted);
});

test("public inventory card composes color on the specs line",()=>{
  assert.equal(
    formatMachineCardSpecs({chip:"M1 Pro",ramGb:16,storageGb:1024,color:"Xám"}),
    "M1 Pro · 16GB · 1TB SSD · Xám",
  );
});

test("public inventory card omits missing color without a trailing separator",()=>{
  assert.equal(
    formatMachineCardSpecs({chip:"Intel i5",ramGb:8,storageGb:512,color:null}),
    "Intel i5 · 8GB · 512GB SSD",
  );
  const source=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/MachineCard.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(source,/machine-color/);
});

test("raw and formatted storage searches both find the same machine",()=>{
  const machine=publicSummaries([row("MBMC-1TB",{ssd_gb:1024,color:"Xám"})]);
  for(const query of ["1024GB","1TB","Xám"])assert.deepEqual(
    filterAndSortPublicInventory(machine,query,"Tất cả","relevance").map(item=>item.code),
    ["MBMC-1TB"],
  );
});

function facetedMachines(){
  return publicSummaries([
    row("MBMC-AIR-M1",{model_text:"MacBook Air M1 2020 13 inch",chip:"M1",ram_gb:8,retail_price_expected:14_000_000,color:"Xám"}),
    row("MBMC-PRO-M1P",{model_text:"MacBook Pro M1 Pro 2021 16 inch",chip:"M1 Pro",ram_gb:16,retail_price_expected:17_000_000,color:"Xám"}),
    row("MBMC-PRO-M2",{model_text:"MacBook Pro M2 2022 14 inch",chip:"M2",ram_gb:16,retail_price_expected:18_000_000,color:"Bạc"}),
    row("MBMC-PRO-M2M",{model_text:"MacBook Pro M2 Max 2023 16 inch",chip:"M2 Max",ram_gb:32,retail_price_expected:22_000_000,color:"Đen"}),
    row("MBMC-PRO-INTEL",{model_text:"MacBook Pro Intel i7 2020 13 inch",chip:"Intel Core i7",ram_gb:8,retail_price_expected:13_000_000,color:"Bạc"}),
  ]);
}

test("facet groups combine with AND and options within one group combine with OR",()=>{
  const items=normalizePublicInventory(facetedMachines());
  const facets={...emptyInventoryFacets(),family:["pro"],chip:["m1-pro-max","m2"],ram:["16"]};
  assert.deepEqual(filterNormalizedPublicInventory(items,"",facets).map(item=>item.machine.code),["MBMC-PRO-M1P","MBMC-PRO-M2"]);
  assert.deepEqual(filterNormalizedPublicInventory(items,"Xám",facets).map(item=>item.machine.code),["MBMC-PRO-M1P"]);
});

test("price is single-select with documented inclusive middle boundaries",()=>{
  const items=normalizePublicInventory(facetedMachines());
  const at18={...emptyInventoryFacets(),price:"15-18"};
  assert.deepEqual(filterNormalizedPublicInventory(items,"",at18).map(item=>item.machine.code),["MBMC-PRO-M1P","MBMC-PRO-M2"]);
  assert.equal(typeof at18.price,"string");
});

test("chip normalization distinguishes Intel, base, Pro/Max, and modern generations",()=>{
  assert.equal(normalizeChipFacet("Intel Core i7"),"intel");
  assert.equal(normalizeChipFacet("M1"),"m1");
  assert.equal(normalizeChipFacet("Apple M1 Pro"),"m1-pro-max");
  assert.equal(normalizeChipFacet("M1 Max"),"m1-pro-max");
  assert.equal(normalizeChipFacet("M2"),"m2");
  assert.equal(normalizeChipFacet("M2 Pro"),"m2-pro-max");
  assert.equal(normalizeChipFacet("M2 Max"),"m2-pro-max");
  assert.equal(normalizeChipFacet("M3 Pro"),"m3-plus");
  assert.equal(normalizeChipFacet("M4 Max"),"m3-plus");
});

test("screen and RAM normalization use the public allowlisted values",()=>{
  for(const size of [13,14])assert.equal(normalizeScreenFacet(`MacBook Pro 2022 ${size} inch`),"compact");
  for(const size of [15,16])assert.equal(normalizeScreenFacet(`MacBook Pro 2022 ${size} inch`),"large");
  assert.equal(normalizeRamFacet(8),"8");
  assert.equal(normalizeRamFacet(16),"16");
  assert.equal(normalizeRamFacet(32),"32-plus");
  assert.equal(normalizeRamFacet(64),"32-plus");
});

test("facet counts retain other groups and exclude selections from their own group",()=>{
  const items=normalizePublicInventory(facetedMachines());
  const facets={...emptyInventoryFacets(),family:["pro"],chip:["m1-pro-max"],ram:["16"]};
  assert.equal(countFacetOption(items,"",facets,"chip","m2"),1);
  assert.equal(countFacetOption(items,"",facets,"family","air"),0);
  assert.equal(countFacetOption(items,"Xám",facets,"chip","m2"),0);
});

test("facet options with zero count remain rendered disabled while selected options stay removable",()=>{
  const source=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/InventoryFilters.tsx",import.meta.url),"utf8");
  assert.match(source,/disabled=\{disabled\}/);
  assert.match(source,/count === 0 && !isSelected/);
  assert.match(source,/onRemove\(item\.group, item\.value\)/);
  assert.match(source,/aria-label=\{`Bỏ bộ lọc/);
});

test("facet toggles and active-chip removal change only their own option",()=>{
  let facets=toggleMultiFacet(emptyInventoryFacets(),"chip","m1");
  facets=toggleMultiFacet(facets,"chip","m2");
  facets={...facets,family:["pro"]};
  assert.deepEqual(removeFacetOption(facets,"chip","m1"),{...facets,chip:["m2"]});
  assert.deepEqual(toggleMultiFacet(facets,"chip","m2"),{...facets,chip:["m1"]});
});

test("clear all returns the default facet state",()=>{
  const active={...emptyInventoryFacets(),price:"over-18",family:["pro"],chip:["m2"],ram:["16"],screen:["large"]};
  assert.notDeepEqual(active,emptyInventoryFacets());
  assert.deepEqual(emptyInventoryFacets(),{price:null,family:[],chip:[],ram:[],screen:[]});
});

test("URL state round-trips stable values and safely drops invalid values",()=>{
  const parsed=parseInventoryUrlState(new URLSearchParams("q=M1+Pro&family=pro,bad&chip=m1-pro-max,private&ram=16&screen=large&sort=price-desc"));
  assert.deepEqual(parsed,{query:"M1 Pro",sort:"price-desc",facets:{price:null,family:["pro"],chip:["m1-pro-max"],ram:["16"],screen:["large"]}});
  assert.equal(serializeInventoryUrlState(parsed),"?q=M1+Pro&family=pro&chip=m1-pro-max&ram=16&screen=large&sort=price-desc");
});

test("result count and sorting remain correct after faceted filtering",()=>{
  const items=normalizePublicInventory(facetedMachines());
  const facets={...emptyInventoryFacets(),family:["pro"],ram:["16"]};
  const filtered=filterNormalizedPublicInventory(items,"",facets);
  const sorted=sortNormalizedPublicInventory(filtered,"price-desc");
  assert.equal(filtered.length,2);
  assert.deepEqual(sorted.map(item=>item.machine.code),["MBMC-PRO-M2","MBMC-PRO-M1P"]);
});

test("filter dropdown uses one canonical state for open, switch, and toggle-close behavior",()=>{
  assert.equal(nextOpenFilter(null,"price"),"price");
  assert.equal(nextOpenFilter("price","chip"),"chip");
  assert.equal(nextOpenFilter("chip","chip"),null);
});

test("price selection closes while multi-select chip selection stays open",()=>{
  assert.equal(selectionKeepsFilterOpen("price"),false);
  assert.equal(selectionKeepsFilterOpen("chip"),true);
  assert.equal(selectionKeepsFilterOpen("family"),true);
  assert.equal(selectionKeepsFilterOpen("ram"),true);
  assert.equal(selectionKeepsFilterOpen("screen"),true);
});

test("filter dropdown renders only the canonical open panel with accessible triggers",()=>{
  const source=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/InventoryFilters.tsx",import.meta.url),"utf8");
  assert.match(source,/useState<OpenFilter>\(null\)/);
  assert.match(source,/const isOpen = openFilter === group/);
  assert.match(source,/aria-expanded=\{isOpen\}/);
  assert.match(source,/aria-controls=\{panelId\}/);
  assert.match(source,/\{isOpen \? <fieldset/);
  assert.doesNotMatch(source,/<details|<summary/);
});

test("outside pointer and Escape close the active filter and Escape restores trigger focus",()=>{
  const source=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/InventoryFilters.tsx",import.meta.url),"utf8");
  assert.match(source,/document\.addEventListener\("pointerdown", handlePointerDown\)/);
  assert.match(source,/!toolbarRef\.current\?\.contains\(event\.target as Node\)/);
  assert.match(source,/event\.key === "Escape"/);
  assert.match(source,/closeFilter\(true\)/);
  assert.match(source,/trigger\?\.focus\(\)/);
});

test("price option closes its panel and multi-select options do not",()=>{
  const source=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/InventoryFilters.tsx",import.meta.url),"utf8");
  assert.match(source,/onPriceChange[\s\S]*closeFilter\(true\)/);
  assert.match(source,/onMultiChange\(group, values\)/);
  assert.match(source,/if \(mobile\) closeFilter\(true\)/);
});

const decisionInput=(overrides={})=>({
  batteryHealthPercent:95,
  cycleCount:143,
  cosmeticGrade:"C",
  conditionSummary:"Có vết xước nhẹ ở cạnh trái, không ảnh hưởng sử dụng.",
  includedItems:{charger:true,cable:null,box:null,bag:null,accessories:[]},
  ...overrides,
});

test("decision facts keep both available battery values and omit missing ones",()=>{
  assert.deepEqual(buildDecisionFacts(decisionInput()).slice(0,2),[
    {label:"Pin",value:"95%"},
    {label:"Chu kỳ sạc",value:"143 lần"},
  ]);
  const missing=buildDecisionFacts(decisionInput({batteryHealthPercent:null,cycleCount:null}));
  assert.equal(missing.some(fact=>fact.label==="Pin"||fact.label==="Chu kỳ sạc"),false);
});

test("appearance grade and description are merged into decision facts in order",()=>{
  const facts=buildDecisionFacts(decisionInput());
  assert.deepEqual(facts.map(fact=>fact.label),[
    "Pin","Chu kỳ sạc","Ngoại hình","Phụ kiện đi kèm","Chi tiết ngoại hình",
  ]);
  assert.deepEqual(facts[2],{label:"Ngoại hình",value:"Hạng C"});
  assert.equal(facts[4].wide,true);
  assert.match(facts[4].value,/vết xước nhẹ/);
});

test("meaningless appearance and unavailable inspection placeholders are omitted",()=>{
  const facts=buildDecisionFacts(decisionInput({conditionSummary:"Chưa có dữ liệu."}));
  assert.equal(facts.some(fact=>fact.label==="Chi tiết ngoại hình"),false);
  assert.equal(facts.some(fact=>fact.label==="Kiểm định"),false);
  const decisionSource=readFileSync(new URL("../../app/(sales)/may/[slug]/_components/TrustAndFacts.tsx",import.meta.url),"utf8");
  const passportSource=readFileSync(new URL("../../app/(sales)/may/[slug]/_components/PassportDossier.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(decisionSource,/\["Kiểm định"|Chưa có dữ liệu kiểm định/);
  assert.doesNotMatch(passportSource,/passport\.inspection\.status === "not_available" \? "Chưa có dữ liệu"/);
});

test("standalone appearance section is retired after decision-fact merge",()=>{
  const view=readFileSync(new URL("../../app/(sales)/may/[slug]/_components/PublicMachineDetailView.tsx",import.meta.url),"utf8");
  const condition=readFileSync(new URL("../../app/(sales)/may/[slug]/_components/ConditionAndImages.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(view,/RealCondition/);
  assert.doesNotMatch(condition,/Chi tiết ngoại hình|condition-copy|condition-section/);
});

test("decision facts are one column on mobile and two columns above the tablet breakpoint",()=>{
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  assert.match(css,/\.detail-facts \{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css,/@media \(min-width: 40rem\) \{[\s\S]*?\.detail-facts \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  assert.doesNotMatch(css,/@media \(max-width: 480px\) \{[\s\S]*?\.detail-facts \{ grid-template-columns: 1fr 1fr/);
});

test("decision values wrap by word without character stacking",()=>{
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  const rule=css.match(/\.detail-facts dd \{([^}]*)\}/)?.[1]??"";
  assert.match(rule,/overflow-wrap: break-word/);
  assert.match(rule,/word-break: normal/);
  assert.match(rule,/white-space: normal/);
  assert.doesNotMatch(rule,/break-all|overflow-wrap: anywhere/);
});

test("mobile facet selection replaces the group while desktop retains multi-select toggling",()=>{
  assert.deepEqual(selectFacetValues(["m1","m2"],"intel",true),["intel"]);
  assert.deepEqual(selectFacetValues(["m1"],"m1",true),[]);
  assert.deepEqual(selectFacetValues(["m1"],"m2",false),["m1","m2"]);
  assert.deepEqual(selectFacetValues(["m1","m2"],"m1",false),["m2"]);
});

test("mobile filters use one canonical URL-compatible facet array state",()=>{
  const facets={...emptyInventoryFacets(),chip:selectFacetValues(["m1","m2"],"intel",true)};
  const state={query:"MacBook",sort:"price-asc",facets};
  assert.equal(serializeInventoryUrlState(state),"?q=MacBook&chip=intel&sort=price-asc");
  assert.deepEqual(parseInventoryUrlState(new URLSearchParams("chip=intel&sort=price-asc")).facets.chip,["intel"]);
});

test("mobile filter controls form a two-row three-column grid including sort",()=>{
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  const filters=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/InventoryFilters.tsx",import.meta.url),"utf8");
  assert.match(css,/\.facet-groups \{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(filters,/\["price", "family", "chip", "ram", "screen"\]/);
  assert.match(filters,/mobile-sort-control/);
  assert.match(filters,/Sắp xếp/);
});

test("mobile option selection closes while the shared open-filter state allows only one panel",()=>{
  const source=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/InventoryFilters.tsx",import.meta.url),"utf8");
  assert.match(source,/useState<OpenFilter>\(null\)/);
  assert.match(source,/selectFacetValues\(selected, option\.value, mobile\)[\s\S]*onMultiChange\(group, values\);[\s\S]*if \(mobile\) closeFilter\(true\)/);
  assert.match(source,/openFilter === "sort" \? <fieldset/);
});

test("mobile cards are horizontal with image left and content right while tablet restores vertical cards",()=>{
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  assert.match(css,/\.machine-card-link \{[^}]*flex-direction: row/);
  assert.match(css,/\.machine-image \{[^}]*flex: 0 0 38%/);
  assert.match(css,/@media \(min-width: 40rem\) \{[\s\S]*?\.machine-card-link \{[^}]*flex-direction: column/);
  const card=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/MachineCard.tsx",import.meta.url),"utf8");
  assert.ok(card.indexOf('className="machine-image"')<card.indexOf('className="machine-card-body"'));
});

test("mobile card keeps title specs price condition and CTA without inspection placeholders",()=>{
  const card=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/MachineCard.tsx",import.meta.url),"utf8");
  for(const token of ["<h2>{displayName}</h2>","{specs}","{price}","machine-card-condition","Xem máy"])assert.equal(card.includes(token),true,token);
  assert.doesNotMatch(card,/Kiểm định|machine\.inspection/);
  assert.match(card,/className="machine-code"/);
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  assert.match(css,/\.machine-code, \.machine-card-cta-long \{ display: none; \}/);
});

test("mobile compact condition preserves battery fallback and omits unavailable values",()=>{
  assert.equal(formatMachineCardCondition({batteryHealthPercent:95,cycleCount:506,cosmeticGrade:"C"}),"Pin 95% · Ngoại hình C");
  assert.equal(formatMachineCardCondition({batteryHealthPercent:null,cycleCount:506,cosmeticGrade:"A"}),"Lần sạc 506 · Ngoại hình A");
  assert.equal(formatMachineCardCondition({batteryHealthPercent:null,cycleCount:null,cosmeticGrade:null}),"");
});

test("desktop sort and card grid are restored at existing breakpoints",()=>{
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  assert.match(css,/@media \(min-width: 56rem\) \{[\s\S]*?\.mobile-sort-control \{ display: none; \}[\s\S]*?\.inventory-toolbar label \{ display: flex; \}/);
  assert.match(css,/@media \(min-width: 56rem\) \{[\s\S]*?\.machine-catalog \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
});

test("open filter rotates only the chevron while the readable label stays upright",()=>{
  const filters=readFileSync(new URL("../../app/(sales)/may-dang-co/_components/InventoryFilters.tsx",import.meta.url),"utf8");
  const css=readFileSync(new URL("../../app/globals.css",import.meta.url),"utf8");
  assert.match(filters,/className="facet-trigger-label"/);
  assert.match(filters,/className="facet-trigger-chevron" aria-hidden="true"/);
  assert.match(css,/\.facet-trigger-label \{[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap/);
  assert.match(css,/\.facet-trigger\[aria-expanded="true"\] \.facet-trigger-chevron \{ transform: rotate\(180deg\); \}/);
  assert.doesNotMatch(css,/\.facet-trigger\[aria-expanded="true"\] span \{/);
  assert.doesNotMatch(css,/\.facet-trigger-label \{[^}]*transform/);
});
