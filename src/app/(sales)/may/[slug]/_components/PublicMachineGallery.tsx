"use client";

import Image from "next/image";
import { useState } from "react";
import { usePublicMachineMedia } from "./PublicMachineMediaProvider";
import { SlidingImageTrack } from "./SlidingImageTrack";
import type { GalleryImageShape } from "./gallery-image-shape";

export function PublicMachineGallery({ title }: { title: string }) {
  const { images, index, select, previous, next, openLightbox } = usePublicMachineMedia();
  const [imageShapes, setImageShapes] = useState<Record<number, GalleryImageShape>>({});
  const selected = images[index];
  if (!selected) return null;
  return <section
    className="detail-gallery"
    aria-label={`Hình ảnh thực tế ${title}`}
    tabIndex={0}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
      if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    }}
  >
    <div className={`detail-main-image${imageShapes[index] === "square" ? " detail-main-image-square" : ""}`}>
      <SlidingImageTrack images={images} index={index} onSelect={select} onOpen={openLightbox} sizes="(max-width: 480px) 100vw, (max-width: 899px) calc(100vw - 32px), 55vw" variant="gallery" onImageShape={(imageIndex, shape) => setImageShapes((current) => current[imageIndex] === shape ? current : { ...current, [imageIndex]: shape })} />
      {images.length > 1 ? <><button className="gallery-previous" type="button" onClick={previous} disabled={index === 0} aria-label="Ảnh trước">‹</button><button className="gallery-next" type="button" onClick={next} disabled={index === images.length - 1} aria-label="Ảnh tiếp theo">›</button></> : null}
      <button className="gallery-fullscreen" type="button" onClick={(event) => openLightbox(index, event.currentTarget)} aria-label="Xem ảnh toàn màn hình">⛶</button>
      <output aria-live="polite">{index + 1} / {images.length} ảnh</output>
    </div>
    {images.length > 1 ? <div className="detail-thumbnails" aria-label="Chọn ảnh hiển thị">{images.map((image, imageIndex) => <button key={image.url} type="button" aria-label={`Xem ảnh ${imageIndex + 1} của ${title}`} aria-pressed={imageIndex === index} onClick={() => select(imageIndex)}><Image src={image.url} alt="" fill sizes="88px" /><span>{image.alt}</span></button>)}</div> : null}
  </section>;
}
