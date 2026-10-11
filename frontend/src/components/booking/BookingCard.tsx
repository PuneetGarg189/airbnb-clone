"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Users, Star, AlertTriangle } from "lucide-react";
import { Booking } from "@/types";
import { formatPrice } from "@/lib/utils";
import { nightsBetween, prettyDate, todayISO } from "@/lib/dates";
import AddReviewModal from "@/components/reviews/AddReviewModal";

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: number) => void;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const nights = nightsBetween(booking.start_date, booking.end_date);
  const isCancelled = booking.status?.toLowerCase() === "cancelled";
  const isPast = booking.end_date <= todayISO();

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition">
        {/* Thumbnail */}
        <div className="sm:w-56 aspect-4/3 sm:aspect-square overflow-hidden rounded-2xl bg-gray-100 shrink-0 relative">
          {booking.listing?.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={booking.listing.cover_image} alt={booking.listing.title} className="h-full w-full object-cover" />
          )}
          <div className="absolute top-2 left-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  {booking.listing?.property_type}
                </p>
                <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                  {booking.listing?.title}
                </h3>
                <p className="text-xs text-gray-500">{booking.listing?.location}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-gray-900">
                  {formatPrice(booking.total_price)}
                </p>
                <p className="text-[11px] text-gray-500">{nights} {nights === 1 ? "night" : "nights"} total</p>
              </div>
            </div>

            {/* Dates & Guests */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-700">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar className="h-4 w-4 text-[#FF385C]" />
                <span className="font-semibold">
                  {prettyDate(booking.start_date)} → {prettyDate(booking.end_date)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-semibold">
                  {booking.guests_count} guest{booking.guests_count > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            {(
              booking.listing_id) && (
              <Link
                href={`/rooms/${booking.listing_id}`}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-800 hover:border-black transition"
              >
                View Listing
              </Link>
            )}

            {!isCancelled && isPast && (
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-pink-50 px-4 py-2 text-xs font-bold text-[#FF385C] hover:bg-pink-100 transition cursor-pointer"
              >
                <Star className="h-3.5 w-3.5 fill-[#FF385C]" />
                Leave Review
              </button>
            )}
            {!isCancelled && !isPast && (
              <button
                type="button"
                onClick={() => setIsConfirmCancelOpen(true)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer ml-auto"
              >
                Cancel Trip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              <h4 className="text-base font-bold text-gray-900">Cancel reservation?</h4>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to cancel your stay at {booking.listing?.title}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsConfirmCancelOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                Keep booking
              </button>
              <button
                onClick={() => {
                  onCancel(booking.id);
                  setIsConfirmCancelOpen(false);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <AddReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        listingId={booking.listing_id}
      />
    </>
  );
}
