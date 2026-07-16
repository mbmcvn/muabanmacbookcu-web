import Link from "next/link";

export default function PublicMachineNotFound() {
  return <div className="container public-detail-page"><h1>Không tìm thấy máy</h1><p>Máy này không tồn tại hoặc không còn được công khai.</p><Link href="/may-dang-co">Quay lại máy đang có</Link></div>;
}
