"use client";

import { useEffect, useState } from "react";

export type ContactChannel = "zalo" | "messenger" | null;

const STORAGE_KEY = "mbmc_contact_channel";
const contacts = {
  zalo: { url: "https://zalo.me/0326147088", label: "Nhắn MBMC trên Zalo" },
  messenger: { url: "https://m.me/61592174842507", label: "Nhắn MBMC trên Messenger" },
} as const;

function parseContactChannel(value: string | null): ContactChannel {
  return value === "zalo" || value === "messenger" ? value : null;
}

export function withContactChannel(pathname: string, channel: ContactChannel): string {
  if (!channel) return pathname;
  return `${pathname}${pathname.includes("?") ? "&" : "?"}channel=${channel}`;
}

export function useContactChannel() {
  const [channel, setChannel] = useState<ContactChannel>(null);

  useEffect(() => {
    const urlValue = new URLSearchParams(window.location.search).get("channel");
    const urlChannel = parseContactChannel(urlValue);
    let nextChannel: ContactChannel = "zalo";
    if (urlChannel) {
      localStorage.setItem(STORAGE_KEY, urlChannel);
      nextChannel = urlChannel;
    } else if (urlValue === null) {
      nextChannel = parseContactChannel(localStorage.getItem(STORAGE_KEY)) ?? "zalo";
    }
    const timeout = window.setTimeout(() => setChannel(nextChannel), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  return {
    channel,
    contactUrl: contacts[channel ?? "zalo"].url,
    contactLabel: contacts[channel ?? "zalo"].label,
  };
}
