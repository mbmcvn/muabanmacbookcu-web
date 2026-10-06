/** Clipboard access can be absent on HTTP mobile previews or denied by the browser. */
export async function copyText(value: string): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function") {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch { /* Try the user-initiated legacy copy path before reporting failure. */ }
  if (typeof document === "undefined" || typeof document.execCommand !== "function") {
    throw new Error("Copy unavailable");
  }
  const previousFocus = document.activeElement;
  const input = document.createElement("textarea");
  input.value = value;
  input.readOnly = true;
  input.setAttribute("aria-hidden", "true");
  input.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
  document.body.appendChild(input);
  try {
    input.select();
    input.setSelectionRange(0, value.length);
    if (!document.execCommand("copy")) throw new Error("Copy unavailable");
  } finally {
    input.remove();
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  }
}
