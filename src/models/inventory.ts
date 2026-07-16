import type {
  MachineAvailability,
  MachineConditionGrade,
  MachinePreview,
} from "./machine";

export interface InventoryQuery {
  chip?: string[];
  ramGb?: number[];
  storageGb?: number[];
  condition?: MachineConditionGrade[];
  availability?: MachineAvailability[];
  sort?: "newest" | "price-asc" | "price-desc";
}

export interface InventoryResult {
  items: MachinePreview[];
  total: number;
  appliedQuery: InventoryQuery;
}
