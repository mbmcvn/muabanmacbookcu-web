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

const PUBLIC_MACHINE_FIELDS =
  "id, machine_id, model_text, chip, ram_gb, ssd_gb, color, public_condition_note";
const SALE_CONTEXT_FIELDS = "id, created_at";
const ACTIVATION_FIELDS = "id, activated_at";
const PUBLIC_EVENT_FIELDS = "id, event_type, created_at";

export async function getPublicCarePassport(
  rawMachineCode: string,
): Promise<PublicCarePassport | null> {
  const machineCode = normalizeMachineCode(rawMachineCode);
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

  const { data: sale, error: saleError } = await client
    .from("sales")
    .select(SALE_CONTEXT_FIELDS)
    .eq("machine_id", machine.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (saleError) {
    logCareError("CARE_SALE_QUERY_FAILED", saleError.code);
    throw new Error("Care Passport is temporarily unavailable.");
  }

  const { data: owner, error: ownerError } = sale
    ? await client
        .from("machine_owners")
        .select(ACTIVATION_FIELDS)
        .eq("sale_id", sale.id)
        .maybeSingle()
    : { data: null, error: null };
  if (ownerError) {
    logCareError("CARE_ACTIVATION_QUERY_FAILED", ownerError.code);
    throw new Error("Care Passport is temporarily unavailable.");
  }

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
    ownershipState: owner ? "activated" : sale ? "awaiting_activation" : "not_sold",
    activatedAt: owner?.activated_at ?? null,
    events,
  });
}

export async function activateCarePassport(input: {
  machineCode: string;
  customerName: string;
  phone: string;
}) {
  const client = createServerSupabaseClient();
  return activateCarePassportWithStore(input, createCareActivationStore(client));
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
      return error ? "failed" : data ? { id: data.id, machineCode: data.machine_id } : null;
    },
    async findLatestSale(machineId) {
      const { data, error } = await client
        .from("sales")
        .select("id, buyer_phone")
        .eq("machine_id", machineId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return error ? "failed" : data ? { id: data.id, buyerPhone: data.buyer_phone } : null;
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
        title: "Kích hoạt bảo hành điện tử",
        note: null,
        visibility: "public",
        hidden: false,
      });
      if (error) logCareError("CARE_ACTIVATION_EVENT_FAILED", error.code);
      return !error;
    },
  };
}
export async function submitCareSupport(input: {
  machineCode: string;
  title: string;
  description: string;
}): Promise<"submitted" | "invalid_input" | "not_activated" | "failed"> {
  const machineCode = normalizeMachineCode(input.machineCode);
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description || title.length > 100 || description.length > 2000) {
    return "invalid_input";
  }

  const client = createServerSupabaseClient();
  const { data: machine } = await client.from("machines").select("id").eq("machine_id", machineCode).maybeSingle();
  if (!machine) return "not_activated";
  const { data: sale } = await client.from("sales").select("id").eq("machine_id", machine.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!sale) return "not_activated";
  const { data: owner } = await client.from("machine_owners").select("phone").eq("sale_id", sale.id).maybeSingle();
  if (!owner) return "not_activated";

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
    title: "Đã tiếp nhận yêu cầu hỗ trợ",
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
