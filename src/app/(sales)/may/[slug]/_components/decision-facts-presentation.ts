interface IncludedItemsInput {
  charger: boolean | null;
  cable: boolean | null;
  box: boolean | null;
  bag: boolean | null;
  accessories: string[];
}

export interface DecisionFact {
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

function meaningfulAppearanceDescription(value: string): string | null {
  const description = value.trim();
  return description && !/^(?:chưa|không) có dữ liệu[.!]?$/i.test(description)
    ? description
    : null;
}

export function buildDecisionFacts(input: {
  batteryHealthPercent: number | null;
  cycleCount: number | null;
  cosmeticGrade: string | null;
  conditionSummary: string;
  includedItems: IncludedItemsInput;
}): DecisionFact[] {
  const accessories = formatIncludedItems(input.includedItems);
  const appearance = meaningfulAppearanceDescription(input.conditionSummary);
  return [
    input.batteryHealthPercent === null ? null : { label: "Pin", value: `${input.batteryHealthPercent}%` },
    input.cycleCount === null ? null : { label: "Chu kỳ sạc", value: `${input.cycleCount} lần` },
    input.cosmeticGrade === null ? null : { label: "Ngoại hình", value: `Hạng ${input.cosmeticGrade}` },
    accessories === null ? null : { label: "Phụ kiện đi kèm", value: accessories, wide: true },
    appearance === null ? null : { label: "Chi tiết ngoại hình", value: appearance, wide: true },
  ].filter((fact): fact is DecisionFact => fact !== null);
}
