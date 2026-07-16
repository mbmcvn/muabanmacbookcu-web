import Link from "next/link";

export function MachineBreadcrumbs({ name }: { name: string }) { return <nav aria-label="Đường dẫn"><Link href="/may-dang-co">Máy đang có</Link> / <span>{name}</span></nav>; }
