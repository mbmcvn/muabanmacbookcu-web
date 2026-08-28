import type { Metadata } from "next";
import { getAvailableMachines } from "@/data/machines/get-available-machines";
import { loadPublicInventoryState } from "@/data/machines/public-inventory-load-state";
import { getHomepageStories } from "@/data/handover/get-homepage-stories.server";
import { HomeView } from "./_components/home/HomeView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hiểu rõ trước khi chọn MacBook cũ",
  description:
    "MBMC giúp bạn hiểu nhu cầu, hiểu từng chiếc MacBook cũ và tự tin hơn trước khi quyết định.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hiểu rõ trước khi chọn MacBook cũ",
    description:
      "MBMC giúp bạn hiểu nhu cầu, hiểu từng chiếc MacBook cũ và tự tin hơn trước khi quyết định.",
    siteName: "MBMC",
    type: "website",
    url: "/",
    images: [
      {
        url: "/images/mbmc-og-default.png",
        width: 1731,
        height: 909,
        alt: "MBMC · Hiểu rõ trước khi chọn MacBook cũ",
      },
    ],
  },
};

export default async function HomePage() {
  const [machineState, homepageStories] = await Promise.all([
    loadPublicInventoryState(getAvailableMachines),
    getHomepageStories(),
  ]);

  return (
    <HomeView machineState={machineState} homepageStories={homepageStories} />
  );
}
