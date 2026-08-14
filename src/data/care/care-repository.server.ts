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
  findCareLifecycle,
  findEffectiveCareOwnership,
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
  )
    return null;
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
  origin: string;
}) {
  const client = createServerSupabaseClient();
  return activateCarePassportWithStore(
    input,
    createCareActivationStore(client),
  );
}

export type PublicCareState =
  | Readonly<{ state: "not_found"; machineCode: string }>
  | Readonly<{ state: "care_unavailable"; machineCode: string }>
  | Readonly<{ state: "activation_required"; machineCode: string }>
  | Readonly<{ state: "activated"; machineCode: string }>
  | Readonly<{ state: "unsafe"; machineCode: string; reasonCode: string }>;

export async function resolvePublicCareState(
  rawMachineCode: string,
): Promise<PublicCareState> {
  const machineCode = normalizeMachineCode(rawMachineCode);
  const client = createServerSupabaseClient();
  const { data: machine, error } = await client
    .from("machines")
    .select("id, machine_id, status")
    .eq("machine_id", machineCode)
    .maybeSingle();
  if (error) {
    return {
      state: "unsafe",
      machineCode,
      reasonCode: "CARE_ACTIVATION_AMBIGUOUS",
    };
  }
  if (!machine) return { state: "not_found", machineCode };
  const lifecycle = await findCareLifecycle(client, {
    id: machine.id,
    machineCode: machine.machine_id,
    status: machine.status,
  });
  if (lifecycle.error || lifecycle.resolution.state === "unsafe") {
    return {
      state: "unsafe",
      machineCode: machine.machine_id,
      reasonCode:
        lifecycle.resolution.reasonCode ?? "CARE_ACTIVATION_AMBIGUOUS",
    };
  }
  return { state: lifecycle.resolution.state, machineCode: machine.machine_id };
}

function createCareActivationStore(
  client: ReturnType<typeof createServerSupabaseClient>,
): CareActivationStore {
  return {
    async consumeAttempt(keyHash) {
      const { data, error } = await client.rpc(
        "consume_public_care_verification_attempt",
        { p_key_hash: keyHash, p_limit: 10, p_window_seconds: 900 },
      );
      return !error && data === true;
    },
    async resolve(machineCode) {
      const { data, error } = await client
        .from("machines")
        .select("id, machine_id, status")
        .eq("machine_id", machineCode)
        .maybeSingle();
      if (error)
        return { state: "unsafe", reasonCode: "CARE_ACTIVATION_AMBIGUOUS" };
      if (!data)
        return { state: "unsafe", reasonCode: "CARE_MACHINE_NOT_FOUND" };
      const { resolution, error: lifecycleError } = await findCareLifecycle(
        client,
        {
          id: data.id,
          machineCode: data.machine_id,
          status: data.status,
        },
      );
      if (lifecycleError || resolution.state === "unsafe") {
        return {
          state: "unsafe",
          reasonCode: resolution.reasonCode ?? "CARE_ACTIVATION_AMBIGUOUS",
        };
      }
      if (resolution.state === "care_unavailable") {
        return {
          state: "unsafe",
          reasonCode: "CARE_NO_ELIGIBLE_SALE",
        };
      }
      if (resolution.state === "activated") {
        return {
          state: "activated",
          access: {
            machineCode: data.machine_id,
            saleId: resolution.sale.id,
            ownershipId: resolution.ownership.owner.id,
          },
        };
      }
      return {
        state: "activation_required",
        machine: { id: data.id, machineCode: data.machine_id },
        sale: {
          id: resolution.sale.id,
          buyerPhone: resolution.sale.buyer_phone,
        },
      };
    },
    async findOwnerAccess(saleId) {
      const { data, error } = await client
        .from("machine_owners")
        .select("id, machine_id, sale_id, activated_at")
        .eq("sale_id", saleId)
        .maybeSingle();
      return error || !data || !data.sale_id || !data.activated_at
        ? null
        : {
            machineCode: data.machine_id,
            saleId: data.sale_id,
            ownershipId: data.id,
          };
    },
    async insertOwner(owner) {
      const { data, error } = await client
        .from("machine_owners")
        .insert({
          sale_id: owner.saleId,
          machine_id: owner.machineCode,
          customer_name: owner.customerName,
          phone: owner.phone,
          activated_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) logCareError("CARE_ACTIVATION_INSERT_FAILED", error.code);
      return error ? null : data.id;
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
  )
    return "not_activated";
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
