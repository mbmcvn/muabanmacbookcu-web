import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mbmc.vn"),
  title: { default: "MBMC · MacBook cũ minh bạch", template: "%s · MBMC" },
  description: "Thông tin rõ ràng về từng chiếc MacBook cũ trước khi bạn liên hệ MBMC.",
  openGraph: {
    siteName: "MBMC",
    images: [
      {
        url: "/images/mbmc-og-default.png",
        width: 1731,
        height: 909,
        alt: "MBMC · Hiểu rõ trước khi chọn MacBook cũ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/mbmc-og-default.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
