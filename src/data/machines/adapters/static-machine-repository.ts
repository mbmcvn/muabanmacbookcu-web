import "server-only";

import type { InventoryQuery, MachineDetail } from "@/models";
import type { MachineRepository } from "../machine-repository";

const machines: MachineDetail[] = [
  {
    slug: "macbook-air-m2-2022-8-256-midnight",
    publicCode: "MBMC-0182",
    displayName: "MacBook Air M2 2022 · Midnight",
    shortName: "MacBook Air M2 13 inch",
    color: "Midnight",
    contextualLabel: "Mới nhập",
    price: { amount: 18900000, currency: "VND" },
    availability: "available",
    thumbnail: { url: "/window.svg", alt: "MacBook Air M2 màu Midnight", position: 0 },
    images: [{ url: "/window.svg", alt: "MacBook Air M2 màu Midnight", position: 0 }],
    decisionSpecifications: {
      chip: "Apple M2",
      ramGb: 8,
      storageGb: 256,
      batteryHealthPercent: 93,
      cycleCount: 118,
      cosmeticCondition: "very-good",
      warrantyMonths: 6,
      inspectionResult: "passed-with-notes",
    },
    conditionSummary: "Ngoại hình rất tốt, có vết sử dụng nhẹ ở cạnh máy.",
    updatedAt: "2026-07-15T08:00:00.000Z",
    expertSummary: "Phù hợp cho công việc văn phòng, học tập và di chuyển thường xuyên.",
    technicalSpecifications: {
      groups: [
        { title: "Hiển thị", items: [{ label: "Màn hình", value: "Liquid Retina 13,6 inch" }] },
        { title: "Kết nối", items: [{ label: "Cổng", value: "MagSafe 3, 2 × Thunderbolt" }] },
      ],
    },
    conditionNotes: [{ area: "body", summary: "Vết sử dụng nhẹ ở cạnh phải." }],
    includedItems: ["Máy", "Sạc USB-C"],
    passport: {
      identity: { publicReference: "MBMC-AIR-M2-001", model: "MacBook Air", modelYear: 2022 },
      status: { availability: "available", verifiedAt: "2026-07-15T08:00:00.000Z" },
      facts: [{ label: "Màu", value: "Midnight" }],
      timeline: [{ date: "2026-07-15T08:00:00.000Z", title: "Hoàn tất kiểm tra công khai" }],
      inspection: {
        result: "passed-with-notes",
        items: [
          { label: "Màn hình", result: "passed" },
          { label: "Ngoại hình", result: "note", note: "Có vết sử dụng nhẹ." },
        ],
      },
      sourceVerification: { label: "Thông tin máy đã được MBMC đối chiếu", verified: true },
    },
  },
  {
    slug: "macbook-pro-m1-2020-16-512-space-gray",
    publicCode: "MBMC-0176",
    displayName: "MacBook Pro M1 2020 · Space Gray",
    shortName: "MacBook Pro M1 13 inch",
    color: "Space Gray",
    contextualLabel: "Cấu hình cao",
    price: { amount: 17900000, currency: "VND" },
    availability: "available",
    thumbnail: { url: "/window.svg", alt: "MacBook Pro M1 màu Space Gray", position: 0 },
    images: [{ url: "/window.svg", alt: "MacBook Pro M1 màu Space Gray", position: 0 }],
    decisionSpecifications: {
      chip: "Apple M1",
      ramGb: 16,
      storageGb: 512,
      batteryHealthPercent: 89,
      cycleCount: 246,
      cosmeticCondition: "good",
      warrantyMonths: 3,
      inspectionResult: "passed",
    },
    conditionSummary: "Ngoại hình tốt, dấu hiệu sử dụng thông thường.",
    updatedAt: "2026-07-14T08:00:00.000Z",
    expertSummary: "Cấu hình RAM 16 GB phù hợp cho lập trình và tác vụ chuyên môn vừa phải.",
    technicalSpecifications: {
      groups: [{ title: "Hiển thị", items: [{ label: "Màn hình", value: "Retina 13,3 inch" }] }],
    },
    conditionNotes: [{ area: "body", summary: "Có xước nhỏ không ảnh hưởng sử dụng." }],
    includedItems: ["Máy", "Sạc USB-C"],
    passport: {
      identity: { publicReference: "MBMC-PRO-M1-002", model: "MacBook Pro", modelYear: 2020 },
      status: { availability: "available", verifiedAt: "2026-07-14T08:00:00.000Z" },
      facts: [{ label: "Màu", value: "Space Gray" }],
      timeline: [{ date: "2026-07-14T08:00:00.000Z", title: "Hoàn tất kiểm tra công khai" }],
      inspection: { result: "passed", items: [{ label: "Chức năng chính", result: "passed" }] },
      sourceVerification: { label: "Thông tin máy đã được MBMC đối chiếu", verified: true },
    },
  },
];

export const staticMachineRepository: MachineRepository = {
  async findAvailable(query: InventoryQuery = {}) {
    const items = machines.filter((machine) => machine.availability === "available");
    return { items, total: items.length, appliedQuery: query };
  },
  async findPublishedBySlug(slug) {
    return machines.find((machine) => machine.slug === slug) ?? null;
  },
};
