"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchFilterState } from "@/types";

interface SearchContextType {
  filters: SearchFilterState;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  updateFilter: (newFilters: Partial<SearchFilterState>) => void;
  clearFilters: () => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  searchModalTab: "where" | "dates" | "who";
  openSearchModal: (tab?: "where" | "dates" | "who") => void;
}

const defaultFilters: SearchFilterState = {};

const SearchContext = createContext<SearchContextType>({
  filters: defaultFilters,
  setFilters: () => {},
  updateFilter: () => {},
  clearFilters: () => {},
  isSearchModalOpen: false,
  setIsSearchModalOpen: () => {},
  searchModalTab: "where",
  openSearchModal: () => {},
});

function SearchProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilterState>(() => {
    const s = searchParams.get("search") || undefined;
    const city = searchParams.get("city") || undefined;
    const category = searchParams.get("category") || undefined;
    const guests = searchParams.get("guests") ? parseInt(searchParams.get("guests")!, 10) : undefined;
    const start_date = searchParams.get("start_date") || undefined;
    const end_date = searchParams.get("end_date") || undefined;
    const min_price = searchParams.get("min_price") ? parseInt(searchParams.get("min_price")!, 10) : undefined;
    const max_price = searchParams.get("max_price") ? parseInt(searchParams.get("max_price")!, 10) : undefined;
    const property_type = searchParams.get("property_type") || undefined;
    const amenities = searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : undefined;

    return {
      search: s,
      city,
      category,
      guests,
      start_date,
      end_date,
      min_price,
      max_price,
      property_type,
      amenities,
    };
  });

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchModalTab, setSearchModalTab] = useState<"where" | "dates" | "who">("where");

  useEffect(() => {
    const s = searchParams.get("search") || undefined;
    const city = searchParams.get("city") || undefined;
    const category = searchParams.get("category") || undefined;
    const guests = searchParams.get("guests") ? parseInt(searchParams.get("guests")!, 10) : undefined;
    const start_date = searchParams.get("start_date") || undefined;
    const end_date = searchParams.get("end_date") || undefined;
    const min_price = searchParams.get("min_price") ? parseInt(searchParams.get("min_price")!, 10) : undefined;
    const max_price = searchParams.get("max_price") ? parseInt(searchParams.get("max_price")!, 10) : undefined;
    const property_type = searchParams.get("property_type") || undefined;
    const amenities = searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : undefined;

    setFilters((prev) => ({
      ...prev,
      search: s,
      city,
      category,
      guests,
      start_date,
      end_date,
      min_price,
      max_price,
      property_type,
      amenities,
    }));
  }, [searchParams]);

  const updateFilter = useCallback(
    (newFilters: Partial<SearchFilterState>) => {
      setFilters((prev) => {
        const updated = { ...prev, ...newFilters };

        const q = new URLSearchParams();
        if (updated.search) q.append("search", updated.search);
        if (updated.city) q.append("city", updated.city);
        if (updated.category && updated.category !== "All") q.append("category", updated.category);
        if (updated.guests && updated.guests > 0) q.append("guests", updated.guests.toString());
        if (updated.start_date) q.append("start_date", updated.start_date);
        if (updated.end_date) q.append("end_date", updated.end_date);
        if (updated.min_price) q.append("min_price", updated.min_price.toString());
        if (updated.max_price) q.append("max_price", updated.max_price.toString());
        if (updated.property_type && updated.property_type !== "Any") q.append("property_type", updated.property_type);
        if (updated.amenities && updated.amenities.length > 0) q.append("amenities", updated.amenities.join(","));

        const qs = q.toString();
        const targetUrl = qs ? `/?${qs}` : "/";

        setTimeout(() => { if (pathname === "/") { router.push(targetUrl, { scroll: false }); } else { router.push(targetUrl); } }, 0);

        return updated;
      });
    },
    [router, pathname]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setTimeout(() => { if (pathname === "/") { router.push("/", { scroll: false }); } else { router.push("/"); } }, 0);
  }, [router, pathname]);

  const openSearchModal = useCallback((tab: "where" | "dates" | "who" = "where") => {
    setSearchModalTab(tab);
    setIsSearchModalOpen(true);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        clearFilters,
        isSearchModalOpen,
        setIsSearchModalOpen,
        searchModalTab,
        openSearchModal,
      }}
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