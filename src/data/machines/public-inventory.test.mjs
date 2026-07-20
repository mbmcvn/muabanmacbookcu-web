import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { projectPublicCandidates, publicDetailBySlug, publicSummaries } from "./project-public-candidates.ts";
import { filterAndSortPublicInventory } from "./public-inventory-query.ts";
import { loadPublicInventoryState } from "./public-inventory-load-state.ts";

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