import { Suspense } from "react";
import { ExplorationMode } from "@/components/ctv/ExplorationMode";
import "./sales-experience.css";
export default function SalesTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense>
        <ExplorationMode />
      </Suspense>
      {children}
    </>
  );
}
