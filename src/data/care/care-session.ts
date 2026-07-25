import { createHmac, timingSafeEqual } from "node:crypto";

export const CARE_SESSION_COOKIE = "mbmc_care_session";
export const CARE_SESSION_MAX_AGE_SECONDS = 45 * 60;

export type CareAccessContext = Readonly<{
  machineCode: string;
  saleId: string;
  ownershipId: string;
}>;

type Claims = {
  v: 1;
  m: string;
  s: string;
  o: string;
  exp: number;
};

function secret() {
  const value = process.env.CARE_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("CARE_SESSION_SECRET is not configured.");
  }
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createCareSession(access: CareAccessContext, now = Date.now()) {
  const claims: Claims = {
    v: 1,
    m: access.machineCode,
    s: access.saleId,
    o: access.ownershipId,
    exp: Math.floor(now / 1000) + CARE_SESSION_MAX_AGE_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function parseCareSession(
  token: string | undefined,
  now = Date.now(),
): CareAccessContext | null {
  if (!token) return null;
  const [payload, supplied, extra] = token.split(".");
  if (!payload || !supplied || extra) return null;
  const expected = signature(payload);
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  if (
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  ) {
    return null;
  }
  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<Claims>;
    if (
      claims.v !== 1 ||
      typeof claims.m !== "string" ||
      typeof claims.s !== "string" ||
      typeof claims.o !== "string" ||
      typeof claims.exp !== "number" ||
      claims.exp <= Math.floor(now / 1000)
    ) {
      return null;
    }
    return Object.freeze({
      machineCode: claims.m,
      saleId: claims.s,
      ownershipId: claims.o,
    });
  } catch {
    return null;
  }
}

export const careSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: CARE_SESSION_MAX_AGE_SECONDS,
  path: "/care",
  priority: "high" as const,
};
