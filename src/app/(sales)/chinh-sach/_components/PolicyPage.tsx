import Link from "next/link";
import type { ReactNode } from "react";

export function PolicyPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <article className="container policy-page">
      <nav aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <span>Chính sách</span>
      </nav>
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      {children}
    </article>
  );
}
