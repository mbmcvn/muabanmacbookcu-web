"use client";

export default function ErrorBoundary({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <main className="container page-shell"><h1>Đã có lỗi xảy ra</h1><p>Trang chưa thể hiển thị vào lúc này.</p><button type="button" onClick={() => unstable_retry()}>Thử lại</button></main>;
}
