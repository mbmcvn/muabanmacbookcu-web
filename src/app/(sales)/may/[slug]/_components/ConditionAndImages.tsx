"use client";

import { MachineImage } from "@/components/machine/MachineImage";
import type { PublicImage } from "@/models";
import { usePublicMachineMedia } from "./PublicMachineMediaProvider";

function ImageGrid({ images, startIndex, onOpen }: { images: PublicImage[]; startIndex: number; onOpen: (index: number, opener: HTMLElement) => void }) {
  if (!images.length) return null;
  return <div className="evidence-grid">{images.map((image, index) => <figure key={image.url}><button type="button" onClick={(event) => onOpen(startIndex + index, event.currentTarget)} aria-label={`Mở ${image.alt} toàn màn hình`}><MachineImage image={image} variant="card" fill sizes="(max-width: 639px) calc(100vw - 32px), 33vw" /></button><figcaption>{image.alt}</figcaption></figure>)}</div>;
}

export function DetailedImages() {
  const { images: gallery, openLightbox } = usePublicMachineMedia();
  const images = gallery.slice(1);
  if (!images.length) return null;
  return <section className="detail-section supporting-images" aria-labelledby="images-heading"><details className="supporting-images-disclosure"><summary><span><span className="eyebrow">Hình ảnh công khai</span><strong id="images-heading">Quan sát thêm về chiếc máy</strong></span><span className="supporting-images-disclosure__action">Xem {images.length} ảnh công khai khác <span aria-hidden="true">⌄</span></span></summary><div className="supporting-images-disclosure__content"><ImageGrid images={images} startIndex={1} onOpen={openLightbox} /></div></details></section>;
}
