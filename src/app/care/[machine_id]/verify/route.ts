import { NextResponse } from "next/server";
import {
  CARE_VERIFICATION_ERROR,
  verifyCareAccessDetailed,
} from "@/data/care/care-access";
import {
  createCareAccessStore,
  requestOrigin,
} from "@/data/care/care-access.server";
import { normalizeMachineCode } from "@/data/care/care-contract";
import {
  CARE_SESSION_COOKIE,
  careSessionCookieOptions,
  createCareSession,
} from "@/data/care/care-session";

export async function POST(
  request: Request,
  context: { params: Promise<{ machine_id: string }> },
) {
  const { machine_id } = await context.params;
  const machineCode = normalizeMachineCode(machine_id);
  const form = await request.formData();
  const phoneField = form.get("phone");
  const rawPhone = typeof phoneField === "string" ? phoneField : "";
  const result = await verifyCareAccessDetailed(
    { machineCode, phone: rawPhone, origin: requestOrigin(request) },
    createCareAccessStore(),
  ).catch(() => null);
  const destination = new URL(
    `/care/${encodeURIComponent(machineCode)}`,
    request.url,
  );
  if (!result?.access) {
    logCareVerification({
      ...(result?.diagnostic ?? {
        machineCode,
        selectedOwnershipId: null,
        selectedSaleId: null,
        saleLifecycle: null,
        ownershipActivated: null,
        storedPhoneValid: null,
        submittedPhoneValid: false,
        normalizedMatch: false,
        reasonCode: "CARE_NO_EFFECTIVE_OWNERSHIP",
      }),
      sessionCreated: false,
      cookieIssued: false,
    });
    destination.searchParams.set("verification", "failed");
    destination.searchParams.set("message", CARE_VERIFICATION_ERROR);
    return NextResponse.redirect(destination, 303);
  }

  let session: string;
  try {
    session = createCareSession(result.access);
  } catch {
    logCareVerification({
      ...result.diagnostic,
      reasonCode: "CARE_SESSION_CREATE_FAILED",
      sessionCreated: false,
      cookieIssued: false,
    });
    destination.searchParams.set("verification", "failed");
    destination.searchParams.set("message", CARE_VERIFICATION_ERROR);
    return NextResponse.redirect(destination, 303);
  }
  const response = NextResponse.redirect(destination, 303);
  response.cookies.set(CARE_SESSION_COOKIE, session, careSessionCookieOptions);
  logCareVerification({
    ...result.diagnostic,
    sessionCreated: true,
    cookieIssued: true,
  });
  return response;
}

type LoggedVerification = Readonly<{
  machineCode: string | null;
  selectedOwnershipId: string | null;
  selectedSaleId: string | null;
  saleLifecycle: string | null;
  ownershipActivated: boolean | null;
  storedPhoneValid: boolean | null;
  submittedPhoneValid: boolean;
  normalizedMatch: boolean;
  reasonCode: string;
  sessionCreated: boolean;
  cookieIssued: boolean;
}>;

function logCareVerification(details: LoggedVerification) {
  if (process.env.NODE_ENV === "development") {
    console.info("[care-verification]", JSON.stringify(details));
  }
}
