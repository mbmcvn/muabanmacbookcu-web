import { readCurrentCareAccess } from "@/data/care/care-access.server";
import { submitCareResaleDemand } from "@/data/care/care-repository.server";
import { notifyCareDemandBestEffort } from "@/lib/demand-notification.server";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ machine_id: string }> },
) {
  const { machine_id } = await context.params;
  const access = await readCurrentCareAccess(machine_id);
  if (!access) return Response.json({ error: "unauthorized" }, { status: 401 });
  let input: { note?: unknown; submissionKey?: unknown };
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (typeof input.note !== "string" || typeof input.submissionKey !== "string")
    return Response.json({ error: "invalid_request" }, { status: 400 });
  const outcome = await submitCareResaleDemand(
    {
      machineCode: machine_id,
      note: input.note,
      submissionKey: input.submissionKey,
    },
    access,
  );
  if (!outcome)
    return Response.json({ error: "temporarily_unavailable" }, { status: 503 });
  if (outcome.created)
    await notifyCareDemandBestEffort(
      "resale_upgrade",
      outcome.submissionId,
      access.machineCode,
    );
  return Response.json(
    { submissionId: outcome.submissionId },
    { status: 201, headers: { "cache-control": "no-store" } },
  );
}
