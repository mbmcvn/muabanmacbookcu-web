import { InvalidCareLookupError, lookupCare } from "@/data/care/public-inspection.server";
import { getCareMachinePresentation } from "@/data/care/care-machine-presentation.server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageState } from "@/components/ui/PageState";
import { CareLookupForm, CareLookupSummary, CareReportList } from "./CareLookupResults";
import styles from "./lookup.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tra cứu Care", robots: { index: false, follow: false } };

export default async function CareLookupPage({ searchParams }: { searchParams: Promise<{ lookup?: string }> }) {
  const { lookup } = await searchParams;
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
  const message = unavailable
    ? "Không thể tra cứu lúc này. Vui lòng thử lại."
    : invalid
      ? "Vui lòng kiểm tra Serial hoặc MBMC Machine ID đã nhập."
      : "Không tìm thấy máy hoặc báo cáo kiểm tra công khai.";

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>MBMC Care</p>
          <h1>Tra cứu Care</h1>
          <p>Nhập Serial hoặc MBMC Machine ID để xem hồ sơ máy và báo cáo kiểm tra công khai.</p>
        </header>
        <CareLookupForm lookup={typeof lookup === "string" ? lookup : ""} />
        {lookup && !result && <PageState className={styles.empty} role="status" description={message} />}
        {result && <>
          <CareLookupSummary result={result} machine={machine} />
          <CareReportList reports={result.reports} />
        </>}
      </main>
      <SiteFooter />
    </>
  );
}
