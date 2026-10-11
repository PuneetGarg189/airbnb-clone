"use client";

import React, { useState } from "react";
import { Star, Minus, Plus } from "lucide-react";
import { ListingDetail, BookedDateRange } from "@/types";
import { formatPrice } from "@/lib/utils";
import { nightsBetween, prettyDate } from "@/lib/dates";
import DateRangePicker from "@/components/ui/DateRangePicker";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isLoggedIn, user } = useAuth();

  const maxCapacity = listing.max_guests;
  const isOwnListing = user?.id === listing.host_id;

  const nights = nightsBetween(startDate, endDate);
  const accommodationTotal = nights * Number(listing.price_per_night);
  const grandTotal = accommodationTotal + Number(listing.cleaning_fee) + Number(listing.service_fee);
  const hasDates = nights > 0;

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
            <span>{Number(listing.rating).toFixed(2)}</span>
            <span className="text-gray-400 font-normal">·</span>
            <span className="text-gray-500 font-normal underline">
              {listing.reviews_count} reviews
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="rounded-2xl border border-gray-300 bg-white">
          <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
            <div className="p-2.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-800">Check-in</span>
              <span className="text-xs font-semibold text-gray-900">{startDate ? prettyDate(startDate) : "Add date"}</span>
            </div>
            <div className="p-2.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-800">Checkout</span>
              <span className="text-xs font-semibold text-gray-900">{endDate ? prettyDate(endDate) : "Add date"}</span>
            </div>
          </div>
          <div className="p-3">
            <DateRangePicker
              months={1}
              start={startDate}
              end={endDate}
              blocked={bookedDates}
              onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="mt-2 text-xs font-bold underline cursor-pointer"
              >
                Clear dates
              </button>
            )}
          </div>

          {/* Guests */}
          <div className="flex items-center justify-between border-t border-gray-200 p-3">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-800">Guests</span>
              <span className="text-xs font-semibold text-gray-900">
                {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                <span className="ml-1 font-normal text-gray-400">(max {maxCapacity})</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Fewer guests"
                disabled={guestsCount <= 1}
                onClick={() => setGuestsCount((g) => g - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:border-black disabled:cursor-not-allowed disabled:opacity-25"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-gray-900">{guestsCount}</span>
              <button
                type="button"
                aria-label="More guests"
                disabled={guestsCount >= maxCapacity}
                onClick={() => setGuestsCount((g) => g + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:border-black disabled:cursor-not-allowed disabled:opacity-25"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reserve Button */}
        <button
          type="button"
          disabled={!hasDates || isOwnListing}
          onClick={() => (isLoggedIn ? setIsCheckoutOpen(true) : setIsLoginOpen(true))}
          className="w-full rounded-2xl bg-gradient-to-r from-[#FF385C] via-[#E00B41] to-[#D70466] py-3.5 text-center text-sm font-bold text-white shadow-md hover:brightness-105 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {isOwnListing ? "This is your listing" : hasDates ? "Reserve" : "Select your dates"}
        </button>

        <p className="text-center text-xs text-gray-500">You won&apos;t be charged yet</p>

        {/* Price Breakdown */}
        {hasDates && (
          <div className="space-y-3 pt-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="underline">
                {formatPrice(listing.price_per_night)} × {nights} {nights === 1 ? "night" : "nights"}
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