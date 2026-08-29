import { notFound, redirect } from "next/navigation";
import { readCurrentCareAccess } from "@/data/care/care-access.server";
import { getPublicCarePassport } from "@/data/care/care-repository.server";
import { ResaleDemandForm } from "./ResaleDemandForm";
import styles from "../support/support.module.css";
export const dynamic = "force-dynamic";
export default async function CareResalePage({
  params,
}: {
  params: Promise<{ machine_id: string }>;
}) {
  const { machine_id } = await params;
  const access = await readCurrentCareAccess(machine_id);
  if (!access) redirect(`/care/${encodeURIComponent(machine_id)}`);
  const passport = await getPublicCarePassport(machine_id, access);
  if (!passport) notFound();
  const configuration = [
    passport.configuration.chip,
    passport.configuration.ramGb && `${passport.configuration.ramGb}GB RAM`,
    passport.configuration.ssdGb && `${passport.configuration.ssdGb}GB SSD`,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.machine}>
          <p className={styles.eyebrow}>Bán lại / lên đời</p>
          <h1>{passport.model ?? passport.machineCode}</h1>
          <p>
            {passport.machineCode} · {configuration}
          </p>
        </header>
        <ResaleDemandForm machineCode={passport.machineCode} />
      </div>
    </main>
  );
}
