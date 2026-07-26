import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getSupportMachine,
  SupportMachineNotFoundError,
} from "@/data/support/support-api.server";
import { SupportTicketWizard } from "./SupportTicketWizard";
import styles from "./support.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Báo vấn đề với máy",
  description: "Gửi yêu cầu hỗ trợ cho một thiết bị MBMC.",
  robots: { index: false, follow: false },
};
export default async function SupportPage({
  params,
}: {
  params: Promise<{ machine_id: string }>;
}) {
  const { machine_id } = await params;
  let machine;
  try {
    machine = await getSupportMachine(machine_id);
  } catch (error) {
    if (error instanceof SupportMachineNotFoundError) notFound();
    throw error;
  }
  return (
    <main className={styles.page}>
      <SupportTicketWizard machine={machine} />
    </main>
  );
}
