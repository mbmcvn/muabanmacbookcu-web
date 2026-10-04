import { CareLookupForm } from "@/components/care/CareLookupForm";
import styles from "./HomeCareEntry.module.css";

export function HomeCareEntry() {
  return (
    <section className={`container ${styles.entry}`} aria-labelledby="home-care-title">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>MBMC CARE</p>
        <h2 id="home-care-title">Tra cứu Care</h2>
        <p>Tra cứu hồ sơ máy, bảo hành và báo cáo kiểm tra công khai.</p>
      </div>
      <CareLookupForm id="home-care-lookup" className={styles.form}
        label="Serial / MBMC Machine ID / 4 ký tự"
        placeholder="Serial / MBMC Machine ID / 4 ký tự"
        helper="Bạn có thể dùng Serial trên thiết bị, MBMC Machine ID hoặc 4 ký tự cuối của mã." />
    </section>
  );
}
