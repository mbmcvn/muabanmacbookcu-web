import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "MBMC · MacBook cũ minh bạch", template: "%s · MBMC" },
  description: "Thông tin rõ ràng về từng chiếc MacBook cũ trước khi bạn liên hệ MBMC.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
