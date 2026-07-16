import Link from "next/link";

export default function NotFound() {
  return <main className="container page-shell"><h1>Không tìm thấy trang</h1><p>Địa chỉ này không tồn tại hoặc đã thay đổi.</p><Link href="/may-dang-co">Xem máy đang có</Link></main>;
}
