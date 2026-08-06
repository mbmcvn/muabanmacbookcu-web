import type { Metadata } from "next";
import {
  PolicyPage,
  PolicySection,
  ResponsivePolicyTable,
} from "../_components/PolicyPage";

export const metadata: Metadata = { title: "MBMC Care | MBMC" };

const metrics = [
  { value: "01 tháng", label: "Bảo hành mặc định" },
  { value: "03 tháng", label: "Tổng thời hạn với Care 3" },
  { value: "06 tháng", label: "Tổng thời hạn với Care 6" },
] as const;

export default function MbmcCarePolicyPage() {
  return (
    <PolicyPage
      eyebrow="Chăm sóc mở rộng"
      title="MBMC Care"
      description="Care mở rộng thời hạn bảo hành phần cứng cho máy đủ điều kiện. Phương án thực tế được xác nhận theo từng Machine ID."
      badge="Bảng quyền lợi V1"
      metrics={metrics}
      actions={[
        { href: "/chinh-sach/bao-hanh", label: "Chính sách bảo hành" },
        {
          href: "/chinh-sach/version/mbmc-policy-v1",
          label: "Bản lưu MBMC V1",
        },
      ]}
    >
      <PolicySection id="care-comparison" title="Care thay đổi điều gì?">
        <ResponsivePolicyTable label="So sánh bảo hành mặc định, Care 3 và Care 6">
          <table>
            <thead>
              <tr>
                <th scope="col">Quyền lợi</th>
                <th scope="col">Mặc định</th>
                <th scope="col">Care 3</th>
                <th scope="col">Care 6</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Bảo hành phần cứng</th>
                <td>01 tháng</td>
                <td>Tổng 03 tháng</td>
                <td>Tổng 06 tháng</td>
              </tr>
              <tr>
                <th scope="row">Đổi khi có lỗi nghiêm trọng</th>
                <td>07 ngày</td>
                <td>07 ngày</td>
                <td>07 ngày</td>
              </tr>
              <tr>
                <th scope="row">Màn hình</th>
                <td>07 ngày</td>
                <td>07 ngày</td>
                <td>07 ngày</td>
              </tr>
              <tr>
                <th scope="row">Sạc</th>
                <td>07 ngày</td>
                <td>07 ngày</td>
                <td>07 ngày</td>
              </tr>
            </tbody>
          </table>
        </ResponsivePolicyTable>
        <p className="policy-note">
          Care chỉ kéo dài bảo hành phần cứng. Sau ngày thứ 07, chính sách ưu
          tiên sửa chữa hoặc thay linh kiện trước. Máy mượn trong thời gian xử
          lý không được bảo đảm luôn có sẵn.
        </p>
      </PolicySection>
      <PolicySection id="care-pricing" title="Bảng giá Care V1">
        <p>
          Đây là bảng giá công khai cố định của phiên bản V1, không phải kết quả
          được tính từ cấu hình máy trên trang này.
        </p>
        <ResponsivePolicyTable label="Bảng giá MBMC Care V1">
          <table>
            <thead>
              <tr>
                <th scope="col">Giá trị máy</th>
                <th scope="col">Care 3</th>
                <th scope="col">Care 6</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Từ 10 triệu đến dưới 15 triệu</th>
                <td>600.000đ</td>
                <td>1.200.000đ</td>
              </tr>
              <tr>
                <th scope="row">Từ 15 triệu đến dưới 20 triệu</th>
                <td>800.000đ</td>
                <td>1.600.000đ</td>
              </tr>
              <tr>
                <th scope="row">Từ 20 triệu đến 30 triệu</th>
                <td>1.000.000đ</td>
                <td>2.000.000đ</td>
              </tr>
            </tbody>
          </table>
        </ResponsivePolicyTable>
      </PolicySection>
      <PolicySection
        id="care-purchase-window"
        title="Thời điểm mua và điều kiện"
      >
        <p>
          Care có thể được mua khi bán máy hoặc trong vòng 07 ngày sau bàn giao,
          với điều kiện máy vẫn đủ điều kiện tại thời điểm xác nhận.
        </p>
        <p>
          Máy dưới 10 triệu, trên 30 triệu hoặc có rủi ro đặc biệt cần được MBMC
          xem xét riêng. Phương án thực tế luôn được xác nhận theo Machine ID.
        </p>
      </PolicySection>
      <PolicySection id="care-machine-id" title="Care theo Machine ID">
        <p>
          Care đi cùng Machine ID của thiết bị. Quyền lợi được lưu theo máy để
          có thể tiếp tục tra cứu sau bàn giao.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
