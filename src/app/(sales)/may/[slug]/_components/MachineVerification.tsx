import type { PublicMachineVerification, VerificationCode } from "@/models";
const LABELS: Record<VerificationCode, string> = { BOOT:"Khởi động", DISPLAY:"Màn hình", KEYBOARD:"Bàn phím", TRACKPAD:"Trackpad", BATTERY:"Pin", CAMERA:"Camera", MICROPHONE:"Micro", SPEAKERS:"Loa", WIFI:"Wi-Fi", BLUETOOTH:"Bluetooth", TOUCH_ID:"Touch ID", PORTS:"Cổng kết nối", CHARGING:"Sạc" };
export function MachineVerification({ items }: { items: PublicMachineVerification[] }) {
  if (items.length === 0) return null;
  return <section className="machine-verification" aria-labelledby="machine-verification-heading"><header><h2 id="machine-verification-heading">MBMC ĐÃ XÁC MINH</h2><p>Những hạng mục đã được MBMC trực tiếp kiểm tra.</p></header><ul>{items.map((item) => <li key={item.code}><span aria-hidden="true">✓</span>{LABELS[item.code]}</li>)}</ul></section>;
}
