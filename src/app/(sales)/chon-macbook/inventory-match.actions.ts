"use server";

import { matchAvailablePublicInventory } from "./inventory-matcher.server";
import { presentInventoryMatches, type InventoryMatchViewState } from "./inventory-match-presentation";
import type { RecommendationProfile } from "./quiz-types";

export async function loadInventoryMatches(
  profile: RecommendationProfile,
): Promise<InventoryMatchViewState> {
  try {
    const result = await matchAvailablePublicInventory(profile);
    return presentInventoryMatches(profile, result);
  } catch {
    return { status: "failed" };
  }
}
