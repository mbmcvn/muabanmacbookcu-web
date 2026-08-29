import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalPublicImages } from "../machines/project-public-candidates.ts";
import { filterPublicMachineImages } from "../../lib/public-projection/kernel.server.ts";
import { galleryDisclosureLabel } from "./care-gallery.ts";

const page = readFileSync(
  new URL("../../app/care/[machine_id]/page.tsx", import.meta.url),
  "utf8",
);
const actions = readFileSync(
  new URL("../../app/care/[machine_id]/CareActions.tsx", import.meta.url),
  "utf8",
);
const verification = readFileSync(
  new URL("../../app/care/[machine_id]/VerificationForm.tsx", import.meta.url),
  "utf8",
);
const repository = readFileSync(
  new URL("./care-repository.server.ts", import.meta.url),
  "utf8",
);
const styles = readFileSync(
  new URL("../../app/care/[machine_id]/care.module.css", import.meta.url),
  "utf8",
);
const storyStyles = readFileSync(
  new URL(
    "../../components/handover/CareStoryBlock.module.css",
    import.meta.url,
  ),
  "utf8",
);
const gallery = readFileSync(
  new URL(
    "../../app/care/[machine_id]/CarePublicImageGallery.tsx",
    import.meta.url,
  ),
  "utf8",
);

test("authenticated Care removes the redundant unlock action while pre-unlock preserves it", () => {
  assert.match(
    page,
    /<CareActions[\s\S]*machineCode=\{passport\.machineCode\}[\s\S]*unlocked/,
  );
  assert.match(actions, /!unlocked &&/);
  assert.match(actions, /Mở hồ sơ Care/);
  assert.match(verification, /<CareActions machineCode=\{machineCode\}/);
  assert.match(actions, /Bạn cần làm gì với máy này\?/);
  assert.match(actions, /Máy tôi có vấn đề/);
  assert.match(actions, /Bán lại \/ lên đời/);
  assert.match(actions, /href=\{`\/care\/\$\{code\}\/support`\}/);
  assert.match(actions, /href=\{`\/care\/\$\{code\}\/resale`\}/);
});

test("expired Care session gets explicit re-verification recovery", () => {
  assert.match(page, /expired=\{status\.verification === "expired"\}/);
  assert.match(verification, /Phiên Care đã hết hạn/);
  assert.match(verification, /Xác minh lại số điện thoại để tiếp tục/);
});

