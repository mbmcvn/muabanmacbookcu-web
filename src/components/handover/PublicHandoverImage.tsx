"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isMbmcPublicMediaUrl } from "@/lib/images/mbmc-public-media";
import styles from "./PublicHandoverImage.module.css";

type PublicHandoverImageProps = Omit<ImageProps, "src" | "unoptimized" | "onError"> & {
  src: string;
};

/** Canonical delivery boundary for public Care and handover media. */
export function PublicHandoverImage({ src, alt, ...props }: PublicHandoverImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src) {
    return (
      <span
        className={styles.fallback}
        {...(alt
          ? { role: "img", "aria-label": alt }
          : { "aria-hidden": true })}
      >
        <span aria-hidden="true">MBMC</span>
      </span>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={isMbmcPublicMediaUrl(src)}
      onError={() => setFailedSrc(src)}
    />
  );
}
