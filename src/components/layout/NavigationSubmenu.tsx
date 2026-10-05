"use client";

import Link from "next/link";
import styles from "./NavigationSubmenu.module.css";
import { useCallback, useEffect, useRef, useState } from "react";

export type NavigationSubmenuLink = { href: string; label: string; description: string };

export function isNavigationPathCurrent(pathname: string, href: string) {
  const path = href.split("?")[0];
  return path.startsWith("/") && (pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)));
}

export function NavigationSubmenu({ name, label, links, pathname, mobile = false, onNavigate }: {
  name: string;
  label: string;
  links: readonly NavigationSubmenuLink[];
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [state, setState] = useState({ open: false, hovered: false, pathname });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const restoringFocus = useRef(false);
  const expanded = state.pathname === pathname && (state.open || state.hovered);
  const active = links.some(link => isNavigationPathCurrent(pathname, link.href));
  const id = `${mobile ? "mobile" : "desktop"}-${name}-navigation`;
  const close = useCallback(() => setState({ open: false, hovered: false, pathname }), [pathname]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expanded) {
        close();
        restoringFocus.current = true;
        trigger.current?.focus();
        restoringFocus.current = false;
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [close, expanded]);

  return (
    <div
      ref={root}
      className={`navigation-group ${styles.anchor}${mobile ? ` navigation-group--mobile ${styles.mobile}` : ""}`}
      onMouseEnter={mobile ? undefined : () => setState(previous => ({ open: previous.pathname === pathname && previous.open, hovered: true, pathname }))}
      onMouseLeave={mobile ? undefined : () => setState(previous => ({ open: previous.pathname === pathname && previous.open, hovered: false, pathname }))}
      onFocus={() => { if (!restoringFocus.current) setState({ open: true, hovered: false, pathname }); }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}
    >
      <Link
        ref={trigger}
        className={`navigation-group-trigger ${styles.trigger}`}
        href={links[0]?.href ?? "#"}
        aria-controls={id}
        aria-expanded={mobile || expanded}
        data-active={active || undefined}
        onKeyDown={event => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setState({ open: true, hovered: false, pathname });
            requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>(".navigation-group-submenu a")?.focus());
          }
        }}
        onClick={onNavigate}
      >
        {label}
      </Link>
      <div id={id} className={`navigation-group-submenu ${styles.panel} ${mobile ? styles.mobilePanel : styles.popover}`} hidden={!mobile && !expanded}>
        {links.map(link => (
          <Link key={link.href} href={link.href} aria-current={isNavigationPathCurrent(pathname, link.href) ? "page" : undefined} onClick={() => { close(); onNavigate?.(); }}>
            <span>{link.label}</span>
            <small>{link.description}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
