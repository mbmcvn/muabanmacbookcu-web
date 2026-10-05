"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  FacetGroup,
  InventoryFacets,
  InventorySort,
  MultiFacetGroup,
} from "@/data/machines/public-inventory-query";
import {
  nextOpenFilter,
  selectFacetValues,
  type FilterControlGroup,
  type OpenFilter,
} from "./inventory-filter-interaction";
import { applicableInventoryFacetGroups } from "@/data/machines/public-inventory-query";

import { facetOptions } from "./inventory-facet-options";
export { facetOptions } from "./inventory-facet-options";

const groupLabels: Record<FacetGroup, string> = {
  price: "Giá",
  family: "Dòng máy",
  chip: "Chip",
  ram: "RAM",
  screen: "Kích thước",
  display: "Màn hình",
  storageType: "Loại bộ nhớ",
  storage: "Bộ nhớ",
};

const mobileGroupLabels: Record<FacetGroup, string> = {
  price: "Giá",
  family: "Dòng",
  chip: "Chip",
  ram: "RAM",
  screen: "Màn hình",
  display: "Màn hình",
  storageType: "Loại nhớ",
  storage: "Bộ nhớ",
};

const mobileOptionLabels: Record<string, string> = {
  "under-12": "<12tr",
  "12-15": "12–15tr",
  "15-18": "15–18tr",
  "over-18": ">18tr",
  air: "Air",
  pro: "Pro",
  mini: "Mac mini",
  fusion: "Fusion",
  "1024-plus": "1TB+",
  "m1-pro-max": "M1 Pro+",
  "m2-pro-max": "M2 Pro+",
  "m3-plus": "M3+",
  compact: '13–14"',
  large: '15–16"',
  "21.5": '21.5"',
  "21.5-4k": '21.5" 4K',
  "24-4.5k": '24" 4.5K',
  "27-5k": '27" 5K',
};

const sortOptions: readonly {
  value: InventorySort;
  label: string;
  shortLabel: string;
}[] = [
  { value: "relevance", label: "Phù hợp nhất", shortLabel: "Phù hợp" },
  { value: "newest", label: "Mới nhập", shortLabel: "Mới nhất" },
  { value: "price-asc", label: "Giá thấp đến cao", shortLabel: "Giá thấp" },
  { value: "price-desc", label: "Giá cao đến thấp", shortLabel: "Giá cao" },
];

export type FacetCountMap = Record<string, number>;

function optionKey(group: FacetGroup, value: string) {
  return `${group}:${value}`;
}

function selectedValues(facets: InventoryFacets, group: FacetGroup): string[] {
  if (group === "price") return facets.price ? [facets.price] : [];
  if (group === "family") return facets.family ? [facets.family] : [];
  return facets[group];
}

function summaryFor(
  group: FacetGroup,
  facets: InventoryFacets,
  mobile: boolean,
): string {
  const selected = selectedValues(facets, group);
  const groupLabel = mobile ? mobileGroupLabels[group] : groupLabels[group];
  if (!selected.length) return groupLabel;
  const options = facetOptions[group] as readonly {
    value: string;
    label: string;
  }[];
  const label = options.find((option) => option.value === selected[0])?.label;
  const selectedLabel = mobile
    ? (mobileOptionLabels[selected[0]] ?? label)
    : label;
  return selected.length === 1
    ? `${groupLabel} · ${selectedLabel}`
    : `${groupLabel} · ${selected.length}`;
}

function useMobileInventoryMode(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 39.99rem)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}

