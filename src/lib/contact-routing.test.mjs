import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MBMC_CONTACTS,
  DEFAULT_REFERRAL_CONTEXT,
  withFunnelReferral,
  referralForQueryUpdate,
  buildMachineShareUrl,
  canonicalReferralCode,
  copyMachineShareUrl,
  resolveContact,
  resolveReferralContext,
  validFacebookContactUrl,
} from "./contact-routing.ts";
import { createContactAttributionStore, createReferralLookup, SERVER_CONTACT_SNAPSHOT } from "./contact-attribution.ts";
import { buildInventoryShareUrl, emptyInventoryFacets, parseInventoryUrlState, serializeInventoryUrlState } from "../data/machines/public-inventory-query.ts";
import { canonicalMachineUrl } from "./public-machine-url.ts";

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

test("quiz recommendation contact uses canonical organic and CTV destinations while preserving clipboard handoff", () => {
  const source = readFileSync(
    new URL("../app/(sales)/chon-macbook/RecommendationView.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(resolveContact(null, null).href, "https://zalo.me/0326147088");
  assert.equal(resolveContact(zaloCtv, null).href, "https://zalo.me/0968610151");
  assert.match(source, /useContactChannel\(\)/);
  assert.match(source, /copyText\(summary\)/);
  assert.match(source, /window\.location\.href = contactUrl/);
  assert.doesNotMatch(source, /window\.location\.href = "https:\/\/zalo\.me\/0326147088"/);
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

test("contact owner hydration uses the same immutable safe server snapshot", () => {
  const source = readFileSync(new URL("../hooks/useContactChannel.ts", import.meta.url), "utf8");
  assert.match(source, /useSyncExternalStore\(store.subscribe, store.getSnapshot, store.getServerSnapshot\)/);
  assert.doesNotMatch(source, /useState.*cachedOwner|pendingReferral/);
  const store = createContactAttributionStore();
  assert.equal(store.getSnapshot(), store.getServerSnapshot());
  assert.equal(store.getServerSnapshot(), SERVER_CONTACT_SNAPSHOT);
  assert.equal(store.getSnapshot().referralCode, "MBMC");
});

test("machine cards use the canonical encoded detail URL", () => {
  assert.equal(canonicalMachineUrl("mbmc demo/01"), "https://mbmc.vn/may/mbmc%20demo%2F01");
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

const kris = { displayName: "Kris Trần", zaloPhone: "0900000001", facebookContactUrl: "https://m.me/kris.test", preferredChannel: "messenger" };
const lookup = async code => code === "5DZE" ? kris : code === "XMG4" ? zaloCtv : null;

test("organic no-ref resolves to the canonical MBMC house configuration", async () => {
  const context = await resolveReferralContext(null, null, lookup);
  assert.deepEqual(context, DEFAULT_REFERRAL_CONTEXT);
  assert.equal(context.referralCode, "MBMC");
  assert.equal(resolveContact(context.owner, null).label, MBMC_CONTACTS.zalo.label);
  assert.equal(context.referralEvidence, null);
  assert.equal(context.shareReferralCode, null);
});

test("5DZE and MBMC resolve from one canonical owner object with URL-over-cookie precedence", async () => {
  for (const [query, persisted, expected] of [["5DZE", null, "5DZE"], ["MBMC", null, "MBMC"], [" mbmc ", "5DZE", "MBMC"], ["5DZE", "MBMC", "5DZE"], [null, "MBMC", "MBMC"], [null, "5DZE", "5DZE"]]) {
    const calls = [];
    const context = await resolveReferralContext(query, persisted, async code => { calls.push(code); return lookup(code); });
    assert.equal(context.referralCode, expected);
    const contact = resolveContact(context.owner, null);
    if (expected === "MBMC") {
      assert.equal(context.owner, null);
      assert.equal(contact.href, MBMC_CONTACTS.zalo.href);
      assert.equal(contact.label, MBMC_CONTACTS.zalo.label);
      assert.equal(context.referralEvidence, null);
      assert.deepEqual(calls, []);
    } else {
      assert.equal(contact.label, "Nhắn Kris Trần trên Messenger");
      assert.equal(contact.href, kris.facebookContactUrl);
      assert.equal(context.referralEvidence, "5DZE");
    }
    assert.equal(context.shareReferralCode, expected);
    assert.equal(context.referralToPersist, query === null ? null : expected);
  }
});

test("invalid or unavailable refs fall back to valid persisted context, then MBMC, with matching evidence", async () => {
  for (const ref of ["INVALID", "ABCD", "0968610151", ""]) {
    const fallback = await resolveReferralContext(ref, null, lookup);
    assert.equal(fallback.referralCode, "MBMC");
    assert.equal(fallback.referralEvidence, null);
    const persisted = await resolveReferralContext(ref, "5DZE", lookup);
    assert.equal(persisted.referralCode, "5DZE");
    assert.equal(persisted.referralEvidence, "5DZE");
  }
  const failed = await resolveReferralContext("XMG4", "MBMC", async () => { throw new Error("network error"); });
  assert.equal(failed.referralCode, "MBMC");
  const unusable = await resolveReferralContext("XMG4", null, async () => ({ ...kris, zaloPhone: null, facebookContactUrl: null }));
  assert.equal(unusable.referralCode, "MBMC");
  assert.equal(unusable.referralEvidence, null);
});

test("a shared browsing snapshot resets stale partner CTA, evidence and cookie together for explicit MBMC", async () => {
  const store = createContactAttributionStore();
  let cookie = "5DZE";
  const persist = code => { cookie = code; };
  await store.synchronize("?ref=5DZE", cookie, lookup, persist);
  assert.equal(store.getSnapshot().contactLabel, "Nhắn Kris Trần trên Messenger");
  await store.synchronize("?ref=MBMC", cookie, lookup, persist);
  assert.equal(cookie, "MBMC");
  assert.equal(store.getSnapshot().referralCode, "MBMC");
  assert.equal(store.getSnapshot().contactUrl, MBMC_CONTACTS.zalo.href);
  assert.equal(store.getSnapshot().contactLabel, MBMC_CONTACTS.zalo.label);
  assert.equal(store.getSnapshot().referralEvidence, null);
  assert.equal(store.getSnapshot().shareReferralCode, "MBMC");
  await store.synchronize("", cookie, lookup, persist);
  assert.equal(store.getSnapshot().referralCode, "MBMC");
  assert.equal(store.getServerSnapshot(), SERVER_CONTACT_SNAPSHOT);
  assert.equal(store.getServerSnapshot().contactLabel, store.getSnapshot().contactLabel);
});

test("out-of-order RPC completion cannot restore an older owner or persisted referral", async () => {
  const store = createContactAttributionStore();
  let finish, cookie = "MBMC";
  const oldRequest = store.synchronize("?ref=5DZE", cookie, () => new Promise(resolve => { finish = resolve; }), code => { cookie = code; });
  await store.synchronize("?ref=MBMC", cookie, lookup, code => { cookie = code; });
  finish(kris); await oldRequest;
  assert.equal(store.getSnapshot().referralCode, "MBMC");
  assert.equal(cookie, "MBMC");
});

test("lookup cache deduplicates the same code while separating concurrent owners and retrying failures", async () => {
  const finishes = new Map(), calls = [];
  const resolve = createReferralLookup(code => { calls.push(code); return new Promise(done => finishes.set(code, done)); });
  const one = resolve("5DZE"), repeat = resolve("5DZE"), other = resolve("XMG4");
  await Promise.resolve();
  assert.equal(one, repeat);
  assert.deepEqual(calls, ["5DZE", "XMG4"]);
  finishes.get("XMG4")(zaloCtv); finishes.get("5DZE")(kris);
  assert.equal(await one, kris); assert.equal(await other, zaloCtv);
  assert.equal(await resolve("5DZE"), kris);
  let attempts = 0;
  const retry = createReferralLookup(async () => { if (++attempts === 1) throw new Error("offline"); return kris; });
  assert.equal(await retry("5DZE"), null); assert.equal(await retry("5DZE"), kris);
});

test("filter URL edits retain explicit ref intent even before RPC completion and preserve canonical shares", async () => {
  const store = createContactAttributionStore();
  let cookie = "5DZE";
  await store.synchronize("?ref=MBMC", cookie, lookup, code => { cookie = code; });
  const state = { query: "", sort: "price-asc", facets: { ...emptyInventoryFacets(), family: "air", chip: ["m1"] } };
  const serialized = serializeInventoryUrlState(state);
  const ref = referralForQueryUpdate("?ref=MBMC", store.getSnapshot().shareReferralCode);
  const filteredUrl = withFunnelReferral("/may-dang-co" + serialized, ref);
  assert.equal(new URL(filteredUrl, "https://mbmc.vn").searchParams.get("ref"), "MBMC");
  await store.synchronize(filteredUrl.split("?")[1], cookie, lookup, code => { cookie = code; });
  assert.equal(store.getSnapshot().referralCode, "MBMC");
  assert.equal(referralForQueryUpdate("?ref=5DZE", null), "5DZE");
  assert.equal(buildInventoryShareUrl("https://mbmc.vn", state, store.getSnapshot().shareReferralCode), "https://mbmc.vn/may-dang-co?family=air&chip=m1&sort=price-asc&ref=MBMC");
  assert.deepEqual(parseInventoryUrlState(new URLSearchParams(serialized)), state);
  assert.equal(buildInventoryShareUrl("https://mbmc.vn", state, null).includes("ref="), false);
});

test("explicit ownership propagates only through intended funnel routes and not Care or unrelated routes", () => {
  for (const route of ["/", "/may-dang-co", "/may/mbmc-ftff", "/chon-macbook"]) assert.equal(new URL(withFunnelReferral(route, "MBMC"), "https://mbmc.vn").searchParams.get("ref"), "MBMC");
  for (const route of ["/care", "/care/MBMC-FTFF", "/people", "/chinh-sach", "/phan-mem", "https://example.com/", "//example.com/"]) assert.equal(withFunnelReferral(route, "5DZE"), route);
  assert.equal(withFunnelReferral("/may-dang-co?chip=m1&ref=5DZE#filters", "MBMC"), "/may-dang-co?chip=m1&ref=MBMC#filters");
  assert.equal(buildMachineShareUrl("https://mbmc.vn/may/mbmc-ftff?channel=messenger", "MBMC"), "https://mbmc.vn/may/mbmc-ftff?ref=MBMC");
});

test("an unresolved same-URL ref re-evaluates a changed valid cookie instead of retaining stale ownership", async () => {
  const store = createContactAttributionStore();
  await store.synchronize("?ref=ABCD", "5DZE", lookup, () => {});
  assert.equal(store.getSnapshot().referralCode, "5DZE");
  await store.synchronize("?ref=ABCD", "MBMC", lookup, () => {});
  assert.equal(store.getSnapshot().referralCode, "MBMC");
  assert.equal(store.getSnapshot().referralEvidence, null);
});
