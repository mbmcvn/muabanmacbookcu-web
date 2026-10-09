import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";
import { chromium } from "playwright";

const current = "https://download.mbmc.vn/mbmc-desktop/MBMC-Desktop-1.0.0-5-Local-First-RC9-QA.dmg";
const legacy = [
  "https://download.mbmc.vn/mbmc-desktop/MBMC-Desktop-1.0.0-3.dmg",
  "https://download.mbmc.vn/mbmc-desktop/MBMC-Desktop-V1.0-Beta-Universal.zip",
];

test("public desktop downloads on desktop and mobile", { timeout: 120_000 }, async (t) => {
  const origin = process.env.MBMC_TEST_ORIGIN || "http://127.0.0.1:3189";
  const server = process.env.MBMC_TEST_ORIGIN ? null : spawn(
    process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3189"],
    { stdio: "pipe" },
  );
  let serverOutput = "";
  server?.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server?.stderr.on("data", (chunk) => { serverOutput += chunk; });
  let browser;
  try {
    for (let attempt = 0; attempt < 60; attempt++) {
      try { if ((await fetch(origin)).ok) break; } catch {}
      assert.notEqual(server?.exitCode, 1, serverOutput);
      assert.ok(attempt < 59, serverOutput || "Server did not become ready");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    browser = await chromium.launch({
      ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    });
    for (const width of [1280, 375, 320]) {
      for (const route of ["/", "/phan-mem", "/phan-mem/mbmc-desktop"]) {
        await t.test(`${route} at ${width}px`, async () => {
          const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width <= 375 });
          try {
            await page.goto(origin + route);
            if (route.endsWith("/mbmc-desktop")) assert.equal(new URL(page.url()).pathname, "/phan-mem");
            const primary = page.getByRole("link", { name: /^Tải MBMC Desktop v/ });
            // Intercept downloads: prove each click requests the exact direct URL without fetching a DMG.
            const requests = [];
            await page.route("https://download.mbmc.vn/**", async (route) => {
              requests.push(route.request().url());
              await route.fulfill({ status: 200, contentType: "application/octet-stream",
                headers: { "content-disposition": 'attachment; filename="test-download"' }, body: "test" });
            });
            await primary.waitFor();
            assert.equal(await primary.count(), 1);
            assert.equal(await primary.getAttribute("href"), current);
            assert.notEqual(await primary.getAttribute("download"), null);
            const activate = (locator) => width <= 375 ? locator.tap() : locator.click();
            const trigger = page.getByRole("button", { name: "Phiên bản cũ", exact: true });
            assert.equal(await trigger.getAttribute("aria-expanded"), "false");
            assert.equal((await trigger.textContent()).trim(), "");
            assert.equal(await trigger.locator("svg").count(), 1);
            assert.equal(await page.getByText("Phiên bản cũ", { exact: true }).count(), 0);
            const split = primary.locator("..");
            assert.equal(await split.locator(":scope > a").count(), 1);
            assert.equal(await split.locator(":scope > button").count(), 1);
            const left = await primary.boundingBox();
            const right = await trigger.boundingBox();
            const splitBounds = await split.boundingBox();
            assert.ok(Math.abs(left.y - right.y) < 1);
            assert.ok(Math.abs(left.height - right.height) < 1);
            assert.ok(Math.abs(left.x + left.width - right.x) < 1);
            assert.ok(right.width >= 44 && right.width < left.width);
            assert.ok(splitBounds.x >= 0 && splitBounds.x + splitBounds.width <= width);
            for (const url of legacy) assert.equal(await page.locator(`a[href="${url}"]`).count(), 0);

            const waitForFocus = async (locator) => {
              await page.waitForFunction((el) => el === document.activeElement, await locator.elementHandle());
            };
            const checkMenu = async () => {
              const menu = page.getByRole("menu", { name: "Các phiên bản cũ MBMC Desktop" });
              await menu.waitFor();
              assert.equal(await trigger.getAttribute("aria-expanded"), "true");
              assert.equal(await menu.getByRole("menuitem").count(), 2);
              for (const url of legacy) {
                assert.equal(await menu.locator(`a[href="${url}"]`).count(), 1);
                assert.equal(await page.locator(`a[href="${url}"]`).count(), 1);
              }
              assert.equal(await menu.locator(`a[href="${current}"]`).count(), 0);
              const { bounds, splitBounds } = await menu.evaluate((el) => ({
                bounds: el.getBoundingClientRect().toJSON(),
                splitBounds: el.parentElement.firstElementChild.getBoundingClientRect().toJSON(),
              }));
              assert.ok(Math.abs(bounds.width - splitBounds.width) < 1);
              assert.ok(Math.abs(bounds.x - splitBounds.x) < 1);
              assert.ok(bounds.y >= splitBounds.y + splitBounds.height);
              assert.ok(bounds.y - splitBounds.y - splitBounds.height < 12);
              assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, JSON.stringify(bounds));
              assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
              return menu;
            };

            await activate(trigger);
            let menu = await checkMenu();
            await waitForFocus(menu.getByRole("menuitem").first());
            await page.keyboard.press("ArrowDown");
            await waitForFocus(menu.getByRole("menuitem").nth(1));
            await page.keyboard.press("Escape");
            await menu.waitFor({ state: "detached" });
            await waitForFocus(trigger);

            await page.keyboard.press("ArrowUp");
            menu = await checkMenu();
            await waitForFocus(menu.getByRole("menuitem").nth(1));
            await page.keyboard.press("Home");
            await waitForFocus(menu.getByRole("menuitem").first());
            await page.keyboard.press("End");
            await waitForFocus(menu.getByRole("menuitem").nth(1));
            await page.keyboard.press("Tab");
            await menu.waitFor({ state: "detached" });

            await activate(trigger);
            await checkMenu();
            await activate(page.locator("h2#mbmc-desktop-title, h2#desktop-spotlight-title"));
            await page.getByRole("menu").waitFor({ state: "detached" });
            assert.equal(await trigger.getAttribute("aria-expanded"), "false");

            await trigger.focus();
            await page.keyboard.press("Enter");
            await checkMenu();
            await page.keyboard.press("Escape");
            await activate(trigger);
            await checkMenu();
            await activate(trigger);
            await page.getByRole("menu").waitFor({ state: "detached" });

            assert.deepEqual(requests, [], "Chevron and keyboard actions must never download");
            await Promise.all([page.waitForEvent("download"), activate(primary)]);
            assert.equal(await trigger.getAttribute("aria-expanded"), "false");
            await activate(trigger);
            await checkMenu();
            await Promise.all([page.waitForEvent("download"), activate(primary)]);
            assert.equal(await trigger.getAttribute("aria-expanded"), "true", "Primary download must not toggle the menu");
            await trigger.focus();
            await page.keyboard.press("Escape");
            await page.getByRole("menu").waitFor({ state: "detached" });
            for (const url of legacy) {
              await activate(trigger);
              await Promise.all([page.waitForEvent("download"), page.getByRole("menu").locator(`a[href="${url}"]`).click()]);
              await page.getByRole("menu").waitFor({ state: "detached" });
            }
            assert.deepEqual(requests, [current, current, ...legacy]);
          } finally { await page.close(); }
        });
      }
    }
  } finally {
    await browser?.close();
    if (server && server.exitCode === null) {
      const exited = once(server, "exit");
      server.kill();
      await exited;
    }
  }
});
