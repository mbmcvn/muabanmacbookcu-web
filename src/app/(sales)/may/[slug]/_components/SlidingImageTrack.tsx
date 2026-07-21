"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { PublicImage } from "@/models";
import { resistGalleryDrag, resolveGalleryDragIndex } from "./gallery-navigation";
import { classifyGalleryImageShape, type GalleryImageShape } from "./gallery-image-shape";

interface PointerSession {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocityX: number;
  horizontal: boolean | null;
  moved: boolean;
}

export function SlidingImageTrack({
  images,
  index,
  onSelect,
  onOpen,
  sizes,
  variant,
  onImageShape,
}: {
  images: PublicImage[];
  index: number;
  onSelect: (index: number) => void;
  onOpen?: (index: number, opener: HTMLElement) => void;
  sizes: string;
  variant: "gallery" | "lightbox";
  onImageShape?: (index: number, shape: GalleryImageShape) => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerSession | null>(null);
  const frameRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const setTrackPosition = (distanceX = 0, animate = true) => {
    const track = trackRef.current;
    if (!track) return;
    track.dataset.dragging = animate ? "false" : "true";
    track.style.transform = `translate3d(calc(${-index * 100}% + ${distanceX}px), 0, 0)`;
  };

  useEffect(() => {
    setTrackPosition(0, true);
  }, [index]);

  const queuePosition = (distanceX: number) => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      setTrackPosition(resistGalleryDrag(index, images.length, distanceX), false);
      frameRef.current = null;
    });
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = pointerRef.current;
    if (!session || session.id !== event.pointerId) return;
    const distanceX = event.clientX - session.startX;
    const nextIndex = session.horizontal
      ? resolveGalleryDragIndex({
          index,
          length: images.length,
          distanceX,
          velocityX: session.velocityX,
          viewportWidth: viewportRef.current?.clientWidth ?? 1,
        })
      : index;
    suppressClickRef.current = session.moved;
    pointerRef.current = null;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setTrackPosition(0, true);
    if (nextIndex !== index) onSelect(nextIndex);
  };

  return <div
    ref={viewportRef}
    className={`carousel-viewport carousel-viewport-${variant}`}
    onPointerDown={(event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      pointerRef.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, velocityX: 0, horizontal: null, moved: false };
      setTrackPosition(0, false);
    }}
    onPointerMove={(event) => {
      const session = pointerRef.current;
      if (!session || session.id !== event.pointerId) return;
      const distanceX = event.clientX - session.startX;
      const distanceY = event.clientY - session.startY;
      if (session.horizontal === null && (Math.abs(distanceX) > 5 || Math.abs(distanceY) > 5)) session.horizontal = Math.abs(distanceX) > Math.abs(distanceY);
      if (!session.horizontal) return;
      event.preventDefault();
      const elapsed = Math.max(1, event.timeStamp - session.lastTime);
      session.velocityX = (event.clientX - session.lastX) / elapsed;
      session.lastX = event.clientX;
      session.lastTime = event.timeStamp;
      session.moved ||= Math.abs(distanceX) > 8;
      queuePosition(distanceX);
    }}
    onPointerUp={finishPointer}
    onPointerCancel={finishPointer}
  >
    <div ref={trackRef} className="carousel-track" data-dragging="false" style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}>
      {images.map((image, imageIndex) => <div className="carousel-slide" key={image.url} aria-hidden={imageIndex !== index}>
        {onOpen ? <button
          className="carousel-slide-open"
          type="button"
          tabIndex={imageIndex === index ? 0 : -1}
          aria-label={`Mở ảnh ${imageIndex + 1} toàn màn hình`}
          onClick={(event) => {
            if (suppressClickRef.current) { suppressClickRef.current = false; return; }
            onOpen(imageIndex, event.currentTarget);
          }}
        ><Image src={image.url} alt={image.alt} fill priority={variant === "gallery" && imageIndex === 0} sizes={sizes} draggable={false} onLoadingComplete={(element) => onImageShape?.(imageIndex, classifyGalleryImageShape(element.naturalWidth, element.naturalHeight))} /></button> : <Image src={image.url} alt={image.alt} fill priority={false} sizes={sizes} draggable={false} />}
      </div>)}
    </div>
  </div>;
}
