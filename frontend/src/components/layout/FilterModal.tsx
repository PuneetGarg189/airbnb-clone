"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Users, Minus, Plus } from "lucide-react";
import { SearchFilterState } from "@/types";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Partial<SearchFilterState>) => void;
  currentFilters?: SearchFilterState;
}

const AVAILABLE_AMENITIES = [
  "Wifi",
  "Pool",
  "Kitchen",
  "Free parking",
  "Air conditioning",
  "Hot tub",
  "Waterfront",
  "Dedicated workspace",
  "EV charger",
  "Washer",
  "Dryer",
  "Indoor fireplace",
  "Breakfast included",
  "Pet friendly",
  "Ski-in/Ski-out"
];

const PROPERTY_TYPES = ["Any", "Entire villa", "Entire cabin", "Entire home", "Entire penthouse", "Entire overwater bungalow"];

export default function FilterModal({
  isOpen,
  onClose,
  onApply,
  currentFilters = {},
}: FilterModalProps) {
  const [minPrice, setMinPrice] = useState<number | undefined>(currentFilters.min_price);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(currentFilters.max_price);
  const [selectedType, setSelectedType] = useState<string>(currentFilters.property_type || "Any");
  const [guests, setGuests] = useState<number>(currentFilters.guests || 1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    currentFilters.amenities || []
  );

  useEffect(() => {
    if (isOpen) {
      setMinPrice(currentFilters.min_price);
      setMaxPrice(currentFilters.max_price);
      setSelectedType(currentFilters.property_type || "Any");
      setGuests(currentFilters.guests || 1);
      setSelectedAmenities(currentFilters.amenities || []);
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleApply = () => {
    onApply({
      min_price: minPrice,
      max_price: maxPrice,
      property_type: selectedType !== "Any" ? selectedType : undefined,
      guests: guests > 1 ? guests : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedType("Any");
    setGuests(1);
    setSelectedAmenities([]);
    onApply({
      min_price: undefined,
      max_price: undefined,
      property_type: undefined,
      guests: undefined,
      amenities: undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
          <div className="w-9" />
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 divide-y divide-gray-100">
          {/* Price Range */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">Price range</h3>
            <p className="text-sm text-gray-500 mb-4">Nightly prices before taxes and fees</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-300 rounded-2xl p-3 focus-within:border-black transition">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Minimum</label>
                <div className="flex items-center gap-1 mt-1 font-semibold text-gray-900">
                  <span>$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice ?? ""}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full outline-hidden"
                  />
                </div>
              </div>
              <div className="border border-gray-300 rounded-2xl p-3 focus-within:border-black transition">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Maximum</label>
                <div className="flex items-center gap-1 mt-1 font-semibold text-gray-900">
                  <span>$</span>
                  <input
                    type="number"
                    placeholder="1500"
                    value={maxPrice ?? ""}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Number of Guests */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Guests</h3>
            <p className="text-sm text-gray-500 mb-4">Minimum accommodation capacity</p>
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#FF385C]" />
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {guests} {guests === 1 ? "guest" : "guests or more"}
                  </div>
                  <div className="text-xs text-gray-500">Show listings fitting at least this group size</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={guests <= 1}
                  onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 disabled:opacity-25 hover:border-black transition cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold w-6 text-center text-gray-900">{guests}</span>
                <button
                  type="button"
                  disabled={guests >= 16}
                  onClick={() => setGuests((prev) => prev + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:border-black transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Property type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition cursor-pointer ${
                    selectedType === type
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-800 border-gray-300 hover:border-black"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                      checked
                        ? "border-[#FF385C] bg-pink-50 text-[#FF385C]"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        checked ? "bg-[#FF385C] border-[#FF385C] text-white" : "border-gray-300"
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
          <button
            onClick={handleClear}
            className="text-sm font-bold underline text-gray-800 hover:text-black cursor-pointer"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition cursor-pointer"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}