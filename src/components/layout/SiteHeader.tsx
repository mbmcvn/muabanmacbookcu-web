import Link from "next/link";
import { contactChannels } from "@/config/contact";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/may-dang-co">MBMC</Link>
        <nav className="desktop-navigation" aria-label="Điều hướng chính">
          <Link aria-current="page" href="/may-dang-co">Máy đang có</Link>
          <a href="#chon-macbook">Chọn MacBook</a>
          <a href="#chinh-sach">Chính sách</a>
          <a href="#ban-may">Bán máy cho MBMC</a>
          <a className="header-contact" href={contactChannels[0].href}>Liên hệ</a>
        </nav>
        <div className="mobile-header-actions">
          <a href="#inventory-search" aria-label="Tìm máy">Tìm</a>
          <a href={contactChannels[0].href} aria-label="Liên hệ MBMC">Liên hệ</a>
        </div>
      </div>
    </header>
  );
}
