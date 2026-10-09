"use client";

import React, { useState } from "react";
import { Star, ChevronDown, ChevronUp, AlertCircle, Minus, Plus } from "lucide-react";
import { ListingDetail, BookedDateRange } from "@/types";
import { formatPrice, calculateNights } from "@/lib/utils";
import CheckoutModal from "@/components/booking/CheckoutModal";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/context/AuthContext";

interface ReservationWidgetProps {
  listing: ListingDetail;
  bookedDates: BookedDateRange[];
  onBookingSuccess?: () => void;
}

export default function ReservationWidget({
  listing,
  bookedDates,
  onBookingSuccess,
}: ReservationWidgetProps) {
  // Default dates: tomorrow to +3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split("T")[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultEnd = threeDaysLater.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  const maxCapacity = listing.max_guests || 10;
  const guestsCount = Math.min(maxCapacity, Math.max(1, adults + childrenCount));

  const nights = calculateNights(startDate, endDate);
  const pNight = Number(listing.price_per_night) || 0;
  const cFee = Number(listing.cleaning_fee) || 0;
  const sFee = Number(listing.service_fee) || 0;
  const accommodationTotal = nights * pNight;
  const grandTotal = accommodationTotal + cFee + sFee;

  // Check if dates conflict with any booked date range
  const isConflict = bookedDates.some((b) => {
    return startDate < b.end_date && endDate > b.start_date;
  });

  const isInvalidRange = !startDate || !endDate || startDate >= endDate;

  const handleIncrementAdults = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (adults + childrenCount < maxCapacity) {
      setAdults((prev) => prev + 1);
    }
  };

  const handleDecrementAdults = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (adults > 1) {
      setAdults((prev) => prev - 1);
    }
  };

  const handleIncrementChildren = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (adults + childrenCount < maxCapacity) {
      setChildrenCount((prev) => prev + 1);
    }
  };

  const handleDecrementChildren = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (childrenCount > 0) {
      setChildrenCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleSetPreset = (total: number) => {
    const target = Math.min(maxCapacity, Math.max(1, total));
    setAdults(target);
    setChildrenCount(0);
  };

  return (
    <>
      <div className="sticky top-28 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl space-y-5">
        {/* Top Price & Rating */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">
              {formatPrice(listing.price_per_night)}
            </span>
            <span className="text-sm font-normal text-gray-500 ml-1">night</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
            <Star className="h-3.5 w-3.5 fill-black text-black" />
            <span>{listing.rating.toFixed(2)}</span>
            <span className="text-gray-400 font-normal">·</span>
            <span className="text-gray-500 font-normal underline">
              {listing.reviews_count} reviews
            </span>
          </div>
        </div>

        {/* Date & Guest Input Box */}
        <div className="rounded-2xl border border-gray-300 divide-y divide-gray-200 bg-white">
          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 divide-x divide-gray-200 rounded-t-2xl">
            <div className="p-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition rounded-tl-2xl">
              <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-wider">
                CHECK-IN
              </label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-semibold outline-hidden bg-transparent text-gray-900 mt-0.5 cursor-pointer"
              />
            </div>
            <div className="p-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition rounded-tr-2xl">
              <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-wider">
                CHECKOUT
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-semibold outline-hidden bg-transparent text-gray-900 mt-0.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Guests Section with Direct Stepper Buttons */}
          <div className="rounded-b-2xl">
            <div
              onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
              className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer rounded-b-2xl"
            >
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-wider">
                  GUESTS
                </span>
                <span className="text-xs font-semibold text-gray-900">
                  {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                  <span className="text-gray-400 font-normal ml-1">
                    (max {maxCapacity})
                  </span>
                </span>
              </div>

              {/* Quick Stepper directly in the card */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  disabled={guestsCount <= 1}
                  onClick={handleDecrementAdults}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-700 disabled:opacity-20 hover:border-black transition cursor-pointer disabled:cursor-not-allowed bg-white"
                  title="Decrease guests"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <span className="text-xs font-bold w-5 text-center text-gray-900">
                  {guestsCount}
                </span>

                <button
                  type="button"
                  disabled={guestsCount >= maxCapacity}
                  onClick={handleIncrementAdults}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-700 disabled:opacity-20 hover:border-black transition cursor-pointer disabled:cursor-not-allowed bg-white"
                  title="Increase guests"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                  className="p-1 text-gray-500 hover:text-black transition ml-1"
                >
                  {isGuestDropdownOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expandable Guest Options Drawer */}
            {isGuestDropdownOpen && (
              <div className="border-t border-gray-200 bg-gray-50/70 p-4 space-y-4 rounded-b-2xl animate-in fade-in duration-150">
                {/* Adults Stepper */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Adults</p>
                    <p className="text-[11px] text-gray-500">Age 13+</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={handleDecrementAdults}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-25 hover:border-black transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{adults}</span>
                    <button
                      type="button"
                      disabled={adults + childrenCount >= maxCapacity}
                      onClick={handleIncrementAdults}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-25 hover:border-black transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children Stepper */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Children</p>
                    <p className="text-[11px] text-gray-500">Ages 2–12</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={childrenCount <= 0}
                      onClick={handleDecrementChildren}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-25 hover:border-black transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{childrenCount}</span>
                    <button
                      type="button"
                      disabled={adults + childrenCount >= maxCapacity}
                      onClick={handleIncrementChildren}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 disabled:opacity-25 hover:border-black transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Quick Presets
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 4, maxCapacity].filter((v, i, a) => a.indexOf(v) === i && v <= maxCapacity).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSetPreset(num)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          guestsCount === num
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-black"
                        }`}
                      >
                        {num === 1 ? "1 Guest" : num === maxCapacity ? `Max (${num})` : `${num} Guests`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-500">
                    Max capacity: {maxCapacity} guests
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsGuestDropdownOpen(false)}
                    className="font-bold text-black underline hover:text-[#FF385C] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Alert Notice */}
        {isConflict && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              These dates overlap with an existing reservation on this property. Please select different dates.
            </span>
          </div>
        )}

        {/* Reserve Button */}
        <button
          type="button"
          disabled={isConflict || isInvalidRange || nights <= 0}
          onClick={() => isLoggedIn ? setIsCheckoutOpen(true) : setIsLoginOpen(true)}
          className="w-full rounded-2xl bg-gradient-to-r from-[#FF385C] via-[#E00B41] to-[#D70466] py-3.5 text-center text-sm font-bold text-white shadow-md hover:brightness-105 transition disabled:opacity-40 cursor-pointer"
        >
          {isConflict
            ? "Dates unavailable"
            : isInvalidRange
            ? "Select valid dates"
            : `Reserve (${guestsCount} ${guestsCount === 1 ? "guest" : "guests"})`}
        </button>

        <p className="text-center text-xs text-gray-500">You won&apos;t be charged yet</p>

        {/* Price Breakdown */}
        {nights > 0 && !isInvalidRange && (
          <div className="space-y-3 pt-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="underline">
                {formatPrice(listing.price_per_night)} × {nights} nights
              </span>
              <span>{formatPrice(accommodationTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Cleaning fee</span>
              <span>{formatPrice(listing.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Airbnb service fee</span>
              <span>{formatPrice(listing.service_fee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-gray-900 text-base">
              <span>Total before taxes</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        listing={listing}
        startDate={startDate}
        endDate={endDate}
        guestsCount={guestsCount}
        onSuccess={onBookingSuccess}
      />
    </>
  );
}