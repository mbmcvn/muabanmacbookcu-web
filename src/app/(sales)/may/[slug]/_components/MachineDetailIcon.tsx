type MachineDetailIconName =
  | "accessories"
  | "battery"
  | "condition"
  | "help"
  | "images"
  | "model"
  | "passport"
  | "published"
  | "status"
  | "trust";

const paths: Record<MachineDetailIconName, React.ReactNode> = {
  accessories: <><path d="M8 3v5M16 3v5M6 8h12v2a6 6 0 0 1-5 5.91V21h-2v-5.09A6 6 0 0 1 6 10V8Z"/><path d="M8 19h8"/></>,
  battery: <><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 1h4M9 7h6v10H9z"/></>,
  condition: <><path d="M7 3h8l3 3v15H7z"/><path d="M15 3v4h4M10 12h5M10 16h3"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.6 1.9c-.9.6-1.4 1.1-1.4 2.1M12 17h.01"/></>,
  images: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
  model: <><rect x="4" y="3" width="12" height="15" rx="2"/><path d="M8 7h4M8 11h5M8 15h3"/><rect x="9" y="8" width="11" height="13" rx="2"/></>,
  passport: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M5 16c.8-1.4 1.8-2 3-2s2.2.6 3 2M14 9h4M14 13h4"/></>,
  published: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
  status: <><path d="m12 2 8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  trust: <><path d="m12 2 8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
};

export function MachineDetailIcon({ name, className }: { name: MachineDetailIconName; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
