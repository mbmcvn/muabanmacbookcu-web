import styles from "./CareLookupForm.module.css";

// Native GET submission preserves the entered value and lets /care own lookup.
// The required field prevents empty navigation without client state or API calls.
export function CareLookupForm({
  lookup = "", id = "care-lookup", className = "", maxLength,
  label = "Serial / MBMC Machine ID",
  placeholder = "Nhập Serial hoặc MBMC Machine ID",
  helper = "Dùng Serial trên thiết bị hoặc mã MBMC Machine ID để tìm hồ sơ công khai.",
  autoCapitalize = "none",
}: {
  lookup?: string; id?: string; className?: string; maxLength?: number;
  label?: string; placeholder?: string; helper?: string; autoCapitalize?: string;
}) {
  return (
    <form method="get" action="/care" className={`${styles.form} ${className}`.trim()}>
      <label className={styles.field} htmlFor={id}>
        <span>{label}</span>
        <input id={id} name="lookup" defaultValue={lookup} placeholder={placeholder}
          required maxLength={maxLength} autoCapitalize={autoCapitalize} spellCheck={false}
          aria-describedby={`${id}-help`} />
      </label>
      <button className={styles.submit} type="submit">Tra cứu</button>
      <p id={`${id}-help`} className={styles.formHelp}>{helper}</p>
    </form>
  );
}
