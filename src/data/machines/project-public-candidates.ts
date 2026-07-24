import {
  projectPublicMachineV1,
  type PublicMachineProjectionV1Result,
} from "../../lib/public-projection/project-machine.server.ts";
import type {
  PublicImageInput,
  PublicMachineProjectionInput,
} from "../../lib/public-projection/kernel.server.ts";
import type { ProjectionDenialReason } from "../../lib/public-projection/eligibility.server.ts";
import type {
  PublicMachineDetailV1,
  PublicMachineSummaryV1,
} from "../../lib/public-projection/contracts.ts";

type UnknownRow = Record<string, unknown>;
const isRow = (value: unknown): value is UnknownRow => typeof value === "object" && value !== null && !Array.isArray(value);
function oneRow(value: unknown): UnknownRow | null { if (isRow(value)) return value; if (Array.isArray(value) && value.length === 1 && isRow(value[0])) return value[0]; return null; }
function text(value: unknown): string | null { return typeof value === "string" && value.trim() ? value.trim() : null; }
function integer(value: unknown): number | null { return typeof value === "number" && Number.isSafeInteger(value) ? value : null; }
function stringArray(value: unknown): string[] { return Array.isArray(value) ? value.map(text).filter((item): item is string => item !== null) : []; }
function includedItems(value: unknown) { const row=isRow(value)?value:{}; return { charger:typeof row.charger==="boolean"?row.charger:null, cable:typeof row.cable==="boolean"?row.cable:null, box:typeof row.box==="boolean"?row.box:null, bag:typeof row.bag==="boolean"?row.bag:null, accessories:stringArray(row.accessories) }; }
function family(model: string | null): "Air" | "Pro" | "Unknown" { if (/macbook\s+air/i.test(model??"")) return "Air"; if (/macbook\s+pro/i.test(model??"")) return "Pro"; return "Unknown"; }
function reservations(value: unknown): ("manual"|"deposit")[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRow(item) || text(item.lifecycle_status) !== "reserved") return [];
    const kind = text(item.reservation_kind);
    return kind === "manual" || kind === "deposit" ? [kind] : [];
  });
}
function reservationStateInvalid(value: unknown): boolean {
  if (!Array.isArray(value)) return value !== undefined && value !== null;
  return value.some((item) => {
    if (!isRow(item) || text(item.lifecycle_status) !== "reserved") return false;
    return !["manual", "deposit"].includes(text(item.reservation_kind) ?? "");
  });
}

function publicImages(value: unknown): PublicImageInput[] {
  if (!Array.isArray(value)) return [];
  const byUrl=new Map<string,PublicImageInput>();
  for(const item of value){
    if(!isRow(item)) continue;
    const id=text(item.id),url=text(item.public_url); if(!id||!url) continue;
    const next:PublicImageInput={id,visibility:text(item.visibility)??"",imageType:text(item.image_type)??"",imageStage:text(item.image_stage)??"",publicUrl:url,sortOrder:integer(item.sort_order)??0,isCover:item.is_cover===true};
    const existing=byUrl.get(url); if(!existing||(next.isCover&&!existing.isCover)) byUrl.set(url,next);
  }
  return [...byUrl.values()].toSorted((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)||a.id.localeCompare(b.id));
}

export function normalizePublicCandidate(value: unknown): PublicMachineProjectionInput | null {
  if(!isRow(value)) return null;
  const publication=oneRow(value.machine_publications),editorial=oneRow(value.machine_editorials),model=text(value.model_text);
  return {
    code:text(value.machine_id),status:value.deleted_at===null?(text(value.status)??"unknown"):"deleted",displayName:model,family:family(model),chip:text(value.chip),ramGb:integer(value.ram_gb),ssdGb:integer(value.ssd_gb),color:text(value.color),retailPriceExpected:integer(value.retail_price_expected),batteryHealthPercent:integer(value.battery_health),cycleCount:integer(value.battery_cycle),cosmeticGrade:text(value.rank),reservations:reservations(value.sales),reservationStateInvalid:reservationStateInvalid(value.sales),
    publication:publication?{status:text(publication.status) as "draft"|"approved"|"published"|"archived",slug:text(publication.slug),revision:integer(publication.revision)??0,approvedBy:text(publication.approved_by),approvedAt:text(publication.approved_at),approvedEditorialRevision:integer(publication.approved_editorial_revision),publishedBy:text(publication.published_by),firstPublishedAt:text(publication.first_published_at),publishedAt:text(publication.published_at),publishedEditorialRevision:integer(publication.published_editorial_revision),updatedAt:text(publication.updated_at)}:null,
    editorial:editorial?{revision:integer(editorial.revision)??0,publicConditionSummary:text(editorial.public_condition_summary),expertSummary:text(editorial.expert_summary),suitableFor:stringArray(editorial.suitable_for),notSuitableFor:stringArray(editorial.not_suitable_for),contextualLabel:text(editorial.contextual_label),includedItems:includedItems(editorial.included_items),policyApplicability:stringArray(editorial.policy_applicability),reviewedBy:text(editorial.reviewed_by),reviewedAt:text(editorial.reviewed_at)}:null,
    images:publicImages(value.machine_images),privacyValid:true,
  };
}

