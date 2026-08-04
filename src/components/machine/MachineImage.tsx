"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { isMbmcPublicImage, isSafeImageSource } from "@/lib/images/mbmc-public-image";

type MachineImageProps = Omit<ImageProps, "src" | "unoptimized" | "onError"> & {
  src?: string | null;
};

/** Canonical rendering boundary for public commercial machine images. */
export function MachineImage({ src, alt, ...props }: MachineImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if ((typeof src === "string" && failedSrc === src) || !isSafeImageSource(src)) {
    return <span className="machine-image-fallback" role="img" aria-label={alt || "Hình ảnh máy chưa sẵn sàng"}><span aria-hidden="true">MBMC</span></span>;
  }

  return <Image {...props} src={src} alt={alt} unoptimized={isMbmcPublicImage(src)} onError={() => setFailedSrc(src)} />;
}
