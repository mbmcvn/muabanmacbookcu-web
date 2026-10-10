import { lookupCareUserReports } from "@/data/care/public-inspection.server";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
  try {
    const body = await request.json();
    if (typeof body?.lookup !== "string" || !body.lookup.trim() || body.lookup.length > 40) return Response.json({ error: "invalid_lookup" }, { status: 400, headers });
    return Response.json(await lookupCareUserReports(body.lookup), { headers });
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? "invalid_lookup" : "unavailable" }, { status: error instanceof SyntaxError ? 400 : 503, headers });
  }
}
