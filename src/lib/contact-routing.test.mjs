import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MBMC_CONTACTS,
  buildMachineShareUrl,
  canonicalReferralCode,
  copyMachineShareUrl,
  resolveContact,
  resolveReferralContext,
  validFacebookContactUrl,
} from "./contact-routing.ts";

const zaloCtv = {
  displayName: "Thanh Tung",
  zaloPhone: "0968610151",
  facebookContactUrl: "https://m.me/thanh.tung",
  preferredChannel: "zalo",
};
const facebookCtv = { ...zaloCtv, preferredChannel: "messenger" };

test("MBMC keeps its existing default and explicit channel destinations", () => {
  assert.deepEqual(resolveContact(null, null), {
    ownerType: "mbmc",
    channel: "zalo",
    ...MBMC_CONTACTS.zalo,
  });
  assert.deepEqual(resolveContact(null, "zalo"), {
    ownerType: "mbmc",
    channel: "zalo",
    ...MBMC_CONTACTS.zalo,
  });
  assert.deepEqual(resolveContact(null, "messenger"), {
    ownerType: "mbmc",
    channel: "messenger",
    ...MBMC_CONTACTS.messenger,
  });
});

test("CTV preference supplies the channel only when no channel is explicit", () => {
  assert.equal(
    resolveContact(zaloCtv, null).href,
    "https://zalo.me/0968610151",
  );
  assert.equal(
    resolveContact(facebookCtv, null).href,
    "https://m.me/thanh.tung",
  );
  assert.equal(
    resolveContact(zaloCtv, "messenger").href,
    "https://m.me/thanh.tung",
  );
  assert.equal(
    resolveContact(facebookCtv, "zalo").href,
    "https://zalo.me/0968610151",
  );
  assert.equal(
    resolveContact(zaloCtv, "messenger").label,
    "Nhắn Thanh Tung trên Messenger",
  );
});

test("missing requested CTV channel falls back without changing owner", () => {
  const result = resolveContact(
    { ...zaloCtv, facebookContactUrl: null },
    "messenger",
  );
  assert.equal(result.ownerType, "ctv");
  assert.equal(result.channel, "zalo");
  assert.equal(result.href, "https://zalo.me/0968610151");
});

test("CTV with no usable destination falls back safely to MBMC", () => {
  const result = resolveContact(
    { ...zaloCtv, zaloPhone: "bad", facebookContactUrl: "javascript:alert(1)" },
    null,
  );
  assert.deepEqual(result, {
    ownerType: "mbmc",
    channel: "zalo",
    ...MBMC_CONTACTS.zalo,
  });
});

test("Facebook destinations allow only intended HTTPS hosts", () => {
  for (const value of [
    "https://m.me/name",
    "https://facebook.com/name",
    "https://www.facebook.com/name",
    "https://m.facebook.com/name",
    "https://mbasic.facebook.com/name",
  ]) {
    assert.equal(validFacebookContactUrl(value), value);
  }
  for (const value of [
    "javascript:alert(1)",
    "data:text/plain,no",
    "https://example.com/name",
    "not a url",
    "http://m.me/name",
    "https://m.me/",
    "https://user@m.me/name",
  ]) {
    assert.equal(validFacebookContactUrl(value), null);
  }
});

test("referral codes trim and uppercase the approved four-character alphabet", () => {
  assert.equal(canonicalReferralCode("XMG4"), "XMG4");
  assert.equal(canonicalReferralCode("xmg4"), "XMG4");
  assert.equal(canonicalReferralCode("  xmg4  "), "XMG4");
  for (const value of [
    "XMG",
    "XMG45",
    "XML4",
    "XMI4",
    "XMO4",
    "XM04",
    "XM14",
    "INVALID",
    "0968610151",
  ]) {
    assert.equal(canonicalReferralCode(value), null);
  }
});

test("a valid URL referral is persisted and replaces an older referral", async () => {
  const lookup = async (value) => (value === "XMG4" ? zaloCtv : null);
  const result = await resolveReferralContext(" xmg4 ", "ABCD", lookup);
  assert.equal(result.owner, zaloCtv);
  assert.equal(result.referralToPersist, "XMG4");
});

test("a persisted valid referral restores its CTV and composes with either explicit channel", async () => {
  const lookup = async (value) => (value === "XMG4" ? zaloCtv : null);
  const context = await resolveReferralContext(null, "XMG4", lookup);
  assert.equal(resolveContact(context.owner, "zalo").ownerType, "ctv");
  assert.equal(
    resolveContact(context.owner, "messenger").href,
    "https://m.me/thanh.tung",
  );
  assert.equal(context.referralToPersist, null);
});

