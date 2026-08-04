"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import type { PublicImage } from "@/models";
import {
  isMbmcPublicImage,
  resolvePublicMachineImage,
  type PublicMachineImageVariant,
} from "@/lib/images/mbmc-public-image";

type MachineImageProps = Omit<
  ImageProps,
  "src" | "unoptimized" | "onError" | "alt" | "width" | "height"
> & {
  image: PublicImage;
  variant: PublicMachineImageVariant;
  alt?: string;
  width?: ImageProps["width"];
  height?: ImageProps["height"];
};

/** Canonical rendering boundary for public commercial machine images. */
export function MachineImage({
  image,
  variant,
  alt = image.alt,
  width,
  height,
  ...props
}: MachineImageProps) {
  const resolved = resolvePublicMachineImage(image, variant);
  const src = resolved?.url ?? null;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className="machine-image-fallback"
        role="img"
        aria-label={alt || "Hình ảnh máy chưa sẵn sàng"}
      >
        <span aria-hidden="true">MBMC</span>
      </span>
    );
  }

  const intrinsicDimensions = !props.fill && resolved?.width && resolved.height
    ? { width: width ?? resolved.width, height: height ?? resolved.height }
    : { ...(width ? { width } : {}), ...(height ? { height } : {}) };

  return (
    <Image
      {...props}
      {...intrinsicDimensions}
      src={src}
      alt={alt}
      unoptimized={isMbmcPublicImage(src)}
      onError={() => setFailedSrc(src)}
    />
  );
}
