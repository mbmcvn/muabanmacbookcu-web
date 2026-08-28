"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { PublicCareImage } from "@/data/care/care-contract";
import { galleryDisclosureLabel } from "@/data/care/care-gallery";
import styles from "./care.module.css";

export function CarePublicImageGallery({
  images,
  representativeVisible,
}: {
  images: readonly PublicCareImage[];
  representativeVisible: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const galleryId = useId();
  const label = galleryDisclosureLabel(images.length, representativeVisible);
  if (!label) return null;

  return (
    <div className={styles.galleryDisclosure}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={galleryId}
        onClick={() => setExpanded((value) => !value)}
      >
        {label}
        <span
          className={expanded ? styles.galleryChevronOpen : ""}
          aria-hidden="true"
        >
          ↓
        </span>
      </button>
      {expanded && (
        <div id={galleryId} className={styles.galleryPanel}>
          <p>
            Ảnh công khai trước thời điểm bán, dùng làm điểm neo đối chiếu ngoại
            hình của máy.
          </p>
          <div className={styles.galleryGrid}>
            {images.map((image, index) => (
              <figure key={`${image.url}-${index}`}>
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={image.width ?? 1200}
                  height={image.height ?? 900}
                  sizes="(max-width: 32rem) 100vw, (max-width: 68rem) 50vw, 22rem"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
