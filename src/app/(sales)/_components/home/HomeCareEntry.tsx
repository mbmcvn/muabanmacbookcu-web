import { CareLookupForm } from "@/components/care/CareLookupForm";
import styles from "./HomeCareEntry.module.css";

export function HomeCareEntry() {
  return (
    <section className={`container ${styles.entry}`} aria-labelledby="home-care-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>MBMC CARE</p>
        <h2 id="home-care-title">Tra cứu Care</h2>
        <p>Mở hồ sơ máy, bảo hành và báo cáo kiểm tra công khai bằng Serial hoặc MBMC Machine ID.</p>
      </div>
      <CareLookupForm id="home-care-lookup" className={styles.form} />
      <div className={styles.machinePeek} aria-hidden="true" />
    </section>
  );
}
