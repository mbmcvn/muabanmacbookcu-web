import type { ContactChannel } from "@/models";
import { ContactChannelList } from "./ContactChannelList";

export function ContactCTA({ channels }: { channels: ContactChannel[] }) {
  return (
    <section aria-labelledby="contact-title">
      <h2 id="contact-title">Trao đổi với MBMC</h2>
      <p>Liên hệ để được tư vấn và xác nhận tình trạng máy trước khi đặt cọc.</p>
      <ContactChannelList channels={channels} />
    </section>
  );
}
