import type { ReactNode } from "react";

export type PolicyHubIconName =
  | "archive"
  | "care"
  | "chat"
  | "collaborator"
  | "dealer"
  | "warranty";

const paths: Record<PolicyHubIconName, ReactNode> = {
  warranty: (
    <>
      <path d="m12 2 8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  care: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  ),
  archive: (
    <>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v4h4M9 12h6M9 16h4" />
    </>
  ),
  collaborator: (
    <>
      <path d="m8 12 2 2 4-4 2 2" />
      <path d="M2 9h4l3-3h3l3 3h7M2 15h4l3 3h6l3-3h4" />
    </>
  ),
  dealer: (
    <>
      <path d="M3 9h18l-2-5H5L3 9Z" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.4-4.2A9 9 0 1 1 21 12Z" />,
};

export function PolicyHubIcon({
  name,
  className,
}: {
  name: PolicyHubIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
