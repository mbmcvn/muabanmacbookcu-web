import type { PublicMachineCard, PublicMachineDetail } from "@/models";

export interface PublicMachineRepository {
  list(): Promise<PublicMachineCard[]>;
  getBySlug(slug: string): Promise<PublicMachineDetail | null>;
}
