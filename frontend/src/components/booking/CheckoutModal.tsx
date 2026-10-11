"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShieldCheck, Star } from "lucide-react";
import toast from "react-hot-toast";
import type { ListingDetail } from "@/types";
import { formatPrice } from "@/lib/utils";
import { nightsBetween, prettyDate } from "@/lib/dates";
import { createBooking } from "@/lib/api";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingDetail;
  startDate: string;
  endDate: string;
  guestsCount: number;
  /** called after the server answered, so the page can refresh booked dates */
  onSuccess?: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  listing,
  startDate,
  endDate,
  guestsCount,
  onSuccess,
}: CheckoutModalProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const nights = nightsBetween(startDate, endDate);
  const accommodationTotal = nights * Number(listing.price_per_night);
  const grandTotal = accommodationTotal + Number(listing.cleaning_fee) + Number(listing.service_fee);
  const cover = listing.images.find((i) => i.is_cover)?.url ?? listing.images[0]?.url;

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError("");
    try {
      // Only the facts go to the server. The price is computed there.
      await createBooking({
        listing_id: listing.id,
        start_date: startDate,
        end_date: endDate,
        guests_count: guestsCount,
      });
      toast.success("Reservation confirmed! Have an incredible stay.", { duration: 5000 });
      onClose();
      onSuccess?.();
      router.push("/trips");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete the reservation.");
      onSuccess?.(); // somebody may have just taken those dates: refresh the calendar
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirm reservation"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <button onClick={onClose} aria-label="Close" className="cursor-pointer rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-base font-bold text-gray-900">Confirm your reservation</h2>
          <div className="w-9" />
        </div>

        <div className="space-y-6 divide-y divide-gray-100 overflow-y-auto p-6">
          <div className="flex items-center gap-4 pb-2">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={listing.title} className="h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-gray-200" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase text-gray-500">{listing.property_type}</p>
              <h3 className="truncate text-sm font-bold text-gray-900">{listing.title}</h3>
              <p className="text-xs text-gray-500">{listing.location}</p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-900">
                <Star className="h-3.5 w-3.5 fill-black text-black" />
                <span>{Number(listing.rating).toFixed(2)}</span>
                <span className="text-gray-400">({listing.reviews_count} reviews)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <h4 className="text-base font-bold text-gray-900">Your trip</h4>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">Dates</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {prettyDate(startDate)} – {prettyDate(endDate)} ({nights} {nights === 1 ? "night" : "nights"})
              </p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">Guests</p>
              <p className="mt-0.5 text-xs text-gray-500">{guestsCount} guest{guestsCount > 1 ? "s" : ""}</p>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <h4 className="text-base font-bold text-gray-900">Price details</h4>
            <div className="flex justify-between text-sm text-gray-700">
              <span>{formatPrice(listing.price_per_night)} × {nights} {nights === 1 ? "night" : "nights"}</span>
              <span>{formatPrice(accommodationTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Cleaning fee</span>
              <span>{formatPrice(listing.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Service fee</span>
              <span>{formatPrice(listing.service_fee)}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-extrabold text-gray-900">
              <span>Total (USD)</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-6 text-xs text-gray-500">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <ShieldCheck className="h-4 w-4 text-[#FF385C]" />
              <span>Demo checkout: no payment is taken</span>
            </div>
            <p>You can cancel any upcoming reservation from the Trips page.</p>
          </div>
        </div>

        {error && (
          <p role="alert" className="border-t border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
          <div>
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-black text-gray-900">{formatPrice(grandTotal)}</div>
          </div>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
          >
            {isProcessing ? "Reserving…" : "Confirm reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}