export type PublicCandidateDiagnostic = {
  stage:
    | "CANDIDATE_NORMALIZATION_FAILED"
    | "PRIVACY_REJECTED"
    | "ELIGIBILITY_REJECTED"
    | "DTO_ASSEMBLY_FAILED";
  code: string;
  machineCode?: string;
  exclusionReason?: string;
  validationIssue: string;
  validationPath: string;
  message: string;
};

const ELIGIBILITY_DIAGNOSTICS: Record<
  ProjectionDenialReason,
  Pick<PublicCandidateDiagnostic, "validationPath" | "message">
> = {
  publication_not_published: { validationPath: "publication.status", message: "Publication is not published." },
  invalid_slug: { validationPath: "publication.slug", message: "Publication slug is missing or invalid." },
  publication_audit_incomplete: { validationPath: "publication.audit", message: "Publication approval or publishing audit is incomplete." },
  editorial_revision_mismatch: { validationPath: "publication.editorialRevision", message: "Published editorial revision does not match the current editorial." },
  machine_status_ineligible: { validationPath: "machine.status", message: "Machine status is not eligible for public inventory." },
  reservation_state_invalid: { validationPath: "sales.reservation", message: "Machine has an invalid public reservation state." },
  invalid_retail_price: { validationPath: "machine.retailPriceExpected", message: "Retail price is missing or invalid." },
  invalid_public_cover: { validationPath: "machine.images.cover", message: "Exactly one valid public cover image is required." },
  missing_condition_summary: { validationPath: "editorial.publicConditionSummary", message: "Public condition summary is missing." },
  editorial_review_incomplete: { validationPath: "editorial.review", message: "Editorial review audit is incomplete." },
  configuration_incomplete: { validationPath: "machine.configuration", message: "Required public machine configuration is incomplete." },
  privacy_invalid: { validationPath: "candidate.privacy", message: "Candidate failed the public privacy boundary." },
};

function safeMachineCode(value: unknown): string | undefined {
  if (!isRow(value)) return undefined;
  let code: string | null;
  try {
    code = text(value.machine_id);
  } catch {
    return undefined;
  }
  return code && /^MBMC-[A-Z0-9]+$/.test(code) ? code : undefined;
}

export function projectPublicCandidates(
  values: unknown[],
  onDiagnostic: (diagnostic: PublicCandidateDiagnostic) => void = () => {},
): PublicMachineProjectionV1Result[] {
  const projected: PublicMachineProjectionV1Result[] = [];
  for (const value of values) {
    const machineCode = safeMachineCode(value);
    let candidate: PublicMachineProjectionInput | null;
    try {
      candidate = normalizePublicCandidate(value);
    } catch {
      onDiagnostic({
        stage: "CANDIDATE_NORMALIZATION_FAILED",
        code: "candidate_invalid",
        ...(machineCode ? { machineCode } : {}),
        validationIssue: "candidate_invalid",
        validationPath: "candidate",
        message: "Candidate could not be normalized for public projection.",
      });
      continue;
    }
    if (!candidate) {
      onDiagnostic({
        stage: "CANDIDATE_NORMALIZATION_FAILED",
        code: "candidate_invalid",
        ...(machineCode ? { machineCode } : {}),
        validationIssue: "candidate_invalid",
        validationPath: "candidate",
        message: "Candidate could not be normalized for public projection.",
      });
      continue;
    }

    try {
      const result = projectPublicMachineV1(candidate);
      projected.push(result);
      if (!result.eligible) {
        for (const exclusionReason of result.reasons) {
          const detail = ELIGIBILITY_DIAGNOSTICS[exclusionReason];
          onDiagnostic({
            stage:
              exclusionReason === "privacy_invalid"
                ? "PRIVACY_REJECTED"
                : "ELIGIBILITY_REJECTED",
            code: "candidate_excluded",
            ...(machineCode ? { machineCode } : {}),
            exclusionReason,
            validationIssue: exclusionReason,
            validationPath: detail.validationPath,
            message: detail.message,
          });
        }
      }
    } catch {
      onDiagnostic({
        stage: "DTO_ASSEMBLY_FAILED",
        code: "projection_failed",
        ...(machineCode ? { machineCode } : {}),
        validationIssue: "projection_failed",
        validationPath: "candidate",
        message: "Candidate could not be assembled into the public DTO.",
      });
    }
  }
  return projected;
}

export function publicSummaries(values: unknown[]): PublicMachineSummaryV1[] {
  return projectPublicCandidates(values).filter(result=>result.eligible).map(result=>result.summary).toSorted((a,b)=>Date.parse(b.publishedAt??"")-Date.parse(a.publishedAt??"")||a.slug.localeCompare(b.slug));
}

export function publicDetailBySlug(values: unknown[], slug: string): PublicMachineDetailV1|null {
  for(const result of projectPublicCandidates(values)){if(result.eligible&&result.detail.summary.slug===slug)return result.detail;}
  return null;
}
