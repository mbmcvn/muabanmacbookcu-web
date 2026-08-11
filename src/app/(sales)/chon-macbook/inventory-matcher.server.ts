import "server-only";

import { getAvailableMachines } from "@/data/machines/get-available-machines";
import type { RecommendationProfile } from "./quiz-types";
import { matchPublicInventory, type InventoryMatchResult } from "./inventory-matcher";

export async function matchAvailablePublicInventory(
  profile: RecommendationProfile,
): Promise<InventoryMatchResult> {
  const publicMachines = await getAvailableMachines();
  return matchPublicInventory(profile, publicMachines);
}
