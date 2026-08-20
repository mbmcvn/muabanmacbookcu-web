import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { normalizePublicCandidate } from "./project-public-candidates.ts";
import { projectPublicMachineV1 } from "../../lib/public-projection/project-machine.server.ts";
import { formatMachineAvailability } from "../../lib/presentation/machine.ts";

function row(
  publicAvailability = {
    availability: "available",
    reservation_kind: null,
    state_valid: true,
  },
) {
  return {
    machine_id: "MBMC-A001",
    status: "new_in_stock",
    deleted_at: null,
    model_text: "MacBook Air M1",
    chip: "Apple M1",
    ram_gb: 8,
    ssd_gb: 256,
    color: "Space Gray",
    retail_price_expected: 15_000_000,
    battery_health: 95,
    battery_cycle: 100,
    rank: "A",
    public_availability: publicAvailability,
    machine_publications: [
      {
        status: "published",
        slug: "macbook-air-m1-a001",
        revision: 3,
        approved_by: "owner",
        approved_at: "2026-07-20T01:00:00Z",
        approved_editorial_revision: 1,
        published_by: "owner",
        first_published_at: "2026-07-20T02:00:00Z",
        published_at: "2026-07-20T02:00:00Z",
        published_editorial_revision: 1,
        updated_at: "2026-07-20T02:00:00Z",
      },
    ],
    machine_editorials: [
      {
        revision: 1,
        public_condition_summary: "Reviewed condition",
        suitable_for: [],
        not_suitable_for: [],
        included_items: {
          charger: true,
          cable: true,
          box: null,
          bag: null,
          accessories: [],
        },
        policy_applicability: [],
        reviewed_by: "owner",
        reviewed_at: "2026-07-20T01:00:00Z",
      },
    ],
    machine_images: [
      {
        id: "cover",
        public_url: "https://cdn.example.test/cover.webp",
        image_type: "cover",
        image_stage: "listing",
        visibility: "public",
        sort_order: 0,
        is_cover: true,
      },
    ],
  };
}

function project(publicAvailability) {
  const candidate = normalizePublicCandidate(row(publicAvailability));
  assert.ok(candidate);
  return projectPublicMachineV1(candidate);
}

test("public projector derives available and both reservation kinds", () => {
  const available = project({
    availability: "available",
    reservation_kind: null,
    state_valid: true,
  });
  assert.equal(available.eligible, true);
  assert.equal(available.summary.availability, "available");
  assert.equal(available.summary.reservationKind, null);

  const manual = project({
    availability: "reserved",
    reservation_kind: "manual",
    state_valid: true,
  });
  assert.equal(manual.eligible, true);
  assert.equal(manual.summary.availability, "reserved");
  assert.equal(manual.summary.reservationKind, "manual");

  const deposit = project({
    availability: "reserved",
    reservation_kind: "deposit",
    state_valid: true,
  });
  assert.equal(deposit.eligible, true);
  assert.equal(deposit.summary.reservationKind, "deposit");
  assert.equal(formatMachineAvailability("reserved", "manual"), "Đang giữ");
  assert.equal(
    formatMachineAvailability("reserved", "deposit"),
    "Đã có khách cọc",
  );
});

test("a reserved row with an invalid kind fails closed", () => {
  const result = project({
    availability: "unavailable",
    reservation_kind: null,
    state_valid: false,
  });
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("reservation_state_invalid"));
});

test("missing public availability fails closed", () => {
  const result = project(null);
  assert.equal(result.eligible, false);
  assert.ok(result.reasons.includes("reservation_state_invalid"));
});

test("public query consumes only the positive-field availability RPC", () => {
  const repository = readFileSync(
    new URL(
      "./repositories/supabase-public-machine-repository.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(repository, /rpc\("get_public_machine_availability_v1"\)/);
  assert.doesNotMatch(repository, /sales \(/);
  assert.doesNotMatch(repository, /payments \(/);
});

test("reserved public UI removes normal purchase actions", () => {
  const card = readFileSync(
    new URL(
      "../../app/(sales)/may-dang-co/_components/MachineCard.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const detail = readFileSync(
    new URL(
      "../../app/(sales)/may/[slug]/_components/DecisionPanel.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(card, /reserved \? "Xem thông tin"/);
  assert.match(detail, /Các thao tác mua được tạm khóa/);
  assert.match(detail, /reserved \?/);
});
