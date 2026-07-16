import { permanentRedirect } from "next/navigation";

export default async function AccidentalMachineRouteRedirect({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(`/may/${encodeURIComponent((await params).slug)}`);
}
