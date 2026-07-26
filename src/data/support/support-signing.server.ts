import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";

export const SUPPORT_HEADERS = {
  keyId: "x-mbmc-key-id",
  timestamp: "x-mbmc-timestamp",
  nonce: "x-mbmc-nonce",
  bodyDigest: "x-mbmc-body-sha256",
  signature: "x-mbmc-signature",
  origin: "x-mbmc-origin",
  clientNetwork: "x-mbmc-client-network",
} as const;

type Configuration = Readonly<{
  keyId: string;
  secret: string;
  operationalBaseUrl: string;
  publicOrigin: string;
}>;
export function supportConfiguration(): Configuration {
  const keyId = process.env.MBMC_PUBLIC_API_KEY_ID?.trim();
  const secret = process.env.MBMC_PUBLIC_API_SECRET?.trim();
  const base = process.env.MBMC_OPERATIONAL_API_BASE_URL?.trim();
  const publicOrigin =
    process.env.MBMC_PUBLIC_WEB_ORIGIN?.trim() || "https://mbmc.vn";
  if (!keyId || !secret || secret.length < 32 || !base)
    throw new Error("support_configuration_missing");
  const operational = new URL(base);
  const origin = new URL(publicOrigin);
  if (
    !["http:", "https:"].includes(operational.protocol) ||
    operational.pathname !== "/" ||
    !["http:", "https:"].includes(origin.protocol)
  )
    throw new Error("support_configuration_invalid");
  return {
    keyId,
    secret,
    operationalBaseUrl: operational.origin,
    publicOrigin: origin.origin,
  };
}
export function sha256Hex(body: Uint8Array) {
  return createHash("sha256").update(body).digest("hex");
}
export function canonicalSupportSigningString(input: {
  keyId: string;
  timestamp: string;
  nonce: string;
  method: string;
  pathname: string;
  bodyDigest: string;
  origin: string;
  clientNetwork: string;
}) {
  return [
    "mbmc-public-api.v1",
    input.keyId,
    input.timestamp,
    input.nonce,
    input.method.toUpperCase(),
    input.pathname,
    input.bodyDigest,
    input.origin,
    input.clientNetwork,
  ].join("\n");
}
export function signedSupportHeaders(input: {
  method: string;
  pathname: string;
  body: Uint8Array;
  clientNetwork: string;
  configuration?: Configuration;
  timestamp?: number;
  nonce?: string;
}) {
  const config = input.configuration ?? supportConfiguration();
  const timestamp = String(input.timestamp ?? Math.floor(Date.now() / 1000));
  const nonce = input.nonce ?? randomBytes(24).toString("base64url");
  const bodyDigest = sha256Hex(input.body);
  const canonical = canonicalSupportSigningString({
    keyId: config.keyId,
    timestamp,
    nonce,
    method: input.method,
    pathname: input.pathname,
    bodyDigest,
    origin: config.publicOrigin,
    clientNetwork: input.clientNetwork,
  });
  const signature = createHmac("sha256", config.secret)
    .update(canonical)
    .digest("hex");
  return new Headers({
    [SUPPORT_HEADERS.keyId]: config.keyId,
    [SUPPORT_HEADERS.timestamp]: timestamp,
    [SUPPORT_HEADERS.nonce]: nonce,
    [SUPPORT_HEADERS.bodyDigest]: bodyDigest,
    [SUPPORT_HEADERS.signature]: `v1=${signature}`,
    [SUPPORT_HEADERS.origin]: config.publicOrigin,
    [SUPPORT_HEADERS.clientNetwork]: input.clientNetwork,
  });
}
