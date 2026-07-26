import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalSupportSigningString,
  sha256Hex,
  signedSupportHeaders,
  SUPPORT_HEADERS,
} from "./support-signing.server.ts";
const configuration = {
  keyId: "website",
  secret: "s".repeat(32),
  operationalBaseUrl: "https://app.mbmc.vn",
  publicOrigin: "https://mbmc.vn",
};
test("canonical string and exact headers match the operational contract", () => {
  const body = new TextEncoder().encode("exact body");
  const input = {
    keyId: "website",
    timestamp: "2000000000",
    nonce: "nonce_123456789012",
    method: "post",
    pathname: "/api/public/support-tickets",
    bodyDigest: sha256Hex(body),
    origin: "https://mbmc.vn",
    clientNetwork: "203.0.113.1",
  };
  assert.equal(
    canonicalSupportSigningString(input),
    `mbmc-public-api.v1\nwebsite\n2000000000\nnonce_123456789012\nPOST\n/api/public/support-tickets\n${input.bodyDigest}\nhttps://mbmc.vn\n203.0.113.1`,
  );
  const headers = signedSupportHeaders({
    method: "POST",
    pathname: input.pathname,
    body,
    clientNetwork: input.clientNetwork,
    configuration,
    timestamp: 2000000000,
    nonce: input.nonce,
  });
  assert.deepEqual(
    [...headers.keys()].sort(),
    Object.values(SUPPORT_HEADERS).sort(),
  );
  assert.equal(headers.get(SUPPORT_HEADERS.bodyDigest), input.bodyDigest);
  assert.match(headers.get(SUPPORT_HEADERS.signature), /^v1=[0-9a-f]{64}$/);
});
test("GET signs an empty body and tampering changes POST signature", () => {
  const get = signedSupportHeaders({
    method: "GET",
    pathname: "/api/public/support-machines/MBMC-001",
    body: new Uint8Array(),
    clientNetwork: "server-render",
    configuration,
    timestamp: 2000000000,
    nonce: "nonce_123456789012",
  });
  assert.equal(
    get.get(SUPPORT_HEADERS.bodyDigest),
    sha256Hex(new Uint8Array()),
  );
  const a = signedSupportHeaders({
    method: "POST",
    pathname: "/api/public/support-tickets",
    body: new TextEncoder().encode("a"),
    clientNetwork: "n",
    configuration,
    timestamp: 2000000000,
    nonce: "nonce_123456789012",
  });
  const b = signedSupportHeaders({
    method: "POST",
    pathname: "/api/public/support-tickets",
    body: new TextEncoder().encode("b"),
    clientNetwork: "n",
    configuration,
    timestamp: 2000000000,
    nonce: "nonce_123456789012",
  });
  assert.notEqual(
    a.get(SUPPORT_HEADERS.signature),
    b.get(SUPPORT_HEADERS.signature),
  );
});
