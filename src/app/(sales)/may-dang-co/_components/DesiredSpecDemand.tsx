"use client";
import { useState } from "react";
import { DemandCaptureForm } from "@/components/demand/DemandCaptureForm";
import {
  DESIRED_MACBOOK_SPEC_SCHEMA,
  INVENTORY_CONTEXT_SCHEMA,
  type DesiredMacBookSpecV1,
} from "@/lib/demand-contract";
import type { InventoryUrlState } from "@/data/machines/public-inventory-query";

export function DesiredSpecDemand({
  state,
  referralEvidence,
}: {
  state: InventoryUrlState;
  referralEvidence: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"spec" | "contact">("spec");
  const [family, setFamily] = useState<"" | "air" | "pro">(
    (state.facets.family.length === 1 ? state.facets.family[0] : "") as
      "" | "air" | "pro",
  );
  const [chip, setChip] = useState("");
  const [ram, setRam] = useState(
    state.facets.ram.length === 1 && state.facets.ram[0] !== "32-plus"
      ? state.facets.ram[0]
      : "",
  );
  const [ssd, setSsd] = useState("");
  const [screen, setScreen] = useState("");
  const [budget, setBudget] = useState("");
  const [freeText, setFreeText] = useState(state.query);
  const number = (value: string) => (value ? Number(value) : undefined);
  const spec: DesiredMacBookSpecV1 = {
    schemaVersion: DESIRED_MACBOOK_SPEC_SCHEMA,
    ...(family ? { family } : {}),
    ...(chip.trim() ? { chip: chip.trim() } : {}),
    ...(number(ram) ? { ramGb: number(ram) } : {}),
    ...(number(ssd) ? { ssdGb: number(ssd) } : {}),
    ...(number(screen) ? { screenSizeInches: number(screen) } : {}),
    ...(number(budget)
      ? { budget: { maxVnd: number(budget)! * 1_000_000 } }
      : {}),
    ...(freeText.trim() ? { freeText: freeText.trim() } : {}),
  };
  if (!open)
    return (
      <section className="inventory-state">
        <h2>Không thấy cấu hình bạn đang tìm?</h2>
        <button
          type="button"
          className="quiz-primary"
          onClick={() => setOpen(true)}
        >
          Gửi cấu hình bạn đang tìm
        </button>
      </section>
    );
  if (step === "contact")
    return (
      <DemandCaptureForm
        sourceRoute="may_dang_co"
        referralEvidence={referralEvidence}
        desiredSpecSnapshot={spec}
        inventoryContextSnapshot={{
          schemaVersion: INVENTORY_CONTEXT_SCHEMA,
          sourceRoute: "may_dang_co",
          capturedAt: new Date().toISOString(),
          searchText: state.query,
          inventoryUrlState: state,
          resultCount: 0,
        }}
        onCancel={() => setStep("spec")}
      />
    );
  return (
    <form
      className="demand-form"
      onSubmit={(e) => {
        e.preventDefault();
        setStep("contact");
      }}
    >
      <h2>Cấu hình bạn đang tìm</h2>
      <label>
        Dòng máy
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value as typeof family)}
        >
          <option value="">Chưa xác định</option>
          <option value="air">MacBook Air</option>
          <option value="pro">MacBook Pro</option>
        </select>
      </label>
      <label>
        Chip
        <input
          value={chip}
          onChange={(e) => setChip(e.target.value)}
          placeholder="Ví dụ: M2 Pro"
        />
      </label>
      <label>
        RAM chính xác (GB)
        <input
          type="number"
          min="1"
          value={ram}
          onChange={(e) => setRam(e.target.value)}
        />
      </label>
      <label>
        SSD chính xác (GB)
        <input
          type="number"
          min="1"
          value={ssd}
          onChange={(e) => setSsd(e.target.value)}
        />
      </label>
      <label>
        Kích thước màn hình (inch)
        <input
          type="number"
          min="1"
          value={screen}
          onChange={(e) => setScreen(e.target.value)}
        />
      </label>
      <label>
        Ngân sách tối đa (triệu đồng)
        <input
          type="number"
          min="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </label>
      <label>
        Yêu cầu khác
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Màu, bàn phím, nhu cầu khác…"
        />
      </label>
      <button
        className="quiz-primary"
        disabled={Object.keys(spec).length === 1}
      >
        Tiếp tục
      </button>
    </form>
  );
}
