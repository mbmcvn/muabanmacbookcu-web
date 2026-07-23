import { NextResponse } from "next/server";
import { activateCarePassport } from "@/data/care/care-repository.server";
import { activationRedirectStatus } from "@/data/care/care-activation";
import { normalizeMachineCode } from "@/data/care/care-contract";

export async function POST(request: Request, context: RouteContext<"/care/[machine_id]/activate">) {
  const { machine_id } = await context.params;
  const machineCode = normalizeMachineCode(machine_id);
  const form = await request.formData();
  const result = await activateCarePassport({
    machineCode,
    customerName: String(form.get("customer_name") ?? ""),
    phone: String(form.get("phone") ?? ""),
  });
  const activation = activationRedirectStatus(result);
  return NextResponse.redirect(new URL(`/care/${encodeURIComponent(machineCode)}?activation=${activation}`, request.url), 303);
}
