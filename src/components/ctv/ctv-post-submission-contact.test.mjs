import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const form = readFileSync(
  new URL("./CtvApplicationForm.tsx", import.meta.url),
  "utf8",
);
const contacts = readFileSync(
  new URL("../../lib/contact-routing.ts", import.meta.url),
  "utf8",
);
const route = readFileSync(
  new URL("../../app/api/ctv/applications/route.ts", import.meta.url),
  "utf8",
);
const success = form.slice(
  form.indexOf('if (state === "success")'),
  form.indexOf("  return (\n    <form"),
);

test("canonical success replaces the form only after submission resolves", () => {
  assert.match(success, /Đã gửi đăng ký/);
  assert.match(success, /MBMC đã nhận được phần trả lời của bạn/);
  assert.match(
    form,
    /await submitCtvApplication\([\s\S]*sessionStorage\.removeItem\(DRAFT_KEY\);[\s\S]*setState\("success"\)/,
  );
});

test("optional follow-up copy does not promise acceptance or faster review", () => {
  assert.match(success, /Muốn chủ động trao đổi thêm\?/);
  assert.match(success, /Việc nhắn\s+thêm là tùy chọn/);
  assert.match(success, /không bắt buộc để đăng ký được xem xét/);
  assert.doesNotMatch(
    success,
    /đảm bảo|chắc chắn|nhanh hơn|ưu tiên|chấp nhận/i,
  );
});

test("recruitment actions use canonical direct MBMC destinations", () => {
  assert.match(form, /import \{ MBMC_CONTACTS \}/);
  assert.match(success, /href=\{MBMC_CONTACTS\.messenger\.href\}/);
  assert.match(success, /href=\{MBMC_CONTACTS\.zalo\.href\}/);
  assert.match(success, /Nhắn qua Messenger/);
  assert.match(success, /Nhắn qua Zalo/);
  assert.match(contacts, /https:\/\/m\.me\/61592174842507/);
  assert.match(contacts, /https:\/\/zalo\.me\/0326147088/);
  assert.doesNotMatch(form, /useContactChannel|resolveContact\(/);
});

test("third-party links contain no applicant payload or query parameters", () => {
  assert.doesNotMatch(
    success,
    /displayName|phone|profileUrl|answers|submissionKey/,
  );
  assert.doesNotMatch(
    success,
    /searchParams|URLSearchParams|\?ref=|\?channel=/,
  );
  assert.doesNotMatch(
    contacts.match(
      /export const MBMC_CONTACTS = \{[\s\S]*?\} as const;/,
    )?.[0] ?? "",
    /\?/,
  );
});

test("canonical persistence and created-only Telegram happen before success response", () => {
  assert.match(
    route,
    /if \(row\.created\) await notifyNewCtvApplicationBestEffort/,
  );
  assert.match(
    route,
    /if \(row\.created\)[\s\S]*notifyNewCtvApplicationBestEffort[\s\S]*return NextResponse\.json/,
  );
});

test("success UI adds no application, lifecycle, or partner mutation", () => {
  assert.doesNotMatch(
    success,
    /submitCtvApplication|fetch\(|ctv_partner|status|interview|contacted/i,
  );
  assert.match(
    success,
    /Khi nhắn, chỉ cần nói bạn vừa hoàn thành bài đăng ký CTV/,
  );
});
