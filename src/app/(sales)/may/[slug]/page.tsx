import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPublicMachineBySlug } from "@/data/machines/get-public-machine-by-slug";
import { PublicMachineDetailView } from "./_components/PublicMachineDetailView";
import { PublicMachineStickyBar } from "./_components/SupportAndSticky";

interface DetailPageProps { params: Promise<{ slug: string }>; }

export const revalidate = 60;

async function canonicalMachineUrl(slug: string): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0] ?? "https";
  return host ? `${protocol}://${host}/may/${encodeURIComponent(slug)}` : `/may/${encodeURIComponent(slug)}`;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const machine = await getPublicMachineBySlug(slug);
  if (!machine) notFound();
  const description = machine.mbmcSummary ?? machine.conditionSummary ?? `${machine.title} đang được MBMC công khai thông tin và kiểm định.`;
  return {
    title: `${machine.title} · ${machine.machineId}`,
    description,
    alternates: { canonical: await canonicalMachineUrl(slug) },
    openGraph: {
      title: `${machine.title} · ${machine.machineId}`,
      description,
      type: "website",
      url: await canonicalMachineUrl(slug),
      images: [{ url: machine.coverImage.url, alt: machine.coverImage.alt }],
    },
  };
}

export default async function PublicMachinePage({ params }: DetailPageProps) {
  const machine = await getPublicMachineBySlug((await params).slug);
  if (!machine || machine.images.length === 0) notFound();
  return <><PublicMachineDetailView machine={machine} /><PublicMachineStickyBar machine={machine} /></>;
}
