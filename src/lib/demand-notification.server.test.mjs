import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
test("signed notifier is fixed, server-only, and failure-isolated", async () => {
  const source = await readFile(
    new URL("./demand-notification.server.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /import "server-only"/);
  assert.match(source, /\/api\/internal\/demand-notifications/);
  assert.match(source, /signedSupportHeaders/);
  assert.match(source, /catch/);
  assert.match(source, /outcome: "notification_failed"/);
  assert.doesNotMatch(source, /TELEGRAM_BOT_TOKEN|TELEGRAM_DEMAND_CHAT_ID/);
});
test("Demand route notifies only a newly created canonical row", async () => {
  const route = await readFile(
    new URL("../app/api/demand/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(
    route,
    /if \(row\.created\)[\s\S]*notifyNewDemandBestEffort\(row\.demand_request_id\)/,
  );
  assert.ok(
    route.indexOf("if (error || !row)") < route.indexOf("if (row.created)"),
  );
  assert.ok(
    route.indexOf("submission_conflict") < route.indexOf("if (row.created)"),
  );
  assert.doesNotMatch(route, /NEXT_PUBLIC_TELEGRAM|TELEGRAM_BOT_TOKEN/);
});
