export interface ContactChannel {
  kind: "phone" | "facebook" | "zalo";
  label: string;
  href: string;
}
