---
title: MBMC Homepage UX Specification
status: ready-for-repo-audit
scope: muabanmacbookcu-web-home
---

# MBMC Homepage UX Specification

## Product Statement
Homepage không phải ecommerce storefront truyền thống.

Nó là cửa vào của MBMC Decision Studio.

Mục tiêu:
Confusion → Calm → Orientation → Trust → Next Step

## Content Order

### 1. Header
Menu ngắn, rõ, responsive, không mega menu ở vòng đầu.

### 2. Hero
H1 định hướng:
> Mua MacBook cũ không nên là một canh bạc.

Supporting copy:
> MBMC giúp bạn hiểu rõ nhu cầu của mình, hiểu rõ từng chiếc máy và tự tin với quyết định trước khi mua.

CTA:
- Tìm chiếc máy phù hợp
- Xem máy đang có

Không carousel, badge giảm giá, claim “số 1”, urgency hoặc autoplay video có âm thanh.

### 3. Recognition Block
Heading:
> Bạn đang mắc ở đâu?

Concern mẫu:
- Không biết Air hay Pro.
- Không biết 8GB hay 16GB.
- Sợ mua nhầm máy lỗi.
- Đã xem quá nhiều review.
- Không biết có đáng thêm vài triệu.
- Mỗi nơi nói một kiểu.

### 4. Problem Framing
> Không phải bạn thiếu MacBook.  
> Không phải bạn thiếu review.  
> Không phải bạn thiếu người bán.  
> Điều còn thiếu là một cách biến tất cả thông tin đó thành một quyết định.

### 5. How MBMC Helps
1. Hiểu bạn.
2. Hiểu chiếc máy.
3. Ghép hai thứ lại.
4. Bạn tự quyết.

### 6. Recommendation Entry
Cho khách bắt đầu từ nhu cầu, công việc, ngân sách và điều lo nhất.

### 7. Featured Machines
Số lượng giới hạn, không áp đảo homepage, link tới inventory đầy đủ.

### 8. Trust System
Ảnh thật, kiểm định, Passport, Timeline, chính sách rõ, Known / Unknown.

### 9. Decision Stories
Hiển thị 2–3 câu chuyện thật về nhu cầu, lựa chọn và lý do.

### 10. Closing CTA
> Bạn không cần quyết định ngay. Chỉ cần bắt đầu từ điều còn chưa rõ.

### 11. Footer
Điều hướng, chính sách, liên hệ, pháp lý và closing thought.

## Interaction Principles
- Motion nhẹ, có mục đích.
- Không scroll-jacking.
- Nội dung cốt lõi không phụ thuộc hover.
- Mobile-first.
- Tôn trọng reduced motion.

## Accessibility
Semantic headings, keyboard navigation, focus rõ, contrast tốt, alt text có nghĩa, không dùng chỉ màu để truyền trạng thái.

## Analytics
Đo click Recommendation, Inventory, concern, machine, trust evidence, Decision Story, contact CTA và scroll depth.

## Implementation Sequence
1. Structure.
2. Copy and hierarchy.
3. Trust and stories integration.
4. Visual polish.

## Constraints for Codex
- Không đổi public data contract ngoài phạm vi được duyệt.
- Không lộ dữ liệu riêng tư.
- Không thêm dependency lớn nếu chưa cần.
- Không phá route hiện hữu.
- Không rewrite toàn repo.
- Ưu tiên component tái sử dụng.
- Build và test phải pass.
- Liệt kê rõ file thay đổi và quyết định kiến trúc.
