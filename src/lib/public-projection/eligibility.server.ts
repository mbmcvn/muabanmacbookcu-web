import type {
  NormalizedPublicMachineFacts,
  PublicProjectionKernel,
} from "./kernel.server.ts";

const INTERNAL_UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export type ProjectionDenialReason =
  | "publication_not_published"
  | "invalid_slug"
  | "publication_audit_incomplete"
  | "editorial_revision_mismatch"
  | "machine_status_ineligible"
  | "invalid_retail_price"
  | "invalid_public_cover"
  | "missing_condition_summary"
  | "editorial_review_incomplete"
  | "configuration_incomplete"
  | "privacy_invalid";

export type EligibilityResult =
  | { eligible: false; reasons: ProjectionDenialReason[] }
  | { eligible: true; kernel: PublicProjectionKernel };

function isNonBlank(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSafeSlug(slug: string): boolean {
  return (
    SLUG_PATTERN.test(slug) &&
    slug === slug.toLowerCase() &&
    !INTERNAL_UUID_PATTERN.test(slug)
  );
}

export function validatePublicMachineEligibility(
  facts: NormalizedPublicMachineFacts,
): EligibilityResult {
  const reasons: ProjectionDenialReason[] = [];
  const publication = facts.publication;
  const editorial = facts.editorial;
  const covers = facts.images.filter((image) => image.isCover);

  if (!publication || publication.status !== "published") {
    reasons.push("publication_not_published");
  }
  if (!publication?.slug || !isSafeSlug(publication.slug)) {
    reasons.push("invalid_slug");
  }
  if (
    !publication?.approvedBy ||
    !publication.approvedAt ||
    !publication.publishedBy ||
    !publication.publishedAt
  ) {
    reasons.push("publication_audit_incomplete");
  }
  if (
    !editorial ||
    publication?.approvedEditorialRevision !== editorial.revision ||
    publication?.publishedEditorialRevision !== editorial.revision
  ) {
    reasons.push("editorial_revision_mismatch");
  }
  if (facts.machineStatus !== "new_in_stock") {
    reasons.push("machine_status_ineligible");
  }
  if (
    !Number.isSafeInteger(facts.retailPriceExpected) ||
    (facts.retailPriceExpected ?? 0) <= 0
  ) {
    reasons.push("invalid_retail_price");
  }
  if (covers.length !== 1) reasons.push("invalid_public_cover");
  if (!isNonBlank(editorial?.publicConditionSummary)) {
    reasons.push("missing_condition_summary");
  }
  if (!editorial?.reviewedBy || !editorial.reviewedAt) {
    reasons.push("editorial_review_incomplete");
  }
  if (
    !isNonBlank(facts.code) ||
    !isNonBlank(facts.displayName) ||
    !isNonBlank(facts.chip) ||
    !Number.isSafeInteger(facts.ramGb) ||
    (facts.ramGb ?? 0) <= 0 ||
    !Number.isSafeInteger(facts.ssdGb) ||
    (facts.ssdGb ?? 0) <= 0 ||
    !isNonBlank(facts.color)
  ) {
    reasons.push("configuration_incomplete");
  }

  if (reasons.length > 0) return { eligible: false, reasons };

  return {
    eligible: true,
    kernel: {
      code: facts.code!.trim(),
      slug: publication!.slug!,
      displayName: facts.displayName!.trim(),
      family: facts.family,
      year: facts.year,
      screenSizeInches: facts.screenSizeInches,
      chip: facts.chip!.trim(),
      ramGb: facts.ramGb!,
      ssdGb: facts.ssdGb!,
      color: facts.color!.trim(),
      priceAmount: facts.retailPriceExpected!,
      availability: "available",
      images: facts.images.map((image) => ({
        url: image.url,
        alt: image.alt,
        width: image.width,
        height: image.height,
      })),
      coverIndex: facts.images.indexOf(covers[0]),
      batteryHealthPercent: facts.batteryHealthPercent,
      cycleCount: facts.cycleCount,
      cosmeticGrade: facts.cosmeticGrade,
      conditionSummary: editorial!.publicConditionSummary!.trim(),
      contextualLabel: editorial!.contextualLabel?.trim() || null,
      expertSummary: editorial!.expertSummary?.trim() || null,
      suitableFor: [...(editorial!.suitableFor ?? [])],
      notSuitableFor: [...(editorial!.notSuitableFor ?? [])],
      includedItems: editorial!.includedItems
        ? {
            charger: editorial!.includedItems.charger,
            cable: editorial!.includedItems.cable,
            box: editorial!.includedItems.box,
            bag: editorial!.includedItems.bag,
            accessories: [...editorial!.includedItems.accessories],
          }
        : {
            charger: null,
            cable: null,
            box: null,
            bag: null,
            accessories: [],
          },
      policyApplicability: [...(editorial!.policyApplicability ?? [])],
      firstPublishedAt: publication!.firstPublishedAt ?? null,
      publishedAt: publication!.publishedAt!,
      updatedAt: publication!.updatedAt ?? null,
    },
  };
}
