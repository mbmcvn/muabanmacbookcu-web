import "server-only";
import QRCode from "qrcode";

export function canonicalCareReportUrl(reportId: string) {
  if (!/^dcr_[A-Za-z0-9_-]{24}$/.test(reportId)) throw new Error("Invalid report ID");
  return `https://mbmc.vn/care/report/${reportId}`;
}

export async function careReportQr(reportId: string) {
  return QRCode.toDataURL(canonicalCareReportUrl(reportId), {
    errorCorrectionLevel: "M", margin: 4, width: 232,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
