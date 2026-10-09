"use client";

import React from "react";
import ListingCard from "./ListingCard";
import { ListingCard as ListingCardType } from "@/types";

interface ListingGridProps {
  listings: ListingCardType[];
  loading?: boolean;
  onReset?: () => void;
}

export default function ListingGrid({ listings, loading, onReset }: ListingGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 py-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-square w-full rounded-2xl bg-gray-200" />
            <div className="h-4 bg-gray-200 rounded-sm w-3/4" />
            <div className="h-3 bg-gray-200 rounded-sm w-1/2" />
            <div className="h-4 bg-gray-200 rounded-sm w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl mb-4">
          ???
        </div>
        <h3 className="text-xl font-bold text-gray-900">No exact matches found</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Try changing or clearing some of your filters, searching for a different destination, or adjusting your travel dates.
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="mt-6 rounded-xl border border-black bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 py-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
