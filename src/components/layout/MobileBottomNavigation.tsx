import Link from "next/link";
import { contactChannels } from "@/config/contact";

export function MobileBottomNavigation() {
  return (
    <nav className="mobile-navigation" aria-label="Điều hướng di động">
      <Link href="/may-dang-co">Máy đang có</Link>
      <a href={contactChannels[0].href}>Liên hệ</a>
    </nav>
  );
}
