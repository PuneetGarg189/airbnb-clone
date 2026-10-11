"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ListingGrid from "@/components/listings/ListingGrid";
import { fetchListings } from "@/lib/api";
import { ListingCard, SearchFilterState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { X, Search, RotateCcw } from "lucide-react";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { filters, updateFilter, clearFilters, openSearchModal } = useSearch();

  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const limit = 14;
  const observerTarget = useRef<HTMLDivElement>(null);

  // The page number belongs to one set of filters (and one user, because the
  // hearts are per user). A new key means "start again from page 1".
  const queryKey = `${user?.id ?? "anon"}|${JSON.stringify(filters)}`;
  const [pageState, setPageState] = useState({ key: queryKey, n: 1 });
  const page = pageState.key === queryKey ? pageState.n : 1;
  const setPage = useCallback((n: number | ((p: number) => number)) => {
    setPageState((prev) => {
      const current = prev.key === queryKey ? prev.n : 1;
      return { key: queryKey, n: typeof n === "function" ? n(current) : n };
    });
  }, [queryKey]);

  const loadListings = useCallback(
    async (currentFilters: SearchFilterState, pageNum: number) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchListings(currentFilters, pageNum, limit);
        setListings((prev) => {
          if (pageNum === 1) return res.listings;
          const existingIds = new Set(prev.map((l) => l.id));
          return [...prev, ...res.listings.filter((l) => !existingIds.has(l.id))];
        });
        setTotalPages(res.total_pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load stays.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadListings(filters, page);
  }, [filters, page, authLoading, loadListings, user?.id]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !error && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => observer.disconnect();
  }, [loading, error, page, totalPages, setPage]);

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
      {/* Main Content Area */}
      <div className="mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-10">
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

        {/* Listings or Map View */}
        {error && listings.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto" role="alert">
            <h3 className="text-xl font-bold text-gray-900 mb-2">We couldn&apos;t load stays</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => loadListings(filters, 1)}
              className="px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
            >
              Try again
            </button>
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
            
            {error && listings.length > 0 && (
              <div className="py-6 text-center text-sm text-gray-600" role="alert">
                {error}{" "}
                <button onClick={() => loadListings(filters, page)} className="font-bold underline cursor-pointer">
                  Retry
                </button>
              </div>
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

    </div>
  );
}