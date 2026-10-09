"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Minus, Plus, Calendar, MapPin, Users, Sparkles } from "lucide-react";
import { useSearch } from "@/context/SearchContext";

export default function SearchModal() {
  const {
    filters,
    updateFilter,
    clearFilters,
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchModalTab,
  } = useSearch();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);

  // Sync state whenever modal opens or filters change
  useEffect(() => {
    if (isSearchModalOpen) {
      setDestination(filters.search || filters.city || "");
      setStartDate(filters.start_date || "");
      setEndDate(filters.end_date || "");
      const g = filters.guests || 1;
      setAdults(Math.max(1, g));
      setChildrenCount(0);
      setInfants(0);
    }
  }, [isSearchModalOpen, filters]);

  if (!isSearchModalOpen) return null;

  const totalGuests = adults + childrenCount;

  const handleApply = () => {
    updateFilter({
      search: destination.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      guests: totalGuests > 0 ? totalGuests : undefined,
    });
    setIsSearchModalOpen(false);
  };

  const handleClear = () => {
    setDestination("");
    setStartDate("");
    setEndDate("");
    setAdults(1);
    setChildrenCount(0);
    setInfants(0);
    clearFilters();
    setIsSearchModalOpen(false);
  };

  const setGuestPreset = (num: number) => {
    setAdults(num);
    setChildrenCount(0);
  };

  const popularDestinations = [
    { name: "Italy", label: "Lake Como & Amalfi Coast" },
    { name: "Switzerland", label: "Alps & Zermatt" },
    { name: "Greece", label: "Santorini & Oia" },
    { name: "Bali", label: "Ubud & Tropical Villas" },
    { name: "California", label: "Big Sur & Joshua Tree" },
    { name: "France", label: "Paris & Provence" },
    { name: "Japan", label: "Kyoto & Zen Gardens" },
    { name: "Aspen", label: "Colorado Ski Lodges" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-16 sm:pt-24 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Find your next stay</h2>
            <p className="text-xs text-gray-500 mt-0.5">Filter by destination, dates, and number of guests</p>
          </div>
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="rounded-full p-2.5 hover:bg-gray-100 transition text-gray-500 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Sections */}
        <div className="mt-6 space-y-6">
          {/* 1. Destination / Where */}
          <div className="rounded-2xl border border-gray-200 p-4 hover:border-gray-900 focus-within:border-gray-900 transition bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <MapPin className="w-4 h-4 text-[#FF385C]" />
                Where
              </div>
              {destination && (
                <button
                  type="button"
                  onClick={() => setDestination("")}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Search destinations (e.g. Italy, Bali, Paris, Aspen)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-2 w-full text-base font-semibold outline-hidden placeholder:text-gray-400 text-gray-900"
              autoFocus={searchModalTab === "where"}
            />
          </div>

          {/* Quick Destination Suggestions */}
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular destinations
            </div>
            <div className="flex flex-wrap gap-2">
              {popularDestinations.map((dest) => {
                const isSelected = destination.toLowerCase() === dest.name.toLowerCase();
                return (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => setDestination(dest.name)}
                    className={`text-xs px-3.5 py-2 rounded-full border transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-bold">{dest.name}</span>
                    <span className={`text-[11px] ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                      · {dest.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Dates / When */}
          <div className="rounded-2xl border border-gray-200 p-4 hover:border-gray-900 focus-within:border-gray-900 transition bg-white shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              <Calendar className="w-4 h-4 text-[#FF385C]" />
              Dates
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-xl p-2.5">
                <label className="block text-gray-500 text-[10px] font-bold uppercase">CHECK-IN</label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm font-semibold outline-hidden text-gray-900 mt-1 cursor-pointer"
                />
              </div>
              <div className="border border-gray-200 rounded-xl p-2.5">
                <label className="block text-gray-500 text-[10px] font-bold uppercase">CHECK-OUT</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm font-semibold outline-hidden text-gray-900 mt-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3. Guests / Who */}
          <div className="rounded-2xl border border-gray-200 p-5 bg-white shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <Users className="w-4 h-4 text-[#FF385C]" />
                Who&apos;s coming?
              </div>
              <span className="text-xs font-bold bg-pink-50 text-[#FF385C] px-3 py-1 rounded-full border border-pink-100">
                {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                {infants > 0 ? `, ${infants} infant${infants > 1 ? "s" : ""}` : ""}
              </span>
            </div>

            {/* Quick Guest Count Presets */}
            <div className="py-3 border-b border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Quick Presets
              </span>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 4, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuestPreset(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      totalGuests === num && childrenCount === 0
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {num === 1 ? "1 Guest" : `${num}+ Guests`}
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Guest Counters */}
            <div className="divide-y divide-gray-100 pt-2">
              {/* Adults */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-bold text-gray-900">Adults</div>
                  <div className="text-xs text-gray-500">Age 13 or above</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1 && childrenCount === 0}
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 disabled:opacity-20 hover:border-black transition cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Decrease adults"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center text-gray-900">{adults}</span>
                  <button
                    type="button"
                    disabled={adults >= 16}
                    onClick={() => setAdults((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:border-black transition cursor-pointer"
                    aria-label="Increase adults"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-bold text-gray-900">Children</div>
                  <div className="text-xs text-gray-500">Ages 2–12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={childrenCount <= 0}
                    onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 disabled:opacity-20 hover:border-black transition cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Decrease children"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center text-gray-900">{childrenCount}</span>
                  <button
                    type="button"
                    disabled={childrenCount >= 10}
                    onClick={() => setChildrenCount((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:border-black transition cursor-pointer"
                    aria-label="Increase children"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <div className="text-sm font-bold text-gray-900">Infants</div>
                  <div className="text-xs text-gray-500">Under 2</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={infants <= 0}
                    onClick={() => setInfants((prev) => Math.max(0, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 disabled:opacity-20 hover:border-black transition cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Decrease infants"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center text-gray-900">{infants}</span>
                  <button
                    type="button"
                    disabled={infants >= 5}
                    onClick={() => setInfants((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:border-black transition cursor-pointer"
                    aria-label="Increase infants"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-bold underline text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105 transition cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[3]" />
            Search ({totalGuests} {totalGuests === 1 ? "guest" : "guests"})
          </button>
        </div>
      </div>
    </div>
  );
}