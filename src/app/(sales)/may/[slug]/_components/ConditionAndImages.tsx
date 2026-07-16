import Image from "next/image";
import type { PublicMachineDetail, PublicMachineImage } from "@/models";
import { imageTypeLabel } from "./image-labels";

function ImageGrid({ images, title }: { images: PublicMachineImage[]; title: string }) {
  if (!images.length) return null;
  return <div className="evidence-grid">{images.map((image) => <figure key={image.id}><div><Image src={image.url} alt={`${imageTypeLabel(image.imageType)} của ${title}`} fill sizes="(max-width: 639px) calc(100vw - 32px), 33vw" /></div><figcaption>{imageTypeLabel(image.imageType)}</figcaption></figure>)}</div>;
}

export function RealCondition({ machine }: { machine: PublicMachineDetail }) {
  const defects = machine.images.filter((image) => image.imageType === "defect");
  if (!machine.conditionSummary && machine.conditionRank === null && defects.length === 0) return null;
  return <section className="detail-section condition-section" aria-labelledby="condition-heading"><header><p className="eyebrow">Chi tiết ngoại hình</p><h2 id="condition-heading">Mô tả trung thực</h2></header>{machine.conditionRank ? <p className="condition-rank">Xếp hạng ngoại hình <strong>{machine.conditionRank}</strong></p> : null}{machine.conditionSummary ? <p className="condition-copy">{machine.conditionSummary}</p> : null}{defects.length ? <><h3>Điểm cần lưu ý</h3><ImageGrid images={defects} title={machine.title} /></> : null}</section>;
}

export function DetailedImages({ machine }: { machine: PublicMachineDetail }) {
  const images = machine.images.filter((image) => !image.isCover && image.imageType !== "defect");
  if (!images.length) return null;
  return <section className="detail-section" aria-labelledby="images-heading"><header><p className="eyebrow">Kiểm tra bằng hình ảnh</p><h2 id="images-heading">Quan sát từng phần của máy</h2></header><ImageGrid images={images} title={machine.title} /></section>;
}
