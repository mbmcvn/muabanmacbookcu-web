import { type DesktopDiagnosticId, type DesktopDiagnosticOutcome, type DesktopFindingId } from "./desktop-device-check/contracts";
export type DesktopReportHighlight = {
    diagnostic_id: DesktopDiagnosticId;
    finding_id: DesktopFindingId | null;
    title: Readonly<{
        vi: string;
        en: string;
    }>;
    outcome: "warning" | "failed" | "unknown";
    outcome_label: Readonly<{
        vi: string;
        en: string;
    }>;
};
