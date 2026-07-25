import { NextResponse } from "next/server";
import { readCurrentCareAccess } from "@/data/care/care-access.server";
import { submitCareSupport } from "@/data/care/care-repository.server";
import { normalizeMachineCode } from "@/data/care/care-contract";

export async function POST(
  request: Request,
  context: RouteContext<"/care/[machine_id]/support">,
) {
  const { machine_id } = await context.params;
  const machineCode = normalizeMachineCode(machine_id);
  const access = await readCurrentCareAccess(machineCode);
  if (!access) {
    return NextResponse.redirect(
      new URL(
        `/care/${encodeURIComponent(machineCode)}?verification=failed`,
        request.url,
      ),
      303,
    );
  }
  const form = await request.formData();
  const result = await submitCareSupport(
    {
      machineCode,
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
    },
    access,
  );
  const support = result === "submitted" ? "sent" : "failed";
  return NextResponse.redirect(
    new URL(
      `/care/${encodeURIComponent(machineCode)}?support=${support}`,
      request.url,
    ),
    303,
  );
}
