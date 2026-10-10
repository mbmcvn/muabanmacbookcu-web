import { InvalidCareLookupError, lookupCare } from "@/data/care/public-inspection.server";
import { getCareMachinePresentation } from "@/data/care/care-machine-presentation.server";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  try {
    const body = await request.json();
    if (typeof body?.lookup !== "string" || !body.lookup.trim() || body.lookup.length > 40) return Response.json({ error: "invalid_lookup" }, { status: 400, headers });
    const result = await lookupCare(body.lookup);
    if (!result) return Response.json({ error: "not_found" }, { status: 404, headers });
    const machine = result.machine_id ? await getCareMachinePresentation(result.machine_id) : null;
    return Response.json({ result, machine }, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof InvalidCareLookupError || error instanceof SyntaxError ? "invalid_lookup" : "unavailable" }, { status: error instanceof InvalidCareLookupError || error instanceof SyntaxError ? 400 : 503, headers });
  }
}
