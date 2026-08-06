import Link from "next/link";
import type { ReactNode } from "react";

export type PolicyMetric = Readonly<{ value: string; label: string }>;
export type PolicyAction = Readonly<{ href: string; label: string }>;

export function PolicyPage({
  eyebrow,
  title,
  description,
  badge,
  metrics = [],
  actions = [],
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
  metrics?: readonly PolicyMetric[];
  actions?: readonly PolicyAction[];
  children: ReactNode;
}) {
  return (
    <article className="container policy-page">
      <nav className="policy-breadcrumbs" aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span aria-hidden="true">/</span>
        <Link href="/chinh-sach">Chính sách</Link>
      </nav>
      <header className="policy-hero">
        <div className="policy-hero-heading">
          <p className="eyebrow">{eyebrow}</p>
          {badge ? <span className="policy-version-badge">{badge}</span> : null}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        {metrics.length ? (
          <dl className="policy-metrics">
            {metrics.map((metric) => (
              <div key={`${metric.value}-${metric.label}`}>
                <dt>{metric.value}</dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>
      <div className="policy-content">{children}</div>
      {actions.length ? (
        <footer className="policy-footer">
          <p>Tìm hiểu thêm</p>
          <nav aria-label="Liên kết chính sách liên quan">
            {actions.map((action) => (
              <Link key={action.href} href={action.href}>
                {action.label}
              </Link>
            ))}
          </nav>
        </footer>
      ) : null}
    </article>
  );
}

export function PolicySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

export function ResponsivePolicyTable({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="policy-table-scroll"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
