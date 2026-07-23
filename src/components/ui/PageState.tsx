import type { ReactNode } from "react";

type PageStateProps = {
  as?: "div" | "main" | "section";
  className?: string;
  role?: "status";
  title?: string;
  titleAs?: "h1" | "h2";
  description?: string;
  children?: ReactNode;
};

export function PageState({
  as: Container = "section",
  className,
  role,
  title,
  titleAs: Title = "h2",
  description,
  children,
}: PageStateProps) {
  return (
    <Container className={className} role={role}>
      {title ? <Title>{title}</Title> : null}
      {description ? <p>{description}</p> : null}
      {children}
    </Container>
  );
}
