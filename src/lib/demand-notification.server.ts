import "server-only";
import {
  signedSupportHeaders,
  supportConfiguration,
} from "@/data/support/support-signing.server";

export async function notifyNewDemandBestEffort(
  demandRequestId: string,
  options?: { fetch?: typeof fetch; logger?: Pick<Console, "error"> },
) {
  const requestId = crypto.randomUUID();
  try {
    const config = supportConfiguration();
    const pathname = "/api/internal/demand-notifications";
    const body = new TextEncoder().encode(JSON.stringify({ demandRequestId }));
    const headers = signedSupportHeaders({
      method: "POST",
      pathname,
      body,
      clientNetwork: "server:demand",
      configuration: config,
    });
    headers.set("content-type", "application/json");
    const response = await (options?.fetch ?? fetch)(
      `${config.operationalBaseUrl}${pathname}`,
      {
        method: "POST",
        headers,
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!response.ok)
      throw new Error(`operational_notification_${response.status}`);
  } catch {
    (options?.logger ?? console).error("[demand-notification]", {
      requestId,
      demandRequestId,
      outcome: "notification_failed",
    });
  }
}
