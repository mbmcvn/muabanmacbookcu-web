import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPublicInspectionReport } from "@/data/care/public-inspection.server";
import { publicDesktopReportMetadata } from "@/lib/care-report/desktop-public-report-view";
import PublicDeviceCheckReport from "@/components/desktop/PublicDeviceCheckReport";

export const dynamic = "force-dynamic";

const loadReport = cache(getPublicInspectionReport);

export async function generateMetadata(props: {
  params: Promise<{ reportId: string }>;
}): Promise<Metadata> {
  const { reportId } = await props.params;
  const report = await loadReport(reportId);
  if (!report)
    return {
      title: "Báo cáo kiểm tra không khả dụng | MBMC",
      robots: { index: false, follow: false },
    };
  const metadata = publicDesktopReportMetadata(report);
  const canonical = `https://mbmc.vn/care/report/${reportId}`;
  return {
    ...metadata,
    alternates: { canonical },
    robots: { index: false, follow: false },
    openGraph: {
      url: canonical,
      title: metadata.title,
      description: metadata.description,
      type: "article",
      siteName: "MBMC",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary",
      title: metadata.title,
      description: metadata.description,
    },
  };
}

export default async function PublicDeviceCheckPage(props: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await props.params;
  const report = await loadReport(reportId);
  if (!report) notFound();
  return <PublicDeviceCheckReport report={report} />;
}
