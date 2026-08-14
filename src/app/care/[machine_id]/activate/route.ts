import { NextResponse } from "next/server";
import { activateCarePassport } from "@/data/care/care-repository.server";
import { activationRedirectStatus } from "@/data/care/care-activation";
import { normalizeMachineCode } from "@/data/care/care-contract";
import {
  CARE_SESSION_COOKIE,
  careSessionCookieOptions,
  createCareSession,
} from "@/data/care/care-session";
import { requestOrigin } from "@/data/care/care-access.server";

export async function POST(
  request: Request,
  context: RouteContext<"/care/[machine_id]/activate">,
) {
  const { machine_id } = await context.params;
  const machineCode = normalizeMachineCode(machine_id);
  const form = await request.formData();
  const result = await activateCarePassport({
    machineCode,
    customerName: String(form.get("customer_name") ?? ""),
    phone: String(form.get("phone") ?? ""),
    origin: requestOrigin(request),
  });
  const activation = activationRedirectStatus(result);
  const response = NextResponse.redirect(
    new URL(
      `/care/${encodeURIComponent(machineCode)}?activation=${activation}`,
      request.url,
    ),
    303,
  );
  if (result.access) {
    response.cookies.set(
      CARE_SESSION_COOKIE,
      createCareSession(result.access),
      careSessionCookieOptions,
    );
  }
  return response;
}
