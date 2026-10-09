"use client";

import React, { useRef, useState } from "react";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Flame,
  Home,
  Palmtree,
  Sparkles,
  Waves,
  Trees,
  Castle,
  Snowflake,
  Mountain,
  Building2,
  Compass,
} from "lucide-react";
import FilterModal from "./FilterModal";
import { SearchFilterState } from "@/types";

interface CategoriesBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onApplyFilters: (filters: Partial<SearchFilterState>) => void;
  currentFilters?: SearchFilterState;
}

const CATEGORIES = [
  { label: "All", icon: Compass },
  { label: "Cabins", icon: Home },
  { label: "Beachfront", icon: Palmtree },
  { label: "Mansions", icon: Castle },
  { label: "Amazing pools", icon: Waves },
  { label: "Treehouses", icon: Trees },
  { label: "Lakefront", icon: Waves },
  { label: "Countryside", icon: Mountain },
  { label: "Skiing", icon: Snowflake },
  { label: "Islands", icon: Palmtree },
  { label: "Iconic cities", icon: Building2 },
];

export default function CategoriesBar({
  activeCategory,
  onSelectCategory,
  onApplyFilters,
  currentFilters,
}: CategoriesBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const activeFiltersCount = [
    currentFilters?.min_price,
    currentFilters?.max_price,
    currentFilters?.property_type,
    currentFilters?.amenities?.length,
  ].filter(Boolean).length;

  return (
    <>
      <div className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          {/* Categories Carousel */}
          <div className="relative flex-1 overflow-hidden group">
            {/* Left Scroll Button */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:scale-105 transition cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Scrollable list */}
            <div
              ref={scrollRef}
              className="flex items-center gap-8 overflow-x-auto no-scrollbar scroll-smooth px-2 py-1"
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory.toLowerCase() === cat.label.toLowerCase();
                return (
                  <button
                    key={cat.label}
                    onClick={() => onSelectCategory(cat.label)}
                    className={`flex flex-col items-center gap-2 pb-2 transition cursor-pointer shrink-0 border-b-2 ${
                      isActive
                        ? "border-black text-black opacity-100"
                        : "border-transparent text-gray-500 opacity-70 hover:opacity-100 hover:border-gray-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:scale-105 transition cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2.5 rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-800 hover:border-black transition cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={onApplyFilters}
        currentFilters={currentFilters}
      />
    </>
  );
}
