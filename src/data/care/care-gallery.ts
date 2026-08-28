export function galleryDisclosureLabel(
  imageCount: number,
  representativeVisible: boolean,
) {
  if (imageCount === 0 || (representativeVisible && imageCount === 1)) {
    return null;
  }
  return representativeVisible
    ? "Xem toàn bộ ảnh lúc rao bán"
    : "Xem ảnh máy lúc rao bán";
}
