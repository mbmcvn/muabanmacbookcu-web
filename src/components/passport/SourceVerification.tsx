import type { SourceVerification as SourceVerificationModel } from "@/models";

export function SourceVerification({ source }: { source: SourceVerificationModel }) {
  return <section><h3>Nguồn xác minh</h3><p>{source.verified ? "Đã xác minh" : "Chưa xác minh"}: {source.label}</p>{source.note ? <p>{source.note}</p> : null}</section>;
}
