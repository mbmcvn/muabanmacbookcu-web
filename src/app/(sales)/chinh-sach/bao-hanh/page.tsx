import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "../_components/PolicyPage";

export const metadata: Metadata = { title: "Chính sách bảo hành | MBMC" };

const metrics = [
  { value: "01 tháng", label: "Bảo hành phần cứng" },
  { value: "07 ngày", label: "Đổi khi có lỗi nghiêm trọng" },
  { value: "07 ngày", label: "Màn hình và sạc" },
  { value: "30 ngày tối thiểu", label: "Hạng mục vừa sửa hoặc thay" },
] as const;

export default function WarrantyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Chính sách công khai"
      title="Chính sách bảo hành"
      description="Quyền lợi bảo hành trước bán theo chính sách MBMC V1, được xác nhận cho đúng chiếc máy khi bàn giao."
      badge="Phiên bản V1"
      metrics={metrics}
      actions={[
        { href: "/chinh-sach", label: "Tất cả chính sách" },
        { href: "/chinh-sach/mbmc-care", label: "Xem MBMC Care" },
        {
          href: "/chinh-sach/version/mbmc-policy-v1",
          label: "Bản lưu MBMC V1",
        },
      ]}
    >
      <PolicySection id="warranty-exchange" title="Đổi máy trong 07 ngày">
        <p>
          Trong 07 ngày đầu, máy được đổi khi có lỗi nghiêm trọng thuộc phạm vi
          bảo hành và ảnh hưởng trực tiếp đến khả năng sử dụng chính.
        </p>
      </PolicySection>
      <PolicySection
        id="warranty-repair-first"
        title="Lỗi linh kiện được sửa hoặc thay trước"
      >
        <p>
          Với lỗi linh kiện có thể xử lý, MBMC ưu tiên sửa chữa hoặc thay thế
          linh kiện phù hợp trước khi xem xét phương án khác.
        </p>
      </PolicySection>
      <PolicySection
        id="warranty-non-fault-exchange"
        title="Đổi không do lỗi, khấu trừ mặc định 15%"
      >
        <p>
          Trường hợp đổi máy không xuất phát từ lỗi thuộc phạm vi bảo hành, mức
          khấu trừ mặc định là 15% giá trị máy.
        </p>
      </PolicySection>
      <PolicySection id="warranty-hardware" title="Phạm vi bảo hành phần cứng">
        <p>
          Bảo hành phần cứng áp dụng trong 01 tháng cho lỗi chức năng phát sinh
          trong điều kiện sử dụng bình thường và thuộc phạm vi chính sách.
        </p>
      </PolicySection>
      <PolicySection id="warranty-screen" title="Màn hình">
        <p>
          Màn hình được bảo hành 07 ngày theo tình trạng đã xác nhận khi bàn
          giao.
        </p>
      </PolicySection>
      <PolicySection id="warranty-battery" title="Pin">
        <p>
          Pin là linh kiện hao mòn. Việc tiếp nhận bảo hành dựa trên lỗi chức
          năng, không dựa riêng vào mức suy giảm dung lượng trong quá trình sử
          dụng.
        </p>
      </PolicySection>
      <PolicySection
        id="warranty-exclusions"
        title="Trường hợp không được bảo hành miễn phí"
      >
        <p>
          Không áp dụng bảo hành miễn phí cho hư hỏng do rơi, va đập, chất lỏng,
          sử dụng sai cách, tự ý can thiệp, tác động bên ngoài hoặc hao mòn
          thông thường.
        </p>
      </PolicySection>
      <PolicySection id="warranty-processing" title="Thời gian xử lý">
        <p>
          Thời gian xử lý thông thường từ 1–7 ngày. Trường hợp đặc biệt, thời
          gian dự kiến tối đa 30 ngày và được trao đổi trong quá trình tiếp
          nhận.
        </p>
      </PolicySection>
      <PolicySection
        id="warranty-repaired-item"
        title="Bảo hành riêng sau sửa chữa"
      >
        <p>
          Hạng mục vừa được sửa chữa hoặc thay thế có thời hạn bảo hành riêng
          tối thiểu 30 ngày.
        </p>
      </PolicySection>
      <PolicySection
        id="warranty-software"
        title="Phần mềm, Apple ID và dữ liệu"
      >
        <p>
          Người dùng chịu trách nhiệm với Apple ID, mật khẩu, phần mềm và dữ
          liệu cá nhân. Hãy sao lưu dữ liệu và đăng xuất tài khoản khi máy cần
          được tiếp nhận.
        </p>
      </PolicySection>
      <PolicySection
        id="warranty-machine-id"
        title="Quyền lợi gắn với Machine ID"
      >
        <p>
          Quyền lợi được lưu theo Machine ID của thiết bị, không được suy đoán
          từ ngày máy xuất hiện công khai.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
