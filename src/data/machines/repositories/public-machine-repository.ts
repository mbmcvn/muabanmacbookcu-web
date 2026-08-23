import type { PublicMachineDetailV2, PublicMachineSummaryV1 } from "@/models";

export interface PublicMachineRepository {
  list(): Promise<PublicMachineSummaryV1[]>;
  getBySlug(slug: string): Promise<PublicMachineDetailV2 | null>;
}