test("an invalid URL referral does not destroy a valid persisted CTV", async () => {
  const calls = [];
  const lookup = async (value) => {
    calls.push(value);
    return value === "XMG4" ? zaloCtv : null;
  };
  const context = await resolveReferralContext("INVALID", "XMG4", lookup);
  assert.equal(context.owner, zaloCtv);
  assert.equal(context.referralToPersist, null);
  assert.deepEqual(calls, ["XMG4"]);
});

test("unknown valid code and resolver failure preserve explicit MBMC channel", async () => {
  const unknown = await resolveReferralContext("ABCD", null, async () => null);
  assert.equal(
    resolveContact(unknown.owner, "messenger").href,
    MBMC_CONTACTS.messenger.href,
  );
  const failed = await resolveReferralContext("XMG4", null, async () => null);
  assert.equal(
    resolveContact(failed.owner, "zalo").href,
    MBMC_CONTACTS.zalo.href,
  );
});

test("malformed and old phone-shaped persisted refs fail without an RPC lookup", async () => {
  const calls = [];
  const lookup = async (value) => {
    calls.push(value);
    return zaloCtv;
  };
  const context = await resolveReferralContext(null, "0968610151", lookup);
  assert.equal(context.owner, null);
  assert.deepEqual(calls, []);
});

test("referral owner still composes independently with explicit Zalo and Messenger", async () => {
  const context = await resolveReferralContext(
    "XMG4",
    null,
    async () => zaloCtv,
  );
  assert.equal(
    resolveContact(context.owner, "zalo").href,
    "https://zalo.me/0968610151",
  );
  assert.equal(
    resolveContact(context.owner, "messenger").href,
    "https://m.me/thanh.tung",
  );
});

test("invalid ref keeps the requested MBMC channel and never reaches the RPC", async () => {
  let calls = 0;
  const context = await resolveReferralContext("INVALID", null, async () => {
    calls += 1;
    return zaloCtv;
  });
  assert.equal(calls, 0);
  assert.equal(
    resolveContact(context.owner, "zalo").href,
    MBMC_CONTACTS.zalo.href,
  );
  assert.equal(
    resolveContact(context.owner, "messenger").href,
    MBMC_CONTACTS.messenger.href,
  );
});

test("browser resolver sends only the canonical referral-code RPC argument", () => {
  const source = readFileSync(
    new URL("../hooks/useContactChannel.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /p_referral_code: referralCode/);
  assert.doesNotMatch(source, /p_referral_phone|referral_phone/);
});

test("machine share URLs include the resolved referral owner but never channel", () => {
  assert.equal(
    buildMachineShareUrl("https://mbmc.vn/may/mbmc-8d5x", "PYKB"),
    "https://mbmc.vn/may/mbmc-8d5x?ref=PYKB",
  );
  assert.equal(
    buildMachineShareUrl(
      "https://mbmc.vn/may/mbmc-8d5x?ref=PYKB&channel=zalo",
      "PYKB",
    ),
    "https://mbmc.vn/may/mbmc-8d5x?ref=PYKB",
  );
  assert.equal(
    buildMachineShareUrl(
      "https://mbmc.vn/may/mbmc-8d5x?view=full&channel=messenger",
      "PYKB",
    ),
    "https://mbmc.vn/may/mbmc-8d5x?view=full&ref=PYKB",
  );
});

test("machine share URLs stay clean without a valid CTV context", () => {
  assert.equal(
    buildMachineShareUrl("https://mbmc.vn/may/mbmc-8d5x?channel=zalo", null),
    "https://mbmc.vn/may/mbmc-8d5x",
  );
});

test("clipboard success and failure return safe feedback state", async () => {
  let copied = "";
  assert.equal(
    await copyMachineShareUrl(
      "https://mbmc.vn/may/mbmc-8d5x",
      "PYKB",
      async (value) => {
        copied = value;
      },
    ),
    true,
  );
  assert.equal(copied, "https://mbmc.vn/may/mbmc-8d5x?ref=PYKB");
  assert.equal(
    await copyMachineShareUrl(
      "https://mbmc.vn/may/mbmc-8d5x",
      "PYKB",
      async () => {
        throw new Error("denied");
      },
    ),
    false,
  );
});
