export const facetOptions = {
  price: [
    { value: "under-12", label: "Dưới 12 triệu" },
    { value: "12-15", label: "12–15 triệu" },
    { value: "15-18", label: "15–18 triệu" },
    { value: "over-18", label: "Trên 18 triệu" },
  ],
  family: [
    { value: "air", label: "MacBook Air" },
    { value: "pro", label: "MacBook Pro" },
    { value: "imac", label: "iMac" },
    { value: "mini", label: "Mac mini" },
  ],
  chip: [
    { value: "intel", label: "Intel" },
    { value: "m1", label: "M1" },
    { value: "m1-pro-max", label: "M1 Pro / M1 Max" },
    { value: "m2", label: "M2" },
    { value: "m2-pro-max", label: "M2 Pro / M2 Max" },
    { value: "m3-plus", label: "M3 trở lên" },
  ],
  ram: [
    { value: "8", label: "8GB" },
    { value: "16", label: "16GB" },
    { value: "32-plus", label: "32GB+" },
  ],
  screen: [
    { value: "compact", label: 'Gọn nhẹ · 13–14"' },
    { value: "large", label: 'Màn lớn · 15–16"' },
  ],
  display: [
    { value: "21.5", label: "21.5 inch" },
    { value: "21.5-4k", label: "21.5 inch · 4K" },
    { value: "24-4.5k", label: "24 inch · 4.5K" },
    { value: "27-5k", label: "27 inch · 5K" },
  ],
  storageType: [
    { value: "ssd", label: "SSD" },
    { value: "fusion", label: "Fusion Drive" },
    { value: "hdd", label: "HDD" },
  ],
  storage: [
    { value: "256", label: "256GB" },
    { value: "512", label: "512GB" },
    { value: "1024-plus", label: "1TB+" },
  ],
} as const;

