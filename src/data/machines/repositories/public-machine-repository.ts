import type {
  PublicMachineDetailV1,
  PublicMachineSummaryV1,
} from "@/models";

export interface PublicMachineRepository {
  list(): Promise<PublicMachineSummaryV1[]>;
  getBySlug(slug: string): Promise<PublicMachineDetailV1 | null>;
}