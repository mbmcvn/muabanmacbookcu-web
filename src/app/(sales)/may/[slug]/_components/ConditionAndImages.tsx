"use client";

import Image from "next/image";
import type { PublicImage } from "@/models";
import { usePublicMachineMedia } from "./PublicMachineMediaProvider";

function ImageGrid({ images, startIndex, onOpen }: { images: PublicImage[]; startIndex: number; onOpen: (index: number, opener: HTMLElement) => void }) {
  if (!images.length) return null;
  return <div className="evidence-grid">{images.map((image, index) => <figure key={image.url}><button type="button" onClick={(event) => onOpen(startIndex + index, event.currentTarget)} aria-label={`Mở ${image.alt} toàn màn hình`}><Image src={image.url} alt={image.alt} fill sizes="(max-width: 639px) calc(100vw - 32px), 33vw" /></button><figcaption>{image.alt}</figcaption></figure>)}</div>;
}

export function DetailedImages() {
  const { images: gallery, openLightbox } = usePublicMachineMedia();
  const images = gallery.slice(1);
  if (!images.length) return null;
  return <section className="detail-section" aria-labelledby="images-heading"><header><p className="eyebrow">Hình ảnh công khai</p><h2 id="images-heading">Quan sát thêm về chiếc máy</h2></header><ImageGrid images={images} startIndex={1} onOpen={openLightbox} /></section>;
}
