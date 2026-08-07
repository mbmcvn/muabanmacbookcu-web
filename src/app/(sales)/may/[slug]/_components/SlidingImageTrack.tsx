"use client";

import { useEffect, useRef } from "react";
import { MachineImage } from "@/components/machine/MachineImage";
import type { PublicImage } from "@/models";
import { resistGalleryDrag, resolveGalleryDragIndex } from "./gallery-navigation";
import { classifyGalleryImageShape, type GalleryImageShape } from "./gallery-image-shape";
import {
  clampInspectionTransform,
  DOUBLE_TAP_INSPECTION_SCALE,
  MIN_INSPECTION_SCALE,
  type InspectionTransform,
} from "./image-inspection-transform";

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

interface TouchPoint { x: number; y: number }

interface PinchSession {
  distance: number;
  midpoint: TouchPoint;
  transform: InspectionTransform;
}

interface PanSession {
  point: TouchPoint;
  transform: InspectionTransform;
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
  const inspectionFrameRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const transformRef = useRef<InspectionTransform>({ scale: 1, x: 0, y: 0 });
  const touchesRef = useRef(new Map<number, TouchPoint>());
  const pinchRef = useRef<PinchSession | null>(null);
  const panRef = useRef<PanSession | null>(null);
  const lastTapRef = useRef<{ time: number; point: TouchPoint } | null>(null);

  const activeImage = () => viewportRef.current?.querySelector<HTMLImageElement>('.carousel-slide[aria-hidden="false"] img') ?? null;

  const imageMetrics = () => {
    const viewport = viewportRef.current;
    const image = activeImage();
    return {
      viewportWidth: viewport?.clientWidth ?? 1,
      viewportHeight: viewport?.clientHeight ?? 1,
      naturalWidth: image?.naturalWidth ?? 1,
      naturalHeight: image?.naturalHeight ?? 1,
    };
  };

