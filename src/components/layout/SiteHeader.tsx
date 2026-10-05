"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MacNavigation, isNavigationPathCurrent } from "./MacNavigation";
import { NavigationSubmenu } from "./NavigationSubmenu";
import { ContactActionLink } from "@/components/contact/ContactActionLink";
import { contactChannels } from "@/config/contact";
import {
  useContactChannel,
  withContactChannel,
} from "@/hooks/useContactChannel";

type HeaderIconName =
  | "contact"
  | "inventory"
  | "people"
  | "sell"
  | "software"
  | "selector";
type HeaderLink = Readonly<{
  href: string;
  label: string;
  compactLabel?: string;
  icon: HeaderIconName;
  external?: boolean;
  contact?: boolean;
}>;

const iconPaths: Record<HeaderIconName, ReactNode> = {
  selector: (
    <>
      <rect x="4" y="4" width="16" height="11" rx="2" />
      <path d="M2 19h20M9 8h6M12 5v6" />
    </>
  ),
  inventory: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  people: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  software: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 14l2 2-2 2M13 18h3" />
    </>
  ),
  sell: (
    <>
      <path d="M3 7h12v10H3zM15 10h4l2 2v5h-6" />
      <path d="m8 10 3 2-3 2M5 12h6" />
    </>
  ),
  contact: <path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.4-4.2A9 9 0 1 1 21 12Z" />,
};

function HeaderNavIcon({ name }: { name: HeaderIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="mobile-nav-icon"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { channel, contactLabel, contactUrl, shareReferralCode } = useContactChannel();
  const defaultContact = contactChannels[0];
  const resolvedContactHref = contactUrl ?? defaultContact.href;
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuOpen = menuState.open && menuState.pathname === pathname;
  const closeMenu = useCallback(
    () => setMenuState({ open: false, pathname }),
    [pathname],
  );
  const macLinks = [
    { href: withContactChannel("/may-dang-co", channel, shareReferralCode), label: "Mac đang có", description: "Xem những máy đang sẵn sàng bán" },
    { href: withContactChannel("/chon-macbook", channel, shareReferralCode), label: "Hướng dẫn chọn MacBook", description: "Để MBMC gợi ý theo nhu cầu và ngân sách" },
  ];
  const careLinks = [
    { href: withContactChannel("/care", channel), label: "Tra cứu máy", description: "Hồ sơ máy, bảo hành và lịch sử kiểm định" },
    { href: withContactChannel("/chinh-sach", channel), label: "Chính sách", description: "Bảo hành, MBMC Care và các chính sách liên quan" },
  ];
  const links: readonly HeaderLink[] = [
    {
      href: withContactChannel("/people", channel),
      label: "Khách hàng",
      icon: "people",
    },
    {
      href: withContactChannel("/phan-mem", channel),
      label: "Phần mềm",
      icon: "software",
    },
    {
      href: resolvedContactHref,
      label: "Bán máy cho MBMC",
      compactLabel: "Bán lại Mac",
      icon: "sell",
      external: true,
    },
    {
      href: resolvedContactHref,
      label: contactLabel,
      icon: "contact",
      external: true,
      contact: true,
    },
  ];

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 56rem)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu();
    };
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) closeMenu();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menuOpen) return;
      closeMenu();
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeAtDesktop);
    };
  }, [closeMenu, menuOpen]);

  const renderLink = (link: HeaderLink, mobile = false) => {
    const className = link.contact ? "header-contact" : undefined;
    const current = isNavigationPathCurrent(pathname, link.href) ? "page" : undefined;
    const content = mobile ? (
      <>
        <HeaderNavIcon name={link.icon} />
        <span>{link.label}</span>
      </>
    ) : (
      <>
        <span
          className={`desktop-nav-label-full${link.compactLabel ? " desktop-nav-label-full--compactable" : ""}`}
        >
          {link.label}
        </span>
        {link.compactLabel ? (
          <span aria-hidden="true" className="desktop-nav-label-compact">
            {link.compactLabel}
          </span>
        ) : null}
      </>
    );
    const accessibleLabel =
      !mobile && link.compactLabel ? link.label : undefined;
    return link.external ? (
      <a
        aria-label={accessibleLabel}
        className={className}
        href={link.href}
        key={link.label}
        onClick={mobile ? closeMenu : undefined}
      >
        {content}
      </a>
    ) : (
      <Link
        aria-label={accessibleLabel}
        aria-current={current}
        className={className}
        href={link.href}
        key={link.label}
        onClick={mobile ? closeMenu : undefined}
      >
        {content}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href={withContactChannel("/", channel, shareReferralCode)}>
          MBMC
        </Link>
        <nav className="desktop-navigation" aria-label="Điều hướng chính">
          <MacNavigation links={macLinks} pathname={pathname} />
          <NavigationSubmenu name="care" label="Tra cứu" links={careLinks} pathname={pathname} />
          {links.map((link) => renderLink(link))}
        </nav>
        <div
          className="mobile-header-actions"
          ref={menuRef}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <ContactActionLink
            className="mobile-contact-action"
            compact
            onClick={closeMenu}
          />
          <button
            ref={triggerRef}
            className="mobile-menu-trigger"
            type="button"
            aria-controls="mobile-navigation-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setMenuState({ open: !menuOpen, pathname })}
          >
            <span
              className={`mobile-menu-icon${menuOpen ? " mobile-menu-icon--open" : ""}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
            </span>
          </button>
          {menuOpen ? (
            <nav
              id="mobile-navigation-menu"
              className="mobile-header-menu"
              aria-label="Điều hướng chính trên di động"
            >
              <MacNavigation links={macLinks} pathname={pathname} mobile onNavigate={closeMenu} />
              <NavigationSubmenu name="care" label="Tra cứu" links={careLinks} pathname={pathname} mobile onNavigate={closeMenu} />
              {links
                .filter((link) => !link.contact)
                .map((link) => renderLink(link, true))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
