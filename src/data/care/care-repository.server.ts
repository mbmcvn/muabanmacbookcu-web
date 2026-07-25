import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  activateCarePassportWithStore,
  type CareActivationStore,
} from "./care-activation";
import {
  mapPublicCareEvent,
  normalizeMachineCode,
  PUBLIC_CARE_EVENT_TYPES,
  type PublicCarePassport,
} from "./care-contract";
import type { CareAccessContext } from "./care-session";
import {
  findEffectiveCareOwnership,
  findLatestEffectiveCareSale,
} from "./care-ownership";

const PUBLIC_MACHINE_FIELDS =
  "id, machine_id, status, model_text, chip, ram_gb, ssd_gb, color, public_condition_note";
const PUBLIC_EVENT_FIELDS = "id, event_type, created_at";

export async function getPublicCarePassport(
  rawMachineCode: string,
  access: CareAccessContext,
): Promise<PublicCarePassport | null> {
  const machineCode = normalizeMachineCode(rawMachineCode);
  if (access.machineCode !== machineCode) return null;
  const client = createServerSupabaseClient();
  const { data: machine, error: machineError } = await client
    .from("machines")
    .select(PUBLIC_MACHINE_FIELDS)
    .eq("machine_id", machineCode)
    .maybeSingle();

  if (machineError) {
    logCareError("CARE_MACHINE_QUERY_FAILED", machineError.code);
    throw new Error("Care Passport is temporarily unavailable.");
  }
  if (!machine) return null;

  const { resolution, error: ownershipError } =
    await findEffectiveCareOwnership(client, {
      id: machine.id,
      machineCode: machine.machine_id,
      status: machine.status,
    });
  if (ownershipError) {
    logCareError("CARE_OWNERSHIP_QUERY_FAILED", ownershipError.code);
    throw new Error("Care Passport is temporarily unavailable.");
  }
  const ownership = resolution.ownership;
  if (
    !ownership ||
    ownership.sale.id !== access.saleId ||
    ownership.owner.id !== access.ownershipId
  ) return null;
  const sale = ownership.sale;
  const owner = ownership.owner;

  const { data: eventRows, error: eventsError } = sale
    ? await client
        .from("machine_events")
        .select(PUBLIC_EVENT_FIELDS)
        .eq("machine_id", machine.machine_id)
        .in("event_type", [...PUBLIC_CARE_EVENT_TYPES])
        .eq("visibility", "public")
        .eq("hidden", false)
        .gte("created_at", sale.created_at)
        .order("created_at", { ascending: false })
    : { data: [], error: null };
  if (eventsError) {
    logCareError("CARE_EVENTS_QUERY_FAILED", eventsError.code);
    throw new Error("Care Passport is temporarily unavailable.");
  }

  const events = Object.freeze(
    (eventRows ?? []).flatMap((row) => {
      const event = mapPublicCareEvent(row);
      return event ? [event] : [];
    }),
  );

  return Object.freeze({
    machineCode: machine.machine_id,
    model: machine.model_text,
    configuration: Object.freeze({
      chip: machine.chip,
      ramGb: machine.ram_gb,
      ssdGb: machine.ssd_gb,
    }),
    color: machine.color,
    condition: machine.public_condition_note,
    ownershipState: "activated",
    activatedAt: owner.activated_at,
    events,
  });
}

export async function activateCarePassport(input: {
  machineCode: string;
  customerName: string;
  phone: string;
}) {
  const client = createServerSupabaseClient();
  return activateCarePassportWithStore(
    input,
    createCareActivationStore(client),
  );
}

function createCareActivationStore(
  client: ReturnType<typeof createServerSupabaseClient>,
): CareActivationStore {
  return {
    async findMachine(machineCode) {
      const { data, error } = await client
        .from("machines")
        .select("id, machine_id")
        .eq("machine_id", machineCode)
        .maybeSingle();
      return error
        ? "failed"
        : data
          ? { id: data.id, machineCode: data.machine_id }
          : null;
    },
    async findLatestSale(machineId) {
      const { sale: data, error } = await findLatestEffectiveCareSale(
        client,
        machineId,
      );
      return error
        ? "failed"
        : data
          ? { id: data.id, buyerPhone: data.buyer_phone }
          : null;
    },
    async hasOwner(saleId) {
      const { data, error } = await client
        .from("machine_owners")
        .select("id")
        .eq("sale_id", saleId)
        .maybeSingle();
      return error ? "failed" : Boolean(data);
    },
    async insertOwner(owner) {
      const { error } = await client.from("machine_owners").insert({
        sale_id: owner.saleId,
        machine_id: owner.machineCode,
        customer_name: owner.customerName,
        phone: owner.phone,
      });
      if (error) logCareError("CARE_ACTIVATION_INSERT_FAILED", error.code);
      return !error;
    },
    async insertActivationEvent(machineCode) {
      const { error } = await client.from("machine_events").insert({
        machine_id: machineCode,
        event_type: "activated",
        title: "KÃƒÂ­ch hoÃ¡ÂºÂ¡t bÃ¡ÂºÂ£o hÃƒÂ nh Ã„â€˜iÃ¡Â»â€¡n tÃ¡Â»Â­",
        note: null,
        visibility: "public",
        hidden: false,
      });
      if (error) logCareError("CARE_ACTIVATION_EVENT_FAILED", error.code);
      return !error;
    },
  };
}
export async function submitCareSupport(
  input: {
    machineCode: string;
    title: string;
    description: string;
  },
  access: CareAccessContext,
): Promise<"submitted" | "invalid_input" | "not_activated" | "failed"> {
  const machineCode = normalizeMachineCode(input.machineCode);
  const title = input.title.trim();
  const description = input.description.trim();
  if (
    !title ||
    !description ||
    title.length > 100 ||
    description.length > 2000
  ) {
    return "invalid_input";
  }

  const client = createServerSupabaseClient();
  const { data: machine } = await client
    .from("machines")
    .select("id, machine_id, status")
    .eq("machine_id", machineCode)
    .maybeSingle();
  if (!machine) return "not_activated";
  const { resolution, error: ownershipError } =
    await findEffectiveCareOwnership(client, {
      id: machine.id,
      machineCode: machine.machine_id,
      status: machine.status,
    });
  const ownership = resolution.ownership;
  if (
    ownershipError ||
    !ownership ||
    ownership.sale.id !== access.saleId ||
    ownership.owner.id !== access.ownershipId
  ) return "not_activated";
  const owner = ownership.owner;

  const { error: ticketError } = await client.from("support_tickets").insert({
    machine_id: machineCode,
    owner_phone: owner.phone || null,
    title,
    description,
    status: "open",
  });
  if (ticketError) {
    logCareError("CARE_SUPPORT_INSERT_FAILED", ticketError.code);
    return "failed";
  }
  const { error: eventError } = await client.from("machine_events").insert({
    machine_id: machineCode,
    event_type: "support_ticket",
    title: "Ã„ÂÃƒÂ£ tiÃ¡ÂºÂ¿p nhÃ¡ÂºÂ­n yÃƒÂªu cÃ¡ÂºÂ§u hÃ¡Â»â€” trÃ¡Â»Â£",
    note: null,
    visibility: "public",
    hidden: false,
  });
  if (eventError) logCareError("CARE_SUPPORT_EVENT_FAILED", eventError.code);
  return "submitted";
}

function logCareError(stage: string, code?: string) {
  console.error("[public-care]", { stage, code: code ?? "unknown" });
}
