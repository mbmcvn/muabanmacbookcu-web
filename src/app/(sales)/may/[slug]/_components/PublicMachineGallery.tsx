"use client";

import Image from "next/image";
import { useState } from "react";
import type { PublicMachineImage } from "@/models";
import { imageTypeLabel } from "./image-labels";

export function PublicMachineGallery({ images, title }: { images: PublicMachineImage[]; title: string }) {
  const [selectedId, setSelectedId] = useState(images.find((image) => image.isCover)?.id ?? images[0]?.id);
  const selected = images.find((image) => image.id === selectedId) ?? images[0];
  if (!selected) return null;
  return (
    <section className="detail-gallery" aria-label={`Hình ảnh thực tế ${title}`}>
      <div className="detail-main-image">
        <Image src={selected.url} alt={`${imageTypeLabel(selected.imageType)} của ${title}`} fill priority sizes="(max-width: 899px) calc(100vw - 32px), 55vw" />
        <span>{imageTypeLabel(selected.imageType)}</span>
        <output aria-live="polite">{images.findIndex((image) => image.id === selected.id) + 1} / {images.length} ảnh</output>
      </div>
      {images.length > 1 ? <div className="detail-thumbnails" aria-label="Chọn ảnh hiển thị">
        {images.map((image) => <button key={image.id} type="button" aria-label={`Xem ${imageTypeLabel(image.imageType).toLocaleLowerCase("vi")}`} aria-pressed={image.id === selected.id} onClick={() => setSelectedId(image.id)}><Image src={image.url} alt="" fill sizes="88px" /><span>{imageTypeLabel(image.imageType)}</span></button>)}
      </div> : null}
    </section>
  );
}
