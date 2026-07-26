import "server-only";
import {
  parseSupportMachine,
  type SupportMachineContext,
} from "./support-contract";
import {
  signedSupportHeaders,
  supportConfiguration,
} from "./support-signing.server";
export class SupportMachineNotFoundError extends Error {}
export async function getSupportMachine(
  machineCode: string,
): Promise<SupportMachineContext> {
  const config = supportConfiguration();
  const code = machineCode.trim().toUpperCase();
  const pathname = `/api/public/support-machines/${encodeURIComponent(code)}`;
  const headers = signedSupportHeaders({
    method: "GET",
    pathname,
    body: new Uint8Array(),
    clientNetwork: "server-render",
    configuration: config,
  });
  const response = await fetch(`${config.operationalBaseUrl}${pathname}`, {
    headers,
    cache: "no-store",
  });
  if (response.status === 404) throw new SupportMachineNotFoundError();
  if (!response.ok) throw new Error("support_machine_unavailable");
  const machine = parseSupportMachine(await response.json());
  if (!machine) throw new Error("support_machine_invalid_response");
  return machine;
}
