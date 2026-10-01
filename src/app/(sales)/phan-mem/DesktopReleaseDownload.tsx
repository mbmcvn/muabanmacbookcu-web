"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CURRENT_MBMC_DESKTOP_RELEASE,
  DOWNLOADABLE_MBMC_DESKTOP_RELEASES,
  type DesktopRelease,
} from "@/config/desktop-releases";
import styles from "./software.module.css";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" />
    </svg>
  );
}

function releaseLabel(release: DesktopRelease) {
  return (
    release.label ??
    `v${release.version}${release.build ? ` (${release.build})` : ""}`
  );
}

export function DesktopReleaseDownload({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const menuId = useId();

  const closeMenu = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  const openAndFocus = (index: number) => {
    setOpen(true);
    requestAnimationFrame(() => itemRefs.current[index]?.focus());
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div
      className={`${styles.releaseDownload}${className ? ` ${className}` : ""}`}
      ref={rootRef}
    >
      <div className={styles.splitDownload}>
        <a
          className={styles.splitDownloadPrimary}
          href={CURRENT_MBMC_DESKTOP_RELEASE.downloadUrl}
          download
        >
          <DownloadIcon />
          <span>
            <strong>
              Tải MBMC Desktop v{CURRENT_MBMC_DESKTOP_RELEASE.version}
            </strong>
            <small>{CURRENT_MBMC_DESKTOP_RELEASE.filename}</small>
          </span>
        </a>
        <button
          ref={triggerRef}
          className={styles.releaseMenuTrigger}
          type="button"
          aria-label="Chọn phiên bản MBMC Desktop"
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="menu"
          onClick={() => (open ? closeMenu(true) : openAndFocus(0))}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              openAndFocus(0);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              openAndFocus(DOWNLOADABLE_MBMC_DESKTOP_RELEASES.length - 1);
            } else if (event.key === "Escape" && open) {
              event.preventDefault();
              closeMenu(true);
            }
          }}
        >
          <svg
            className={open ? styles.releaseChevronOpen : undefined}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className={styles.releaseMenu}
          id={menuId}
          role="menu"
          aria-label="Các phiên bản MBMC Desktop"
          onKeyDown={(event) => {
            const activeIndex = itemRefs.current.indexOf(
              document.activeElement as HTMLAnchorElement,
            );

            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu(true);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              itemRefs.current[
                (activeIndex + 1) % DOWNLOADABLE_MBMC_DESKTOP_RELEASES.length
              ]?.focus();
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              itemRefs.current[
                (activeIndex - 1 + DOWNLOADABLE_MBMC_DESKTOP_RELEASES.length) %
                  DOWNLOADABLE_MBMC_DESKTOP_RELEASES.length
              ]?.focus();
            } else if (event.key === "Home") {
              event.preventDefault();
              itemRefs.current[0]?.focus();
            } else if (event.key === "End") {
              event.preventDefault();
              itemRefs.current[
                DOWNLOADABLE_MBMC_DESKTOP_RELEASES.length - 1
              ]?.focus();
            } else if (
              (event.key === "Enter" || event.key === " ") &&
              activeIndex >= 0
            ) {
              event.preventDefault();
              itemRefs.current[activeIndex]?.click();
            }
          }}
        >
          {DOWNLOADABLE_MBMC_DESKTOP_RELEASES.map((release, index) => (
            <div className={styles.releaseMenuGroup} key={release.downloadUrl}>
              <span className={styles.releaseMenuGroupLabel}>
                {release.current ? "Hiện tại" : "Bản cũ"}
              </span>
              <a
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className={styles.releaseMenuItem}
                href={release.downloadUrl}
                download
                role="menuitem"
                tabIndex={index === 0 ? 0 : -1}
                onClick={() => closeMenu()}
              >
                <span className={styles.releaseMenuHeading}>
                  <strong>{releaseLabel(release)}</strong>
                  {release.current ? <em>Hiện tại</em> : null}
                </span>
                <span className={styles.releaseMenuMetadata}>
                  {release.current
                    ? `macOS ${release.minMacOS} · Universal · Apple notarized`
                    : release.architecture}
                </span>
                <small className={styles.releaseFilename}>
                  {release.filename}
                </small>
                {release.releasedAt ? (
                  <time dateTime={release.releasedAt}>{release.releasedAt}</time>
                ) : null}
              </a>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
