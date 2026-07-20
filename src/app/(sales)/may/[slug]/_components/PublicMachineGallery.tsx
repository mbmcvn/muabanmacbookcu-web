"use client";

import Image from "next/image";
import { useState } from "react";
import type { PublicImage } from "@/models";

export function PublicMachineGallery({ images, title }: { images: PublicImage[]; title: string }) {
  const [selectedUrl, setSelectedUrl] = useState(images[0]?.url);
  const selected = images.find((image) => image.url === selectedUrl) ?? images[0];
  if (!selected) return null;
  return <section className="detail-gallery" aria-label={`Hình ảnh thực tế ${title}`}><div className="detail-main-image"><Image src={selected.url} alt={selected.alt} fill priority sizes="(max-width: 899px) calc(100vw - 32px), 55vw" /><span>Ảnh thực tế</span><output aria-live="polite">{images.findIndex((image) => image.url === selected.url) + 1} / {images.length} ảnh</output></div>{images.length > 1 ? <div className="detail-thumbnails" aria-label="Chọn ảnh hiển thị">{images.map((image, index) => <button key={image.url} type="button" aria-label={`Xem ảnh ${index + 1} của ${title}`} aria-pressed={image.url === selected.url} onClick={() => setSelectedUrl(image.url)}><Image src={image.url} alt="" fill sizes="88px" /><span>Ảnh {index + 1}</span></button>)}</div> : null}</section>;
}