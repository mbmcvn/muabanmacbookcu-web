import type { MachineImage } from "@/models";

export function MachineGallery({ images }: { images: MachineImage[] }) { return <section className="machine-gallery" aria-label="Hình ảnh máy"><p>{images.length ? `${images.length} hình ảnh minh họa` : "Chưa có hình ảnh"}</p></section>; }
