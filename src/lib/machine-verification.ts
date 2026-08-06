export const VERIFICATION_CODES = ["BOOT", "DISPLAY", "KEYBOARD", "TRACKPAD", "BATTERY", "CAMERA", "MICROPHONE", "SPEAKERS", "WIFI", "BLUETOOTH", "TOUCH_ID", "PORTS", "CHARGING"] as const;
export type VerificationCode = (typeof VERIFICATION_CODES)[number];
export type MachineVerificationItem = { code: VerificationCode; verified: boolean; verifiedAt: string | null; public: boolean };
export type PublicMachineVerification = { code: VerificationCode; verified: true; verifiedAt: string | null };
const VERIFICATION_CODE_SET = new Set<string>(VERIFICATION_CODES);
export function isVerificationCode(value: unknown): value is VerificationCode { return typeof value === "string" && VERIFICATION_CODE_SET.has(value); }
export function publicMachineVerifications(items: readonly MachineVerificationItem[]): PublicMachineVerification[] {
  const latestByCode = new Map<VerificationCode, MachineVerificationItem>();
  for (const item of items) {
    if (!isVerificationCode(item.code) || item.public !== true) continue;
    const current = latestByCode.get(item.code);
    const itemTime = Date.parse(item.verifiedAt ?? "");
    const currentTime = Date.parse(current?.verifiedAt ?? "");
    if (!current || (Number.isFinite(itemTime) ? itemTime : 0) >= (Number.isFinite(currentTime) ? currentTime : 0)) latestByCode.set(item.code, item);
  }
  return VERIFICATION_CODES.flatMap((code) => { const item = latestByCode.get(code); return item?.verified === true ? [{ code, verified: true, verifiedAt: item.verifiedAt }] : []; });
}
