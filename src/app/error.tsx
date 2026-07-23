"use client";

import { PageState } from "@/components/ui/PageState";

export default function ErrorBoundary({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <PageState as="main" className="container page-shell" title="Đã có lỗi xảy ra" titleAs="h1" description="Trang chưa thể hiển thị vào lúc này."><button type="button" onClick={() => unstable_retry()}>Thử lại</button></PageState>;
}
