export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("84") && digits.length === 11
    ? `0${digits.slice(2)}`
    : digits;
}

export function normalizeVietnamesePhone(value: string): string | null {
  const normalized = normalizePhone(value);
  return /^0(?:3|5|7|8|9)\d{8}$/.test(normalized) ? normalized : null;
}
