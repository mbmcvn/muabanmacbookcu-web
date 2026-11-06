import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCareMachinePresentation } from "./care-machine-presentation.server";

// Anonymous identity uses only the canonical public availability projection.
// No ownership, customer, warranty or handover rows cross this boundary.
export async function getCurrentMachinePassport(machineCode: string) {
  const client = createServerSupabaseClient();
  const [presentation, machine, result] = await Promise.all([
    getCareMachinePresentation(machineCode),
    client
      .from("machines")
      .select("status,deleted_at")
      .eq("machine_id", machineCode)
      .maybeSingle(),
    client.rpc("get_public_machine_availability_v1"),
  ]);
  if (machine.error)
    throw new Error("Machine Passport is temporarily unavailable.");
  if (
    !presentation ||
    machine.data?.status !== "new_in_stock" ||
    machine.data.deleted_at !== null
  )
    return null;
  const rows = (Array.isArray(result.data) ? result.data : []).filter(
    (row) => row.machine_public_identifier === machineCode,
  );
  return {
    machineCode,
    displayName: presentation.displayName,
    image: presentation.image,
    availability: (!result.error &&
    rows.length === 1 &&
    rows[0].state_valid === true &&
    ["available", "reserved"].includes(rows[0].availability)
      ? rows[0].availability
      : "unavailable") as "available" | "reserved" | "unavailable",
  };
}