  const renderInspectionTransform = (next: InspectionTransform, animate = false) => {
    const transform = clampInspectionTransform(next, imageMetrics());
    transformRef.current = transform;
    if (inspectionFrameRef.current !== null) cancelAnimationFrame(inspectionFrameRef.current);
    inspectionFrameRef.current = requestAnimationFrame(() => {
      const image = activeImage();
      if (image) {
        image.style.transition = animate ? "transform 180ms ease-out" : "none";
        image.style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`;
      }
      inspectionFrameRef.current = null;
    });
  };

  const resetInspectionTransform = () => {
    if (inspectionFrameRef.current !== null) cancelAnimationFrame(inspectionFrameRef.current);
    inspectionFrameRef.current = null;
    transformRef.current = { scale: 1, x: 0, y: 0 };
    touchesRef.current.clear();
    pinchRef.current = null;
    panRef.current = null;
    viewportRef.current?.querySelectorAll<HTMLImageElement>(".carousel-slide img").forEach((image) => {
      image.style.transition = "none";
      image.style.transform = "";
    });
  };

  const setTrackPosition = (distanceX = 0, animate = true) => {
    const track = trackRef.current;
    if (!track) return;
    track.dataset.dragging = animate ? "false" : "true";
    track.style.transform = `translate3d(calc(${-index * 100}% + ${distanceX}px), 0, 0)`;
  };

  useEffect(() => {
    setTrackPosition(0, true);
    if (variant === "lightbox") resetInspectionTransform();
  }, [index, variant]);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    if (inspectionFrameRef.current !== null) cancelAnimationFrame(inspectionFrameRef.current);
  }, []);

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

  const startNavigationPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, velocityX: 0, horizontal: null, moved: false };
    setTrackPosition(0, false);
  };

  const midpoint = (first: TouchPoint, second: TouchPoint): TouchPoint => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
  const distance = (first: TouchPoint, second: TouchPoint) => Math.hypot(second.x - first.x, second.y - first.y);

  const finishInspectionTouch = (event: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const wasPinching = pinchRef.current !== null;
    const navigationSession = pointerRef.current;
    touchesRef.current.delete(event.pointerId);

    if (wasPinching) {
      suppressClickRef.current = true;
      pinchRef.current = null;
      pointerRef.current = null;
      const remaining = [...touchesRef.current.values()][0];
      panRef.current = remaining && transformRef.current.scale > MIN_INSPECTION_SCALE
        ? { point: remaining, transform: { ...transformRef.current } }
        : null;
      return;
    }

    if (panRef.current) {
      panRef.current = null;
      pointerRef.current = null;
      return;
    }

    if (navigationSession?.id === event.pointerId) finishPointer(event);
    if (cancelled || navigationSession?.moved) return;

    const point = { x: event.clientX, y: event.clientY };
    const previousTap = lastTapRef.current;
    lastTapRef.current = { time: event.timeStamp, point };
    if (!previousTap || event.timeStamp - previousTap.time > 300 || distance(previousTap.point, point) > 32) return;
    lastTapRef.current = null;
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (transformRef.current.scale > MIN_INSPECTION_SCALE) {
      renderInspectionTransform({ scale: 1, x: 0, y: 0 }, true);
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const localX = point.x - rect.left - rect.width / 2;
    const localY = point.y - rect.top - rect.height / 2;
    renderInspectionTransform({
      scale: DOUBLE_TAP_INSPECTION_SCALE,
      x: -localX * (DOUBLE_TAP_INSPECTION_SCALE - 1),
      y: -localY * (DOUBLE_TAP_INSPECTION_SCALE - 1),
    }, true);
  };

  return <div
    ref={viewportRef}
    className={`carousel-viewport carousel-viewport-${variant}`}
    onPointerDown={(event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      if (variant !== "lightbox" || event.pointerType !== "touch") {
        startNavigationPointer(event);
        return;
      }
      const point = { x: event.clientX, y: event.clientY };
      touchesRef.current.set(event.pointerId, point);
      const touches = [...touchesRef.current.values()];
      if (touches.length === 2) {
        pointerRef.current = null;
        panRef.current = null;
        setTrackPosition(0, true);
        pinchRef.current = { distance: Math.max(1, distance(touches[0], touches[1])), midpoint: midpoint(touches[0], touches[1]), transform: { ...transformRef.current } };
      } else if (transformRef.current.scale > MIN_INSPECTION_SCALE) {
        panRef.current = { point, transform: { ...transformRef.current } };
      } else {
        startNavigationPointer(event);
      }
    }}
    onPointerMove={(event) => {
      if (variant === "lightbox" && event.pointerType === "touch") {
        if (!touchesRef.current.has(event.pointerId)) return;
        touchesRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const touches = [...touchesRef.current.values()];
        if (pinchRef.current && touches.length >= 2) {
          const currentMidpoint = midpoint(touches[0], touches[1]);
          const nextScale = pinchRef.current.transform.scale * distance(touches[0], touches[1]) / pinchRef.current.distance;
          const ratio = nextScale / pinchRef.current.transform.scale;
          const viewport = viewportRef.current;
          if (!viewport) return;
          const rect = viewport.getBoundingClientRect();
          const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          renderInspectionTransform({
            scale: nextScale,
            x: currentMidpoint.x - center.x - (pinchRef.current.midpoint.x - center.x - pinchRef.current.transform.x) * ratio,
            y: currentMidpoint.y - center.y - (pinchRef.current.midpoint.y - center.y - pinchRef.current.transform.y) * ratio,
          });
          return;
        }
        if (panRef.current && transformRef.current.scale > MIN_INSPECTION_SCALE) {
          renderInspectionTransform({
            scale: panRef.current.transform.scale,
            x: panRef.current.transform.x + event.clientX - panRef.current.point.x,
            y: panRef.current.transform.y + event.clientY - panRef.current.point.y,
          });
          return;
        }
      }
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
    onPointerUp={(event) => variant === "lightbox" && event.pointerType === "touch" ? finishInspectionTouch(event) : finishPointer(event)}
    onPointerCancel={(event) => variant === "lightbox" && event.pointerType === "touch" ? finishInspectionTouch(event, true) : finishPointer(event)}
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
        ><MachineImage image={image} variant="display" fill priority={variant === "gallery" && imageIndex === 0} sizes={sizes} draggable={false} onLoadingComplete={(element) => onImageShape?.(imageIndex, classifyGalleryImageShape(element.naturalWidth, element.naturalHeight))} /></button> : <MachineImage image={image} variant="full" fill priority={false} sizes={sizes} draggable={false} />}
      </div>)}
    </div>
  </div>;
}
