import Image from "next/image";
import type { PublicImage, PublicMachineDetailV1 } from "@/models";

function ImageGrid({ images }: { images: PublicImage[] }) {
  if (!images.length) return null;
  return <div className="evidence-grid">{images.map((image, index) => <figure key={image.url}><div><Image src={image.url} alt={image.alt} fill sizes="(max-width: 639px) calc(100vw - 32px), 33vw" /></div><figcaption>Ảnh thực tế {index + 1}</figcaption></figure>)}</div>;
}

export function RealCondition({ machine }: { machine: PublicMachineDetailV1 }) {
  const summary = machine.summary;
  return <section className="detail-section condition-section" aria-labelledby="condition-heading"><header><p className="eyebrow">Chi tiết ngoại hình</p><h2 id="condition-heading">Mô tả trung thực</h2></header>{summary.cosmeticGrade ? <p className="condition-rank">Xếp hạng ngoại hình <strong>{summary.cosmeticGrade}</strong></p> : null}<p className="condition-copy">{summary.conditionSummary}</p></section>;
}

export function DetailedImages({ machine }: { machine: PublicMachineDetailV1 }) {
  const images = machine.gallery.slice(1);
  if (!images.length) return null;
  return <section className="detail-section" aria-labelledby="images-heading"><header><p className="eyebrow">Kiểm tra bằng hình ảnh</p><h2 id="images-heading">Quan sát từng phần của máy</h2></header><ImageGrid images={images} /></section>;
}