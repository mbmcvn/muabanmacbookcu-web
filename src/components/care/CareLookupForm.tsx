import styles from "./CareLookupForm.module.css";
import type { FormEvent } from "react";

// Native GET submission preserves the entered value and lets /care own lookup.
// The required field prevents empty navigation without client state or API calls.
export function CareLookupForm({
  lookup = "", id = "care-lookup", className = "", maxLength,
  label = "Serial / MBMC Machine ID",
  placeholder = "Nhập Serial, MBMC-NSXS hoặc NSXS",
  helper = "Dùng Serial trên máy, MBMC Machine ID hoặc 4 ký tự cuối của mã.",
  autoCapitalize = "none",
  onSubmit,
  disabled = false,
}: {
  lookup?: string; id?: string; className?: string; maxLength?: number;
  label?: string; placeholder?: string; helper?: string; autoCapitalize?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
}) {
  return (
    <form method={onSubmit ? "post" : "get"} action={onSubmit ? undefined : "/care"} onSubmit={onSubmit} className={`${styles.form} ${className}`.trim()}>
      <label className={styles.field} htmlFor={id}>{label}</label>
      <div className={styles.control}>
        <div className={styles.inputArea}>
          <svg className={styles.searchIcon} aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 4.5 4.5" />
          </svg>
          <input id={id} name="lookup" defaultValue={lookup} placeholder={placeholder}
            required maxLength={maxLength} autoCapitalize={autoCapitalize} spellCheck={false}
            aria-describedby={`${id}-help`} />
        </div>
        <button className={styles.submit} type="submit" disabled={disabled}>{disabled ? "Đang tra cứu…" : "Tra cứu"}</button>
      </div>
      <p id={`${id}-help`} className={styles.formHelp}>{helper}</p>
    </form>
  );
}
