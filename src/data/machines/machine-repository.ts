import type { InventoryQuery, InventoryResult, MachineDetail } from "@/models";

export interface MachineRepository {
  findAvailable(query?: InventoryQuery): Promise<InventoryResult>;
  findPublishedBySlug(slug: string): Promise<MachineDetail | null>;
}
