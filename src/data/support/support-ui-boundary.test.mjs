import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const wizard = readFileSync(
  new URL(
    "../../app/care/[machine_id]/support/SupportTicketWizard.tsx",
    import.meta.url,
  ),
  "utf8",
);
const page = readFileSync(
  new URL("../../app/care/[machine_id]/support/page.tsx", import.meta.url),
  "utf8",
);
const actions = readFileSync(
  new URL("../../app/care/[machine_id]/CareActions.tsx", import.meta.url),
  "utf8",
);
const route = readFileSync(
  new URL("../../app/api/public-support-tickets/route.ts", import.meta.url),
  "utf8",
);
test("support page resolves only signed Machine context and has a real not-found boundary", () => {
  assert.match(page, /getSupportMachine\(machine_id\)/);
  assert.match(page, /SupportMachineNotFoundError[\s\S]*notFound\(\)/);
  assert.doesNotMatch(page, /CareAccess|ownership|activation|session|Supabase/);
});
test("wizard contains every independent step, category, validation, retry, and success boundary", () => {
  for (const text of [
    "Máy đang gặp vấn đề gì?",
    "Bạn gặp tình trạng này như thế nào?",
    "Có hình ảnh nào giúp MBMC hiểu rõ hơn không?",
    "MBMC nên liên hệ với ai?",
    "Kiểm tra yêu cầu",
    "MBMC đã nhận được yêu cầu",
  ])
    assert.match(wizard, new RegExp(text.replace(/[?]/g, "\\?")));
  for (const value of [
    "power_charging",
    "display",
    "battery_performance",
    "keyboard_trackpad_ports",
    "software_account_data",
    "physical_liquid_damage",
    "other",
  ])
    assert.match(
      readFileSync(new URL("./support-contract.ts", import.meta.url), "utf8"),
      new RegExp(value),
    );
  assert.match(wizard, /files\.length > 5/);
  assert.match(wizard, /if \(submitting\) return/);
  assert.match(wizard, /setLastAttempt\(currentFingerprint\)/);
  assert.match(wizard, /idempotencyKey: ""/);
  assert.match(wizard, /step - 1/);
});
test("Care actions are independent and BFF keeps signing material server-only", () => {
  assert.match(actions, /Mở hồ sơ Care/);
  assert.match(actions, /Báo vấn đề với máy/);
  assert.match(actions, /\/support/);
  assert.doesNotMatch(actions, /activation|ownership|session/);
  assert.doesNotMatch(
    wizard,
    /MBMC_PUBLIC_API_SECRET|x-mbmc-signature|app\.mbmc\.vn/,
  );
  assert.match(route, /request\.headers\.get\("origin"\)/);
  assert.match(route, /signedSupportHeaders/);
  assert.match(route, /trustedClientNetwork/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_/);
});
