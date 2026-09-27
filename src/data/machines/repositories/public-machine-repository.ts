import type { PublicMachineDetailV3, PublicMachineSummaryV2 } from "@/models";

export type PublicInventoryMachine = PublicMachineSummaryV2 & {
  modelSpecKey: string | null;
};

export interface PublicMachineRepository {
  list(): Promise<PublicInventoryMachine[]>;
  getBySlug(slug: string): Promise<PublicMachineDetailV3 | null>;
}
