import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mock, test } from "node:test";

let availability = {
  data: [
    {
      machine_public_identifier: "MBMC-QRU4",
      availability: "available",
      state_valid: true,
    },
  ],
  error: null,
};
let machine = {
  data: { status: "new_in_stock", deleted_at: null },
  error: null,
};
const calls = [];
mock.module("@/lib/supabase/server", {
  namedExports: {
    createServerSupabaseClient: () => ({
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => machine }) }),
      }),
      rpc: async (name) => {
        calls.push(name);
        return availability;
      },
    }),
  },
});
mock.module("./care-machine-presentation.server", {
  namedExports: {
    getCareMachinePresentation: async () => ({
      displayName: "MacBook",
      image: null,
    }),
  },
});
const { getCurrentMachinePassport } =
  await import("./current-machine-passport.server.ts");

test("anonymous stock passport exposes identity and current availability only", async () => {
  const passport = await getCurrentMachinePassport("MBMC-QRU4");
  assert.deepEqual(passport, {
    machineCode: "MBMC-QRU4",
    displayName: "MacBook",
    image: null,
    availability: "available",
  });
  assert.deepEqual(calls, ["get_public_machine_availability_v1"]);
  availability.data[0].availability = "reserved";
  assert.equal(
    (await getCurrentMachinePassport("MBMC-QRU4")).availability,
    "reserved",
  );
  availability.data[0].state_valid = false;
  assert.equal(
    (await getCurrentMachinePassport("MBMC-QRU4")).availability,
    "unavailable",
  );
  availability = { data: [], error: null };
  assert.equal(
    (await getCurrentMachinePassport("MBMC-QRU4")).availability,
    "unavailable",
  );
  availability = { data: null, error: { message: "failed" } };
  assert.equal(
    (await getCurrentMachinePassport("MBMC-QRU4")).availability,
    "unavailable",
  );
});

test("sold machines keep authenticated Care and stock read failures fail closed", async () => {
  machine = { data: { status: "sold", deleted_at: null }, error: null };
  assert.equal(await getCurrentMachinePassport("MBMC-QRU4"), null);
  machine = { data: null, error: { message: "unavailable" } };
  await assert.rejects(
    getCurrentMachinePassport("MBMC-QRU4"),
    /temporarily unavailable/,
  );
});

test("historical warranty and handover remain behind existing authorization", () => {
  const page = readFileSync(
    new URL("../../app/care/[machine_id]/page.tsx", import.meta.url),
    "utf8",
  );
  const anonymous = page.slice(
    page.indexOf("if (currentPassport && !access)"),
    page.indexOf("const lifecycle ="),
  );
  assert.doesNotMatch(
    anonymous,
    /getPublicCarePassport|getCareStory|CareActions/,
  );
  assert.match(anonymous, /VerificationForm\s+embedded/);
  assert.match(
    page,
    /LifecycleHistory historical=\{Boolean\(currentPassport\)\}/,
  );
  const repository = readFileSync(
    new URL("./care-repository.server.ts", import.meta.url),
    "utf8",
  );
  assert.match(repository, /ownership\.sale\.id !== access\.saleId/);
  assert.match(repository, /ownership\.owner\.id !== access\.ownershipId/);
});

test("handover request stays bound to the verified Sale", () => {
  const loader = readFileSync(
    new URL("../handover/get-care-story.server.ts", import.meta.url),
    "utf8",
  );
  assert.match(loader, /get_public_care_handover_story_for_sale/);
  assert.match(loader, /p_sale_id: access.saleId/);
  assert.match(loader, /access.machineCode !== machineCode/);
});
