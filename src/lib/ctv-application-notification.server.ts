import "server-only";
import {
  signedSupportHeaders,
  supportConfiguration,
} from "@/data/support/support-signing.server";

export async function notifyNewCtvApplicationBestEffort(
  applicationId: string,
  options?: { fetch?: typeof fetch; logger?: Pick<Console, "error"> },
) {
  try {
    const config = supportConfiguration();
    const pathname = "/api/internal/ctv-application-notifications";
    const body = new TextEncoder().encode(JSON.stringify({ applicationId }));
    const headers = signedSupportHeaders({
      method: "POST",
      pathname,
      body,
      clientNetwork: "server:ctv-application",
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
    if (!response.ok) throw new Error("notification_failed");
  } catch {
    (options?.logger ?? console).error("[ctv-application-notification]", {
      applicationId,
      outcome: "notification_failed",
    });
  }
}
