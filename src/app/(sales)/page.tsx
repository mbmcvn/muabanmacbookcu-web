import type { Metadata } from "next";
import { getAvailableMachines } from "@/data/machines/get-available-machines";
import { loadPublicInventoryState } from "@/data/machines/public-inventory-load-state";
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
    type: "website",
    url: "/",
  },
};

export default async function HomePage() {
  const machineState = await loadPublicInventoryState(getAvailableMachines);

  return <HomeView machineState={machineState} />;
}
