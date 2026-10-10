import { redirect } from "next/navigation";
import { InvalidCareLookupError, lookupCare } from "@/data/care/public-inspection.server";
import { getCareMachinePresentation } from "@/data/care/care-machine-presentation.server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import CareLookupController from "./CareLookupController";
import styles from "./lookup.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tra cứu Care", robots: { index: false, follow: false } };

export default async function CareLookupPage({ searchParams }: { searchParams: Promise<{ lookup?: string }> }) {
  const { lookup } = await searchParams;
  // GET Serial queries would be echoed by Next.js in Flight hydration data.
  // Existing Machine ID/shorthand links remain supported; Serial uses POST UI.
  if (typeof lookup === "string" && lookup && !/^(?:MBMC-[A-Z0-9-]+|[A-Z0-9]{4})$/i.test(lookup)) redirect("/care");
  let result = null, unavailable = false, invalid = false;
  if (typeof lookup === "string" && lookup.length > 0) {
    if (lookup.length > 40) invalid = true;
    else {
      try { result = await lookupCare(lookup); }
      catch (error) {
        if (error instanceof InvalidCareLookupError) invalid = true;
        else unavailable = true;
      }
    }
  }
  const machine = result?.machine_id ? await getCareMachinePresentation(result.machine_id) : null;
  const message = unavailable ? "Không thể tra cứu lúc này. Vui lòng thử lại." : invalid ? "Vui lòng kiểm tra Serial hoặc MBMC Machine ID đã nhập." : lookup && !result ? "Không tìm thấy máy hoặc báo cáo kiểm tra công khai." : "";
  return <><SiteHeader /><main className={styles.page}>
    <CareLookupController initialResult={result} initialMachine={machine} initialLookup={typeof lookup === "string" ? lookup : ""} initialMessage={message} />
  </main><SiteFooter /></>;
}
