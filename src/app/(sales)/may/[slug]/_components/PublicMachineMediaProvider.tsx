"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { PublicImage } from "@/models";
import { clampGalleryIndex } from "./gallery-navigation";
import { SlidingImageTrack } from "./SlidingImageTrack";

interface MachineMediaContextValue {
  images: PublicImage[];
  index: number;
  select: (index: number) => void;
  previous: () => void;
  next: () => void;
  openLightbox: (index: number, opener?: HTMLElement) => void;
}

const MachineMediaContext = createContext<MachineMediaContextValue | null>(null);

export function usePublicMachineMedia(): MachineMediaContextValue {
  const value = useContext(MachineMediaContext);
  if (!value) throw new Error("Public machine media must be used inside its provider");
  return value;
}

export function PublicMachineMediaProvider({ images, title, children }: { images: PublicImage[]; title: string; children: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const select = (nextIndex: number) => setIndex(clampGalleryIndex(nextIndex, images.length));
  const previous = () => select(index - 1);
  const next = () => select(index + 1);
  const openLightbox = (nextIndex: number, opener?: HTMLElement) => {
    select(nextIndex);
    openerRef.current = opener ?? document.activeElement as HTMLElement | null;
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    window.requestAnimationFrame(() => openerRef.current?.focus());
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
      if (event.key === "Tab") {
        const dialog = closeRef.current?.closest('[role="dialog"]');
        const focusable = dialog ? [...dialog.querySelectorAll<HTMLElement>("button:not(:disabled)")] : [];
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [index, lightboxOpen, images.length]);

  const selected = images[index];
  return <MachineMediaContext.Provider value={{ images, index, select, previous, next, openLightbox }}>
    {children}
    {lightboxOpen && selected ? <div className="machine-lightbox" role="dialog" aria-modal="true" aria-label={`Xem ảnh toàn màn hình ${title}`}>
      <button ref={closeRef} className="lightbox-close" type="button" onClick={closeLightbox} aria-label="Đóng ảnh toàn màn hình">×</button>
      {images.length > 1 ? <button className="lightbox-previous" type="button" onClick={previous} disabled={index === 0} aria-label="Ảnh trước">‹</button> : null}
      <div className="lightbox-image"><SlidingImageTrack images={images} index={index} onSelect={select} sizes="100vw" variant="lightbox" /></div>
      {images.length > 1 ? <button className="lightbox-next" type="button" onClick={next} disabled={index === images.length - 1} aria-label="Ảnh tiếp theo">›</button> : null}
      <output className="lightbox-index" aria-live="polite">{index + 1} / {images.length} ảnh</output>
    </div> : null}
  </MachineMediaContext.Provider>;
}
