import type {
  PublicConditionRank,
  PublicMachineCard,
  PublicMachineDetail,
  PublicMachineEvent,
  PublicMachineImage,
  PublicRepairSummary,
  MachineConditionGrade,
  MachineDetail,
} from "@/models";

type UnknownRow = Record<string, unknown>;

function isRow(value: unknown): value is UnknownRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function integer(value: unknown): number | null {
  const parsed = number(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function boolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter((item): item is string => item !== null) : [];
}

function conditionRank(value: unknown): PublicConditionRank | null {
  return value === "S" || value === "A" || value === "B" || value === "C" || value === "D" ? value : null;
}

function publicImage(value: unknown, title: string): PublicMachineImage | null {
  if (!isRow(value)) return null;
  const id = text(value.id);
  const url = text(value.public_url);
  if (!id || !url) return null;
  return {
    id,
    url,
    alt: `Ảnh thực tế ${title}`,
    sortOrder: integer(value.sort_order) ?? 0,
    isCover: boolean(value.is_cover) ?? false,
    imageType: text(value.image_type),
    createdAt: text(value.created_at),
  };
}

function publicImages(value: unknown, title: string): PublicMachineImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((image) => publicImage(image, title))
    .filter((image): image is PublicMachineImage => image !== null)
    .toSorted((left, right) => left.sortOrder - right.sortOrder);
}

function availability(status: unknown): "available" | null {
  return status === "new_in_stock" || status === "selling" ? "available" : null;
}

export function adaptPublicMachineCard(value: unknown): PublicMachineCard | null {
  if (!isRow(value)) return null;
  const id = text(value.id);
  const machineId = text(value.machine_id);
  const slug = text(value.public_slug);
  const title = text(value.model_text);
  const price = number(value.public_price);
  const publicAvailability = availability(value.status);
  if (!id || !machineId || !slug || !title || price === null || price <= 0 || !publicAvailability) return null;

  const images = publicImages(value.machine_images, title);
  const coverImage = images.find((image) => image.isCover) ?? null;
  if (!coverImage) return null;

  return {
    id,
    machineId,
    slug,
    title,
    chip: text(value.chip),
    ramGb: integer(value.ram_gb),
    storageGb: integer(value.ssd_gb),
    color: text(value.color),
    price,
    availability: publicAvailability,
    batteryHealth: integer(value.battery_health),
    conditionRank: conditionRank(value.rank),
    warrantyMonths: integer(value.public_warranty_months),
    tag: text(value.public_tag),
    coverImage,
    publishedAt: text(value.published_at),
  };
}

export function adaptPublicMachineEvent(value: unknown): PublicMachineEvent | null {
  if (!isRow(value)) return null;
  const id = text(value.id);
  const eventType = text(value.event_type);
  const title = text(value.title);
  const createdAt = text(value.created_at);
  return id && eventType && title && createdAt ? { id, eventType, title, note: text(value.note), createdAt } : null;
}

export function adaptPublicRepair(value: unknown): PublicRepairSummary | null {
  if (!isRow(value)) return null;
  const id = text(value.id);
  const repairType = text(value.repair_type);
  const createdAt = text(value.created_at);
  return id && repairType && createdAt ? {
    id,
    repairType,
    issueSummary: text(value.issue_summary),
    solution: text(value.solution),
    publicNote: text(value.public_note),
    completedAt: text(value.completed_at),
    createdAt,
  } : null;
}

