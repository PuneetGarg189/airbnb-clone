"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import CategoriesBar from "@/components/layout/CategoriesBar";
import ListingGrid from "@/components/listings/ListingGrid";
import MapView from "@/components/map/MapView";
import { fetchListings } from "@/lib/api";
import { ListingCard, SearchFilterState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { Map, List, ChevronLeft, ChevronRight, X, Search, RotateCcw } from "lucide-react";
import { FALLBACK_LISTINGS } from "@/data/fallbackData";

export default function HomePage() {
  const { user } = useAuth();
  const { filters, updateFilter, clearFilters, openSearchModal } = useSearch();

  const [listings, setListings] = useState<ListingCard[]>(FALLBACK_LISTINGS.slice(0, 8));
  const [totalListings, setTotalListings] = useState(FALLBACK_LISTINGS.length);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(FALLBACK_LISTINGS.length / 8));
  const limit = 8;
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadListings = useCallback(
    async (currentFilters: SearchFilterState, pageNum = 1) => {
      setLoading(true);
      try {
        const res = await fetchListings(currentFilters, user.id, pageNum, limit);
        setListings((prev) => {
          if (pageNum === 1) return res.listings;
          const existingIds = new Set(prev.map(l => l.id));
          const newItems = res.listings.filter(l => !existingIds.has(l.id));
          return [...prev, ...newItems];
        });
        setTotalListings(res.total);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.warn("Could not sync with backend, retaining stays:", err);
      } finally {
        setLoading(false);
      }
    },
    [user.id]
  );

  // Fetch whenever filters or page changes
  useEffect(() => {
    loadListings(filters, page);
  }, [filters, page, loadListings]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, page, totalPages]);

  // Reset to page 1 whenever search criteria change
  const handleCategorySelect = (category: string) => {
    setPage(1);
    updateFilter({ category: category === "All" ? undefined : category });
  };

  const handleApplyFilters = (newFilters: Partial<SearchFilterState>) => {
    setPage(1);
    updateFilter(newFilters);
  };

  const handleRemoveFilter = (key: keyof SearchFilterState) => {
    setPage(1);
    if (key === "start_date") {
      updateFilter({ start_date: undefined, end_date: undefined });
    } else {
      updateFilter({ [key]: undefined });
    }
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.city ||
    filters.guests ||
    filters.start_date ||
    filters.min_price ||
    filters.max_price ||
    filters.property_type ||
    (filters.amenities && filters.amenities.length > 0)
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Categories Bar */}
      <CategoriesBar
        activeCategory={filters.category || "All"}
        onSelectCategory={handleCategorySelect}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="pt-4 pb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 mr-1">Active filters:</span>

            {filters.search && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Destination: &ldquo;{filters.search}&rdquo;
                <button
                  onClick={() => handleRemoveFilter("search")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.guests && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Guests: {filters.guests}+
                <button
                  onClick={() => handleRemoveFilter("guests")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.start_date && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Dates: {filters.start_date} {filters.end_date ? `→ ${filters.end_date}` : ""}
                <button
                  onClick={() => handleRemoveFilter("start_date")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Price: ${filters.min_price || 0} - ${filters.max_price || "Any"}
                <button
                  onClick={() => {
                    handleRemoveFilter("min_price");
                    handleRemoveFilter("max_price");
                  }}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.property_type && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Type: {filters.property_type}
                <button
                  onClick={() => handleRemoveFilter("property_type")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setPage(1);
                clearFilters();
              }}
              className="text-xs font-bold text-[#FF385C] hover:underline flex items-center gap-1 ml-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset all
            </button>
          </div>
        )}

        {/* Results summary bar */}
        <div className="pt-4 pb-2 flex items-center justify-between text-xs text-gray-500 font-semibold border-b border-gray-100">
          <span>
            {totalListings} {totalListings === 1 ? "stay" : "stays"} available{" "}
            {filters.category && filters.category !== "All"
              ? `in ${filters.category}`
              : "worldwide"}
            {filters.guests ? ` · fitting ${filters.guests}+ guests` : ""}
          </span>
        </div>

        {/* Listings or Map View */}
        {showMap ? (
          <div className="py-6">
            <MapView listings={listings} height="75vh" zoom={3} />
          </div>
        ) : listings.length === 0 && !loading ? (
          /* Empty Search Results State */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#FF385C] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No stays found</h3>
            <p className="text-sm text-gray-500 mb-6">
              We couldn&apos;t find any properties matching your current search criteria. Try changing your destination, reducing the guest count, or clearing filters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openSearchModal("where")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
              >
                Change search
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  clearFilters();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-800 text-xs font-bold hover:border-black transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <ListingGrid
              listings={listings}
              loading={loading}
              onReset={() => {
                setPage(1);
                clearFilters();
              }}
            />

            {/* Infinite Scroll Target */}
            {!loading && page < totalPages && (
              <div ref={observerTarget} className="h-10 w-full mt-8" />
            )}
            
            {/* Loading State for Infinite Scroll */}
            {loading && page > 1 && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]"></div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating View Toggle Button (Map / List) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-xs font-bold text-white shadow-xl hover:scale-105 hover:bg-black transition cursor-pointer"
        >
          {showMap ? (
            <>
              <List className="h-4 w-4" />
              <span>Show list</span>
            </>
          ) : (
            <>
              <Map className="h-4 w-4" />
              <span>Show map</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}