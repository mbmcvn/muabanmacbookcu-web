import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicMachineBySlug } from "@/data/machines/get-public-machine-by-slug";
import { resolvePublicMachineImage } from "@/lib/images/mbmc-public-image";
import { canonicalMachineUrl } from "@/lib/public-machine-url";
import { PublicMachineDetailView } from "./_components/PublicMachineDetailView";
import { PublicMachineStickyBar } from "./_components/SupportAndSticky";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const machine = await getPublicMachineBySlug(slug);
  if (!machine) notFound();
  const summary = machine.summary;
  const description = machine.expertSummary ?? summary.conditionSummary;
  const socialImage = resolvePublicMachineImage(summary.coverImage, "display");
  return {
    title: `${summary.displayName} · ${summary.code}`,
    description,
    alternates: { canonical: canonicalMachineUrl(slug) },
    openGraph: {
      title: `${summary.displayName} · ${summary.code}`,
      description,
      type: "website",
      url: canonicalMachineUrl(slug),
      ...(socialImage
        ? { images: [{ url: socialImage.url, alt: summary.coverImage.alt }] }
        : {}),
    },
  };
}

export default async function PublicMachinePage({ params }: DetailPageProps) {
  const machine = await getPublicMachineBySlug((await params).slug);
  if (!machine) notFound();
  return (
    <>
      <PublicMachineDetailView machine={machine} />
      <PublicMachineStickyBar machine={machine} />
    </>
  );
}