export function adaptPublicMachineDetail(
  value: unknown,
  events: unknown[],
  repairs: unknown[],
): PublicMachineDetail | null {
  const card = adaptPublicMachineCard(value);
  if (!card || !isRow(value)) return null;
  return {
    ...card,
    cycleCount: integer(value.battery_cycle),
    conditionSummary: text(value.public_condition_note),
    mbmcSummary: text(value.public_summary),
    sourceSummary: text(value.public_source_summary),
    suitableFor: stringArray(value.suitable_for),
    notSuitableFor: stringArray(value.not_suitable_for),
    inspectionStatus: text(value.inspection_status) ?? "passed",
    inspectedAt: text(value.inspected_at),
    inspectionSummary: text(value.inspection_summary),
    chargerIncluded: boolean(value.charger_included),
    images: publicImages(value.machine_images, card.title),
    events: events.map(adaptPublicMachineEvent).filter((event): event is PublicMachineEvent => event !== null),
    repairs: repairs.map(adaptPublicRepair).filter((repair): repair is PublicRepairSummary => repair !== null),
  };
}

function legacyCondition(rank: PublicConditionRank | null): MachineConditionGrade {
  if (rank === "S") return "excellent";
  if (rank === "A") return "very-good";
  if (rank === "B") return "good";
  return "fair";
}

export function adaptPublicDetailForCurrentView(machine: PublicMachineDetail): MachineDetail | null {
  if (machine.chip === null || machine.ramGb === null || machine.storageGb === null) return null;
  const verifiedAt = machine.inspectedAt ?? machine.publishedAt;
  if (!verifiedAt) return null;
  const conditionSummary = machine.conditionSummary
    ?? machine.inspectionSummary
    ?? "Chưa có mô tả tình trạng công khai.";
  const images = machine.images.map((image, position) => ({
    url: image.url,
    alt: image.alt,
    position,
  }));

  return {
    slug: machine.slug,
    publicCode: machine.machineId,
    displayName: machine.title,
    shortName: machine.title,
    color: machine.color ?? "",
    contextualLabel: machine.tag === "Mới nhập" || machine.tag === "Giá tốt" || machine.tag === "Cấu hình cao"
      ? machine.tag
      : undefined,
    price: { amount: machine.price, currency: "VND" },
    availability: machine.availability,
    thumbnail: images[0],
    images,
    decisionSpecifications: {
      chip: machine.chip,
      ramGb: machine.ramGb,
      storageGb: machine.storageGb,
      batteryHealthPercent: machine.batteryHealth ?? undefined,
      cycleCount: machine.cycleCount ?? undefined,
      cosmeticCondition: legacyCondition(machine.conditionRank),
      warrantyMonths: machine.warrantyMonths ?? undefined,
      inspectionResult: "passed",
    },
    conditionSummary,
    updatedAt: machine.publishedAt ?? verifiedAt,
    expertSummary: machine.mbmcSummary ?? conditionSummary,
    technicalSpecifications: {
      groups: [{
        title: "Cấu hình",
        items: [
          { label: "Chip", value: machine.chip },
          { label: "RAM", value: `${machine.ramGb} GB` },
          { label: "SSD", value: `${machine.storageGb} GB` },
          ...(machine.color ? [{ label: "Màu", value: machine.color }] : []),
        ],
      }],
    },
    conditionNotes: machine.conditionSummary
      ? [{ area: "other", summary: machine.conditionSummary }]
      : [],
    includedItems: machine.chargerIncluded === true ? ["Máy", "Sạc"] : ["Máy"],
    passport: {
      identity: { publicReference: machine.machineId, model: machine.title },
      status: { availability: machine.availability, verifiedAt },
      facts: [
        ...(machine.color ? [{ label: "Màu", value: machine.color }] : []),
        ...(machine.sourceSummary ? [{ label: "Nguồn máy", value: machine.sourceSummary }] : []),
      ],
      timeline: machine.events.map((event) => ({
        date: event.createdAt,
        title: event.title,
        description: event.note ?? undefined,
      })),
      inspection: {
        result: "passed",
        items: machine.inspectionSummary
          ? [{ label: "Kiểm định MBMC", result: "passed", note: machine.inspectionSummary }]
          : [],
      },
      sourceVerification: {
        label: machine.sourceSummary ?? "Chưa có tóm tắt nguồn máy công khai",
        verified: machine.sourceSummary !== null,
      },
    },
  };
}
