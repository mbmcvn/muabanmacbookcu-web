import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  parseSupportReceipt,
  SUPPORT_INTAKE_SCHEMA,
  type SupportErrorCode,
} from "@/data/support/support-contract";
import {
  signedSupportHeaders,
  supportConfiguration,
} from "@/data/support/support-signing.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const REQUEST_LIMIT = 26 * 1024 * 1024;
const ALLOWED_FIELDS = new Set([
  "schemaVersion",
  "machineCode",
  "contactName",
  "contactPhone",
  "category",
  "description",
  "idempotencyKey",
  "attachments[]",
]);
const ERROR_CODES = new Set<SupportErrorCode>([
  "invalid_request",
  "unsupported_attachment",
  "too_many_attachments",
  "payload_too_large",
  "rate_limited",
  "not_found",
  "unauthorized",
  "temporarily_unavailable",
]);
const STATUS: Record<SupportErrorCode, number> = {
  invalid_request: 400,
  unsupported_attachment: 415,
  too_many_attachments: 400,
  payload_too_large: 413,
  rate_limited: 429,
  not_found: 404,
  unauthorized: 401,
  temporarily_unavailable: 503,
};
function errorResponse(code: SupportErrorCode, requestId: string) {
  return NextResponse.json(
    { error: { code, requestId } },
    { status: STATUS[code], headers: { "cache-control": "no-store" } },
  );
}
function allowedOrigins(configuredOrigin: string) {
  const configured = (process.env.MBMC_PUBLIC_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([configuredOrigin, "https://mbmc.vn", ...configured]);
}
function trustedClientNetwork(request: Request) {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  let config;
  try {
    config = supportConfiguration();
  } catch {
    console.error("[public-support-bff]", {
      requestId,
      outcome: "configuration_error",
    });
    return errorResponse("temporarily_unavailable", requestId);
  }
  const origin = request.headers.get("origin") ?? "";
  if (!allowedOrigins(config.publicOrigin).has(origin))
    return errorResponse("unauthorized", requestId);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > REQUEST_LIMIT)
    return errorResponse("payload_too_large", requestId);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    return errorResponse("invalid_request", requestId);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("invalid_request", requestId);
  }
  for (const key of form.keys())
    if (!ALLOWED_FIELDS.has(key))
      return errorResponse("invalid_request", requestId);
  const outbound = new FormData();
  for (const field of [
    "schemaVersion",
    "machineCode",
    "contactName",
    "contactPhone",
    "category",
    "description",
    "idempotencyKey",
  ]) {
    const value = form.get(field);
    if (typeof value !== "string")
      return errorResponse("invalid_request", requestId);
    outbound.set(field, value);
  }
  if (outbound.get("schemaVersion") !== SUPPORT_INTAKE_SCHEMA)
    return errorResponse("invalid_request", requestId);
  for (const file of form.getAll("attachments[]")) {
    if (!(file instanceof File))
      return errorResponse("invalid_request", requestId);
    outbound.append("attachments[]", file, file.name);
  }
  const pathname = "/api/public/support-tickets";
  const envelope = new Request(`${config.operationalBaseUrl}${pathname}`, {
    method: "POST",
    body: outbound,
  });
  const body = new Uint8Array(await envelope.arrayBuffer());
  if (body.byteLength > REQUEST_LIMIT)
    return errorResponse("payload_too_large", requestId);
  const headers = signedSupportHeaders({
    method: "POST",
    pathname,
    body,
    clientNetwork: trustedClientNetwork(request),
    configuration: config,
  });
  headers.set("content-type", envelope.headers.get("content-type") ?? "");
  try {
    const response = await fetch(`${config.operationalBaseUrl}${pathname}`, {
      method: "POST",
      headers,
      body: body.buffer.slice(
        body.byteOffset,
        body.byteOffset + body.byteLength,
      ) as ArrayBuffer,
      cache: "no-store",
    });
    const value: unknown = await response.json().catch(() => null);
    if (response.ok) {
      const receipt = parseSupportReceipt(value);
      return receipt
        ? NextResponse.json(receipt, {
            status: 201,
            headers: { "cache-control": "no-store" },
          })
        : errorResponse("temporarily_unavailable", requestId);
    }
    const candidate = (value as { error?: { code?: unknown } } | null)?.error
      ?.code;
    const code =
      typeof candidate === "string" &&
      ERROR_CODES.has(candidate as SupportErrorCode)
        ? (candidate as SupportErrorCode)
        : "temporarily_unavailable";
    return errorResponse(code, requestId);
  } catch {
    console.error("[public-support-bff]", {
      requestId,
      outcome: "operational_unavailable",
    });
    return errorResponse("temporarily_unavailable", requestId);
  }
}
