import { Suspense } from "react";
import { ContextReturnBar } from "@/components/layout/ContextReturnBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./sales-bottom-stack.css";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <ContextReturnBar />
      </Suspense>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
