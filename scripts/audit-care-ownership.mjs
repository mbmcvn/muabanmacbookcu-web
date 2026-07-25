import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnv() {
  const source = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of source.split(/\r?\n/u)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/u);
    if (!match || process.env[match[1]]) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function normalizePhone(value) {
  const normalized = String(value ?? "")
    .replace(/[^\d+]/gu, "")
    .replace(/^\+84/u, "0")
    .replace(/^84/u, "0");
  return /^0(?:3|5|7|8|9)\d{8}$/u.test(normalized) ? normalized : null;
}

function instant(row) {
  return (
    row.sales?.completed_at ??
    row.sales?.sold_at ??
    row.activated_at ??
    row.created_at ??
    ""
  );
}

loadLocalEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Supabase audit credentials are unavailable.");

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await client
  .from("machine_owners")
  .select(
    "id, machine_id, sale_id, activated_at, created_at, phone, sales(id, machine_id, lifecycle_status, payment_status, handover_status, completed_at, sold_at, created_at), machines!machine_owners_machine_id_fkey(id, machine_id, status, sold_at)",
  )
  .order("created_at", { ascending: true });

if (error) throw new Error(`Care audit query failed: ${error.code}`);

const rows = data ?? [];
const byCode = Map.groupBy(rows, (row) => row.machine_id);
const buckets = new Map();
const details = [];

function add(bucket, code) {
  const codes = buckets.get(bucket) ?? new Set();
  codes.add(code);
  buckets.set(bucket, codes);
}

for (const [machineCode, candidates] of byCode) {
  const completed = candidates
    .filter(
      (row) =>
        row.sale_id &&
        row.sales?.lifecycle_status === "completed" &&
        row.sales?.machine_id === row.machines?.id,
    )
    .sort((a, b) => instant(b).localeCompare(instant(a)));
  const activated = candidates.filter((row) => row.activated_at);
  let bucket;
  let selected = null;

  if (candidates.length > 1 && activated.length > 1) {
    const latestCompleted = completed[0] ?? null;
    const competing = activated.filter(
      (row) => !latestCompleted || row.id !== latestCompleted.id,
    );
    if (competing.some((row) => instant(row) >= instant(latestCompleted ?? {}))) {
      bucket = "multiple competing activated owners";
    }
  }
  if (!bucket && completed.length) {
    bucket =
      completed.length > 1
        ? "multiple completed ownership cycles"
        : "completed Sale + exact ownership sale_id";
    selected = completed[0];
  }
  if (!bucket && candidates.length > 1) bucket = "multiple ownership records";
  if (!bucket && candidates[0].sale_id == null) {
    bucket = "activated ownership with null sale_id";
    selected = candidates[0];
  }
  if (!bucket && !candidates[0].sales) {
    bucket = "activated ownership with missing Sale";
    selected = candidates[0];
  }
  if (!bucket && candidates[0].sales.machine_id !== candidates[0].machines?.id) {
    bucket = "ownership Sale belongs to another machine";
    selected = candidates[0];
  }
  if (!bucket && candidates[0].sales.lifecycle_status === "draft") {
    bucket = "activated ownership linked to draft Sale";
    selected = candidates[0];
  }
  if (!bucket && candidates[0].sales.lifecycle_status === "reserved") {
    bucket = "activated ownership linked to reserved Sale";
    selected = candidates[0];
  }
  if (!bucket && candidates[0].sales.lifecycle_status === "cancelled") {
    bucket = "activated ownership linked to cancelled Sale";
    selected = candidates[0];
  }
  if (!bucket) {
    bucket = "other inconsistent legacy shape";
    selected = candidates[0];
  }
  if (selected && !normalizePhone(selected.phone)) {
    bucket = "invalid stored phone";
  }
  add(bucket, machineCode);
  details.push({
    machineCode,
    bucket,
    ownerCount: candidates.length,
    completedOwnerCycleCount: completed.length,
    selectedOwnershipId: selected?.id ?? null,
    selectedSaleId: selected?.sale_id ?? null,
    saleLifecycle: selected?.sales?.lifecycle_status ?? null,
    salePaymentStatus: selected?.sales?.payment_status ?? null,
    saleHandoverStatus: selected?.sales?.handover_status ?? null,
    ownershipActivated: Boolean(selected?.activated_at),
    storedPhoneValid: selected ? Boolean(normalizePhone(selected.phone)) : null,
    machineStatus: selected?.machines?.status ?? candidates[0]?.machines?.status ?? null,
  });
}

const output = {
  activatedOwnershipRows: rows.filter((row) => row.activated_at).length,
  ownershipRows: rows.length,
  machineCount: byCode.size,
  buckets: [...buckets.entries()]
    .map(([bucket, codes]) => ({
      bucket,
      count: codes.size,
      machineCodes: [...codes].sort(),
    }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket)),
  details: details.sort((a, b) => a.machineCode.localeCompare(b.machineCode)),
};

console.log(JSON.stringify(output, null, 2));
