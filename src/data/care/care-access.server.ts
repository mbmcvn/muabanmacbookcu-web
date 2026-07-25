import "server-only";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  type CareAccessStore,
  careContextMatches,
  careAttemptKey,
} from "./care-access";
import {
  CARE_SESSION_COOKIE,
  parseCareSession,
  type CareAccessContext,
} from "./care-session";
import { normalizeMachineCode } from "./care-contract";
import { findEffectiveCareOwnership } from "./care-ownership";

export function createCareAccessStore(): CareAccessStore {
  const client = createServerSupabaseClient();
  async function resolveCurrent(machineCode: string) {
    const { data: machine, error: machineError } = await client
      .from("machines")
      .select("id, machine_id, status")
      .eq("machine_id", normalizeMachineCode(machineCode))
      .maybeSingle();
    if (machineError || !machine) {
      return { ownership: null, reasonCode: "CARE_NO_EFFECTIVE_OWNERSHIP" as const };
    }
    const { resolution, error } = await findEffectiveCareOwnership(client, {
      id: machine.id,
      machineCode: machine.machine_id,
      status: machine.status,
    });
    if (error || !resolution.ownership) {
      return {
        ownership: null,
        reasonCode: error
          ? ("CARE_NO_EFFECTIVE_OWNERSHIP" as const)
          : resolution.reasonCode,
      };
    }
    return {
      ownership: Object.freeze({
        machineCode: machine.machine_id,
        saleId: resolution.ownership.sale.id,
        ownershipId: resolution.ownership.owner.id,
        phone: resolution.ownership.owner.phone,
        saleLifecycle: resolution.ownership.sale.lifecycle_status,
        ownershipActivated: Boolean(resolution.ownership.owner.activated_at),
      }),
      reasonCode: null,
    };
  }
  return {
    async consumeAttempt(keyHash) {
      const { data, error } = await client.rpc(
        "consume_public_care_verification_attempt",
        { p_key_hash: keyHash, p_limit: 10, p_window_seconds: 900 },
      );
      return !error && data === true;
    },
    async findCurrentOwnership(machineCode) {
      return (await resolveCurrent(machineCode)).ownership;
    },
    async findCurrentOwnershipResolution(machineCode) {
      return resolveCurrent(machineCode);
    },
    async contextIsCurrent(access) {
      const current = await this.findCurrentOwnership(access.machineCode);
      return careContextMatches(access, current);
    },
  };
}
export async function readCurrentCareAccess(
  machineCode: string,
): Promise<CareAccessContext | null> {
  let access: CareAccessContext | null;
  try {
    const token = (await cookies()).get(CARE_SESSION_COOKIE)?.value;
    access = parseCareSession(token);
  } catch {
    return null;
  }
  const normalized = normalizeMachineCode(machineCode);
  if (!access || access.machineCode !== normalized) return null;
  return (await createCareAccessStore().contextIsCurrent(access))
    ? access
    : null;
}

export function requestOrigin(request: Request) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return (
    request.headers.get("cf-connecting-ip")?.trim() || forwarded || "unknown"
  );
}

export function verificationAttemptKey(machineCode: string, request: Request) {
  return careAttemptKey(machineCode, requestOrigin(request));
}



