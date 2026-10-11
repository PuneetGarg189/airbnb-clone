"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SearchFilterState } from "@/types";

type Tab = "where" | "dates" | "who";

interface SearchContextType {
  filters: SearchFilterState;
  updateFilter: (newFilters: Partial<SearchFilterState>) => void;
  clearFilters: () => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  searchModalTab: Tab;
  openSearchModal: (tab?: Tab) => void;
}

const SearchContext = createContext<SearchContextType>({
  filters: {},
  updateFilter: () => {},
  clearFilters: () => {},
  isSearchModalOpen: false,
  setIsSearchModalOpen: () => {},
  searchModalTab: "where",
  openSearchModal: () => {},
});

const int = (v: string | null) => (v ? parseInt(v, 10) || undefined : undefined);

/** The URL is the single source of truth for filters (shareable, back-button friendly). */
function parseFilters(p: URLSearchParams): SearchFilterState {
  return {
    search: p.get("search") || undefined,
    city: p.get("city") || undefined,
    category: p.get("category") || undefined,
    guests: int(p.get("guests")),
    start_date: p.get("start_date") || undefined,
    end_date: p.get("end_date") || undefined,
    min_price: int(p.get("min_price")),
    max_price: int(p.get("max_price")),
    property_type: p.get("property_type") || undefined,
    amenities: p.get("amenities") ? p.get("amenities")!.split(",") : undefined,
  };
}

function toQuery(f: SearchFilterState): string {
  const q = new URLSearchParams();
  if (f.search) q.set("search", f.search);
  if (f.city) q.set("city", f.city);
  if (f.category && f.category !== "All") q.set("category", f.category);
  if (f.guests && f.guests > 0) q.set("guests", String(f.guests));
  if (f.start_date && f.end_date) {
    q.set("start_date", f.start_date);
    q.set("end_date", f.end_date);
  }
  if (f.min_price) q.set("min_price", String(f.min_price));
  if (f.max_price) q.set("max_price", String(f.max_price));
  if (f.property_type && f.property_type !== "Any") q.set("property_type", f.property_type);
  if (f.amenities?.length) q.set("amenities", f.amenities.join(","));
  return q.toString();
}

function SearchProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramString = searchParams.toString();

  const filters = useMemo(() => parseFilters(new URLSearchParams(paramString)), [paramString]);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchModalTab, setSearchModalTab] = useState<Tab>("where");

  const go = useCallback(
    (f: SearchFilterState) => {
      const qs = toQuery(f);
      router.push(qs ? `/?${qs}` : "/", { scroll: pathname !== "/" });
    },
    [router, pathname]
  );

  const updateFilter = useCallback((next: Partial<SearchFilterState>) => go({ ...filters, ...next }), [go, filters]);
  const clearFilters = useCallback(() => go({}), [go]);

  const openSearchModal = useCallback((tab: Tab = "where") => {
    setSearchModalTab(tab);
    setIsSearchModalOpen(true);
  }, []);

  return (
    <SearchContext.Provider
      value={{ filters, updateFilter, clearFilters, isSearchModalOpen, setIsSearchModalOpen, searchModalTab, openSearchModal }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <SearchProviderInner>{children}</SearchProviderInner>
    </Suspense>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
