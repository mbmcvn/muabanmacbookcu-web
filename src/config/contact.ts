import type { ContactChannel } from "@/models";

export const contactChannels: ContactChannel[] = [
  { kind: "facebook", label: "Liên hệ MBMC", href: "mailto:?subject=Liên hệ MBMC" },
];

export const phoneContact = contactChannels.find((channel) => channel.href.startsWith("tel:")) ?? null;

export function buildMachineContactHref(machineId: string, title: string): string {
  const subject = `Quan tâm máy ${machineId}`;
  const body = `Tôi đang quan tâm ${machineId} – ${title}.`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
