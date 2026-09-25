import type { PublicMachineDetailV3, PublicMachineSummaryV2 } from "@/models";

export interface PublicMachineRepository {
  list(): Promise<PublicMachineSummaryV2[]>;
  getBySlug(slug: string): Promise<PublicMachineDetailV3 | null>;
}