export function InventoryFilters({
  facets,
  sort,
  counts,
  showModernChip,
  onPriceChange,
  onFamilyChange,
  onMultiChange,
  onSortChange,
  onRemove,
  onClearAll,
  shareAction,
}: {
  facets: InventoryFacets;
  sort: InventorySort;
  counts: FacetCountMap;
  showModernChip: boolean;
  onPriceChange: (value: InventoryFacets["price"]) => void;
  onFamilyChange: (value: InventoryFacets["family"]) => void;
  onMultiChange: (group: MultiFacetGroup, values: string[]) => void;
  onSortChange: (value: InventorySort) => void;
  onRemove: (group: FacetGroup, value: string) => void;
  onClearAll: () => void;
  shareAction: ReactNode;
}) {
  const mobile = useMobileInventoryMode();
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<
    Partial<Record<FilterControlGroup, HTMLButtonElement>>
  >({});
  const groups = applicableInventoryFacetGroups(facets.family);
  const active = groups.flatMap((group) => {
    const options = facetOptions[group] as readonly {
      value: string;
      label: string;
    }[];
    return selectedValues(facets, group).map((value) => ({
      group,
      value,
      label: options.find((option) => option.value === value)?.label ?? value,
    }));
  });

  const closeFilter = useCallback(
    (returnFocus = false) => {
      const trigger = openFilter ? triggerRefs.current[openFilter] : null;
      setOpenFilter(null);
      if (returnFocus) window.requestAnimationFrame(() => trigger?.focus());
    },
    [openFilter],
  );

  useEffect(() => {
    if (openFilter === null) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) closeFilter();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFilter(true);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeFilter, openFilter]);

  return (
    <div className="facet-filter">
      <div
        className="facet-groups"
        aria-label="Bộ lọc danh sách máy"
        ref={toolbarRef}
      >
        {groups.map((group) => {
          const isOpen = openFilter === group;
          const selected = selectedValues(facets, group);
          const options = (
            facetOptions[group] as readonly { value: string; label: string }[]
          ).filter(
            (option) =>
              (showModernChip || group !== "chip" || option.value !== "m3-plus") &&
              (group !== "display" ||
                (counts[optionKey(group, option.value)] ?? 0) > 0 ||
                selected.includes(option.value)),
          );
          const panelId = `facet-panel-${group}`;
          return (
            <div className="facet-group" data-open={isOpen} key={group}>
              <button
                className="facet-trigger"
                type="button"
                aria-label={`Bộ lọc ${groupLabels[group]}${selected.length ? `, ${summaryFor(group, facets, false)}` : ""}`}
                title={summaryFor(group, facets, false)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                ref={(node) => {
                  triggerRefs.current[group] = node ?? undefined;
                }}
                onClick={() =>
                  setOpenFilter((current) => nextOpenFilter(current, group))
                }
              >
                <span className="facet-trigger-label">
                  {summaryFor(group, facets, mobile)}
                </span>
                <span className="facet-trigger-chevron" aria-hidden="true">
                  ⌄
                </span>
              </button>
              {isOpen ? (
                <fieldset id={panelId}>
                  <legend>{groupLabels[group]}</legend>
                  {mobile ? (
                    <button
                      type="button"
                      aria-pressed={!selected.length}
                      onClick={() => {
                        if (group === "price") onPriceChange(null);
                        else if (group === "family") onFamilyChange(null);
                        else onMultiChange(group, []);
                        closeFilter(true);
                      }}
                    >
                      <span>Tất cả</span>
                    </button>
                  ) : null}
                  {options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    const count = counts[optionKey(group, option.value)] ?? 0;
                    const disabled = count === 0 && !isSelected;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={disabled}
                        onClick={() => {
                          if (group === "price") {
                            onPriceChange(
                              isSelected
                                ? null
                                : (option.value as InventoryFacets["price"]),
                            );
                            closeFilter(true);
                          } else if (group === "family") {
                            onFamilyChange(
                              isSelected
                                ? null
                                : (option.value as InventoryFacets["family"]),
                            );
                            closeFilter(true);
                          } else {
                            const values = selectFacetValues(
                              selected,
                              option.value,
                              mobile,
                            );
                            onMultiChange(group, values);
                            if (mobile) closeFilter(true);
                          }
                        }}
                      >
                        <span>{option.label}</span>
                        <span aria-label={`${count} máy`}>{count}</span>
                      </button>
                    );
                  })}
                </fieldset>
              ) : null}
            </div>
          );
        })}
        <div
          className="facet-group mobile-sort-control"
          data-open={openFilter === "sort"}
        >
          <button
            className="facet-trigger"
            type="button"
            aria-label={`Sắp xếp, ${sortOptions.find((option) => option.value === sort)?.label}`}
            aria-expanded={openFilter === "sort"}
            aria-controls="facet-panel-sort"
            ref={(node) => {
              triggerRefs.current.sort = node ?? undefined;
            }}
            onClick={() =>
              setOpenFilter((current) => nextOpenFilter(current, "sort"))
            }
          >
            <span className="facet-trigger-label">
              Sắp xếp ·{" "}
              {sortOptions.find((option) => option.value === sort)?.shortLabel}
            </span>
            <span className="facet-trigger-chevron" aria-hidden="true">
              ⌄
            </span>
          </button>
          {openFilter === "sort" ? (
            <fieldset id="facet-panel-sort">
              <legend>Sắp xếp</legend>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={sort === option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    closeFilter(true);
                  }}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </fieldset>
          ) : null}
        </div>
      </div>
      <div className="active-facets" aria-label="Bộ lọc đang áp dụng">
        {active.map((item) => (
          <button
            key={`${item.group}:${item.value}`}
            type="button"
            onClick={() => onRemove(item.group, item.value)}
            aria-label={`Bỏ bộ lọc ${item.label}`}
          >
            {item.label}
            <span aria-hidden="true">×</span>
          </button>
        ))}
        {active.length ? (
          <button className="clear-facets" type="button" onClick={onClearAll}>
            Xóa tất cả
          </button>
        ) : null}
        {shareAction}
      </div>
    </div>
  );
}
