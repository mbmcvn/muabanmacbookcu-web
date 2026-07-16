import type { ContactChannel } from "@/models";

export function ContactChannelList({ channels }: { channels: ContactChannel[] }) {
  return (
    <ul className="contact-channels">
      {channels.map((channel) => (
        <li key={channel.kind}>
          <a href={channel.href}>{channel.label}</a>
        </li>
      ))}
    </ul>
  );
}
