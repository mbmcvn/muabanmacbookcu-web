import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export type CareOwnershipReason =
  | "CARE_NO_EFFECTIVE_OWNERSHIP"
  | "CARE_LEGACY_OWNERSHIP_UNSUPPORTED"
  | "CARE_AMBIGUOUS_OWNERSHIP";
export type CareSale = Readonly<{ id: string; machine_id: string; buyer_phone: string | null; lifecycle_status: string; payment_status: string | null; handover_status: string | null; created_at: string; completed_at: string | null; sold_at: string | null }>;
export type CareOwner = Readonly<{ id: string; machine_id: string; sale_id: string | null; phone: string | null; activated_at: string | null; created_at: string }>;
export type EffectiveCareOwnership = Readonly<{ owner: CareOwner; sale: CareSale; compatibility: "modern" | "legacy_linked" | "legacy_unlinked" }>;
export type CareOwnershipResolution = Readonly<
  | { ownership: EffectiveCareOwnership; reasonCode: null }
  | { ownership: null; reasonCode: CareOwnershipReason }
>;

function effectiveSaleTime(sale: CareSale) {
  return sale.completed_at ?? sale.sold_at ?? sale.created_at;
}
function newestSales(sales: readonly CareSale[]) {
  return [...sales].sort((a, b) => effectiveSaleTime(b).localeCompare(effectiveSaleTime(a)) || b.id.localeCompare(a.id));
}
function isLegacyFulfilledSale(sale: CareSale) {
  return (sale.lifecycle_status === "draft" || sale.lifecycle_status === "reserved") &&
    (sale.handover_status === "handed_over" || sale.handover_status === "delivered");
}

export function resolveEffectiveCareOwnership(input: { machineId: string; machineCode: string; machineStatus: string | null; owners: readonly CareOwner[]; sales: readonly CareSale[] }): CareOwnershipResolution {
  const owners = input.owners.filter((owner) => owner.machine_id === input.machineCode && Boolean(owner.activated_at));
  const sales = input.sales.filter((sale) => sale.machine_id === input.machineId);
  if (!owners.length) return { ownership: null, reasonCode: "CARE_NO_EFFECTIVE_OWNERSHIP" };

  const completed = newestSales(sales.filter((sale) => sale.lifecycle_status === "completed"));
  if (completed.length) {
    const currentSale = completed[0];
    const exact = owners.filter((owner) => owner.sale_id === currentSale.id);
    if (exact.length === 1) return { ownership: { owner: exact[0], sale: currentSale, compatibility: "modern" }, reasonCode: null };
    if (exact.length > 1) return { ownership: null, reasonCode: "CARE_AMBIGUOUS_OWNERSHIP" };
    const unlinked = owners.filter((owner) => owner.sale_id === null);
    if (owners.length === 1 && unlinked.length === 1 && sales.length === 1) {
      return { ownership: { owner: unlinked[0], sale: currentSale, compatibility: "legacy_unlinked" }, reasonCode: null };
    }
    return { ownership: null, reasonCode: "CARE_NO_EFFECTIVE_OWNERSHIP" };
  }

  if (input.machineStatus !== "sold") return { ownership: null, reasonCode: "CARE_LEGACY_OWNERSHIP_UNSUPPORTED" };
  if (owners.length !== 1) return { ownership: null, reasonCode: "CARE_AMBIGUOUS_OWNERSHIP" };
  const owner = owners[0];
  if (owner.sale_id) {
    const linked = sales.filter((sale) => sale.id === owner.sale_id);
    return linked.length === 1 && isLegacyFulfilledSale(linked[0])
      ? { ownership: { owner, sale: linked[0], compatibility: "legacy_linked" }, reasonCode: null }
      : { ownership: null, reasonCode: "CARE_LEGACY_OWNERSHIP_UNSUPPORTED" };
  }
  const compatibleSales = sales.filter(isLegacyFulfilledSale);
  return sales.length === 1 && compatibleSales.length === 1
    ? { ownership: { owner, sale: compatibleSales[0], compatibility: "legacy_unlinked" }, reasonCode: null }
    : { ownership: null, reasonCode: "CARE_LEGACY_OWNERSHIP_UNSUPPORTED" };
}

export async function findEffectiveCareOwnership(client: SupabaseClient, machine: Readonly<{ id: string; machineCode: string; status: string | null }>): Promise<{ resolution: CareOwnershipResolution; error: PostgrestError | null }> {
  const [ownersResult, salesResult] = await Promise.all([
    client.from("machine_owners").select("id, machine_id, sale_id, phone, activated_at, created_at").eq("machine_id", machine.machineCode).order("created_at", { ascending: false }),
    client.from("sales").select("id, machine_id, buyer_phone, lifecycle_status, payment_status, handover_status, created_at, completed_at, sold_at").eq("machine_id", machine.id),
  ]);
  const error = ownersResult.error ?? salesResult.error;
  if (error) return { resolution: { ownership: null, reasonCode: "CARE_NO_EFFECTIVE_OWNERSHIP" }, error };
  return { resolution: resolveEffectiveCareOwnership({ machineId: machine.id, machineCode: machine.machineCode, machineStatus: machine.status, owners: (ownersResult.data ?? []) as CareOwner[], sales: (salesResult.data ?? []) as CareSale[] }), error: null };
}

export async function findLatestEffectiveCareSale(client: SupabaseClient, machineId: string): Promise<{ sale: CareSale | null; error: PostgrestError | null }> {
  const { data, error } = await client.from("sales").select("id, machine_id, buyer_phone, lifecycle_status, payment_status, handover_status, created_at, completed_at, sold_at").eq("machine_id", machineId).eq("lifecycle_status", "completed").order("completed_at", { ascending: false, nullsFirst: false }).order("sold_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(1).maybeSingle();
  return { sale: data as CareSale | null, error };
}