test("Care selects its representative image through canonical public-media filters", () => {
  const rows = [
    {
      id: "public-cover",
      public_url: "https://img.mbmc.vn/machines/public.webp",
      image_type: "cover",
      image_stage: "listing",
      visibility: "public",
      sort_order: 0,
      is_cover: true,
    },
    {
      id: "private-intake",
      public_url: "https://img.mbmc.vn/machines/private.webp",
      image_type: "cover",
      image_stage: "intake",
      visibility: "private",
      sort_order: 1,
      is_cover: false,
    },
  ];
  assert.deepEqual(
    filterPublicMachineImages(canonicalPublicImages(rows)).map(
      (image) => image.sourceKey,
    ),
    ["public-cover"],
  );
  assert.match(
    repository,
    /filterPublicMachineImages\([\s\S]*canonicalPublicImages/,
  );
  assert.match(page, /Ảnh công khai thời điểm chưa bán/);
  assert.match(page, /passport\.publicImage &&/);
  assert.match(
    page,
    /passport\.publicImage \? "" : styles\.passportGridWithoutImage/,
  );
  assert.match(styles, /object-fit: contain/);
});

test("Care gallery visibility follows zero, representative-only, and multi-image rules", () => {
  assert.equal(galleryDisclosureLabel(0, false), null);
  assert.equal(galleryDisclosureLabel(1, true), null);
  assert.equal(galleryDisclosureLabel(1, false), "Xem ảnh máy lúc rao bán");
  assert.equal(galleryDisclosureLabel(2, true), "Xem toàn bộ ảnh lúc rao bán");
  assert.match(gallery, /<button/);
  assert.match(gallery, /aria-expanded=\{expanded\}/);
  assert.match(gallery, /images\.map/);
  assert.match(gallery, /Ảnh công khai trước thời điểm bán/);
  assert.match(repository, /publicImages\.map/);
  assert.match(
    page,
    /<CarePublicImageGallery[\s\S]*className=\{`\$\{styles\.state\}/,
  );
  assert.match(styles, /\.galleryGrid[\s\S]*min-width: 0/);
});

test("authenticated information architecture keeps warranty before support and story", () => {
  const warranty = page.indexOf("Bảo hành của máy");
  const policy = page.indexOf("Chính sách bảo hành");
  const support = page.indexOf("<CareActions");
  const story = page.indexOf("<CareStoryBlock story={careStory}");
  const services = page.indexOf("<ServiceHub />");
  const log = page.indexOf("Nhật ký thiết bị");
  assert.ok(warranty < policy && policy < support && support < story);
  assert.ok(story < services && services < log);
});

test("warranty policy disclosure and full canonical policy link remain available", () => {
  assert.match(page, /<details className=\{styles\.disclosure\}>/);
  assert.match(page, /Xem phạm vi chi tiết/);
  assert.match(page, /passport\.policy\?\.warrantyUrl/);
  assert.match(page, /Xem chính sách bảo hành đầy đủ/);
  assert.match(page, /passport\.careOffer\.eligible/);
  assert.match(page, /passport\.policy\?\.careUrl/);
  assert.match(page, /Xem các gói Care/);
  assert.match(page, /passport\.policy\.summaryItems\.map/);
  assert.doesNotMatch(page, /Không áp dụng/);
  assert.match(page, /policy\.summaryItems\.slice\(0, 3\)/);
});

test("canonical coverage errors cannot be rendered as a missing-data warranty state", () => {
  assert.match(repository, /CARE_COVERAGE_QUERY_FAILED/);
  assert.match(
    repository,
    /if \(coverageResult\.error\)[\s\S]*throw new Error/,
  );
  assert.match(
    repository,
    /care_coverage_end_at \?\? coverage\.default_warranty_end_at/,
  );
  assert.match(repository, /resolve_public_machine_care_offer/);
  assert.match(page, /passport\.careOffer\.options\.map/);
  assert.doesNotMatch(page, /Chưa có dữ liệu/);
  assert.match(page, /historical_snapshot_missing/);
  assert.match(page, /Chưa ghi nhận hạn bảo hành/);
  assert.match(page, /Cần MBMC xác nhận/);
  assert.match(page, /hồ sơ cũ chưa ghi[\s\S]*nhận ngày hết hạn/);
});

test("warranty CTA renders canonical Care eligibility without local deadline math", () => {
  assert.match(repository, /careOffer:\s*mapPublicCareOffer/);
  assert.match(page, /passport\.careOffer\.eligible \?/);
  assert.match(page, /Gia hạn bảo vệ/);
  assert.match(page, /Care cho chiếc Mac này/);
  assert.match(page, /Xem các gói Care/);
  assert.match(page, /Lựa chọn tiếp theo/);
  assert.match(page, /Bán lại \/ lên đời/);
  assert.match(page, /MBMC có thể định giá lại chiếc Mac này/);
  assert.match(page, /href=\{MBMC_CONTACTS\.zalo\.href\}/);
  assert.doesNotMatch(page, /interval '7 days'|\+\s*7\s*\*|setDate\(/);
});

test("compact service hub has three working contact fallbacks and responsive markup", () => {
  assert.match(page, /MBMC_CONTACTS\.zalo\.href/);
  for (const title of ["Phụ kiện phù hợp", "Cài đặt & phần mềm", "Ghé MBMC"]) {
    assert.match(page, new RegExp(title.replace("&", "&")));
  }
  for (const cta of ["Hỏi phụ kiện →", "Nhờ cài đặt →", "Đặt lịch ghé →"]) {
    assert.match(page, new RegExp(cta));
  }
  assert.match(page, /services\.map/);
  assert.match(styles, /\.serviceGrid/);
  assert.match(styles, /@media \(max-width: 40rem\)/);
  assert.match(styles, /@media \(max-width: 48rem\)/);
  assert.match(page, /CareStoryBlock/);
  assert.match(page, /Nhật ký thiết bị/);
  assert.match(storyStyles, /@media \(min-width: 48rem\)/);
  assert.match(
    storyStyles,
    /grid-template-columns: minmax\(0, 0\.4fr\) minmax\(0, 0\.6fr\)/,
  );
});
