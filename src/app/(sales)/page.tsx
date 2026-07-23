import type { Metadata } from "next";
import { HomeView } from "./_components/home/HomeView";

export const metadata: Metadata = {
  title: "Hiểu rõ trước khi chọn MacBook cũ",
  description:
    "MBMC giúp bạn hiểu nhu cầu, hiểu từng chiếc MacBook cũ và tự tin hơn trước khi quyết định.",
};

export default function HomePage() {
  return <HomeView />;
}
