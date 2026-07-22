"use client";

import Link from "next/link";
import { contactChannels } from "@/config/contact";
import { useContactChannel, withContactChannel } from "@/hooks/useContactChannel";

export function SiteHeader() {
  const { channel, contactUrl, contactLabel } = useContactChannel();
  const inventoryHref = withContactChannel("/may-dang-co", channel);
  const defaultContact = contactChannels[0];
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href={inventoryHref}>MBMC</Link>
        <nav className="desktop-navigation" aria-label="Điều hướng chính">
          <Link aria-current="page" href={inventoryHref}>Máy đang có</Link>
          <a href="#chon-macbook">Chọn MacBook</a>
          <a href="#chinh-sach">Chính sách</a>
          <a href="#ban-may">Bán máy cho MBMC</a>
          <a className="header-contact" href={contactUrl ?? defaultContact.href}>{contactLabel ?? "Liên hệ"}</a>
        </nav>
        <div className="mobile-header-actions">
          <a href="#inventory-search" aria-label="Tìm máy">Tìm</a>
          <a href={contactUrl ?? defaultContact.href} aria-label={contactLabel ?? "Liên hệ MBMC"}>{contactLabel ?? "Liên hệ"}</a>
        </div>
      </div>
    </header>
  );
}
