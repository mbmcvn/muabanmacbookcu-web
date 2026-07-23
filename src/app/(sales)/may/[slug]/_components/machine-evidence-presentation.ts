interface IncludedItemsInput {
  charger: boolean | null;
  cable: boolean | null;
  box: boolean | null;
  bag: boolean | null;
  accessories: string[];
}

export interface MachineEvidence {
  label: string;
  value: string;
  wide?: boolean;
}

function formatIncludedItems(items: IncludedItemsInput): string | null {
  const known = [
    items.charger === true ? "Sạc" : null,
    items.cable === true ? "Cáp" : null,
    items.box === true ? "Hộp" : null,
    items.bag === true ? "Túi chống sốc" : null,
    ...items.accessories,
  ].filter((item): item is string => item !== null);
  if (known.length) return known.join(", ");
  const hasPublicInformation = [items.charger, items.cable, items.box, items.bag]
    .some((item) => item !== null);
  return hasPublicInformation ? "Không kèm phụ kiện" : null;
}

export function publicConditionDescription(
  value: string,
  includedItems: IncludedItemsInput,
): string | null {
  let description = value.trim();
  if (includedItems.box !== true) {
    description = description
      .replace(/\b(?:máy\s+)?full\s*box\b/giu, "")
      .replace(/^[\s,.;:–—-]+|[\s,.;:–—-]+$/g, "")
      .trim();
  }
  return description && !/^(?:chưa|không) có dữ liệu[.!]?$/i.test(description)
    ? description
    : null;
}

export function buildMachineEvidence(input: {
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  cosmeticGrade: string | null;
  conditionSummary: string;
  includedItems: IncludedItemsInput;
}): MachineEvidence[] {
  const accessories = formatIncludedItems(input.includedItems);
  const condition = publicConditionDescription(
    input.conditionSummary,
    input.includedItems,
  );
  return [
    input.batteryHealthPercent === null ? null : { label: "Pin", value: `${input.batteryHealthPercent}%` },
    input.cycleCount === null ? null : { label: "Chu kỳ sạc", value: `${input.cycleCount} lần` },
    input.cosmeticGrade === null ? null : { label: "Ngoại hình", value: `Hạng ${input.cosmeticGrade}` },
    accessories === null ? null : { label: "Phụ kiện đi kèm", value: accessories, wide: true },
    condition === null ? null : { label: "Mô tả tình trạng công khai", value: condition, wide: true },
  ].filter((item): item is MachineEvidence => item !== null);
}
