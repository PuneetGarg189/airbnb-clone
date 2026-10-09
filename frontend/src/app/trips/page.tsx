"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Luggage, Sparkles } from "lucide-react";
import { fetchMyTrips, cancelBooking } from "@/lib/api";
import { Booking } from "@/types";
import { useAuth } from "@/context/AuthContext";
import BookingCard from "@/components/booking/BookingCard";
import toast from "react-hot-toast";

type Tab = "upcoming" | "past" | "cancelled";

export default function TripsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const loadTrips = async () => {
    setLoading(true);
    try {
      const data = await fetchMyTrips(user.id);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user.id]);

  const handleCancel = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId);
      toast.success("Reservation cancelled successfully");
      loadTrips();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel reservation");
    }
  };

  const now = new Date().toISOString().split("T")[0];
  
  const upcoming = bookings.filter((b) => b.status?.toLowerCase() !== "cancelled" && b.end_date >= now);
  const past = bookings.filter((b) => b.status?.toLowerCase() !== "cancelled" && b.end_date < now);
  const cancelled = bookings.filter((b) => b.status?.toLowerCase() === "cancelled");

  const getActiveBookings = () => {
    switch (activeTab) {
      case "upcoming": return upcoming;
      case "past": return past;
      case "cancelled": return cancelled;
      default: return [];
    }
  };

  const activeBookings = getActiveBookings();

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Trips</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your upcoming reservations and past stays
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Explore More
          </Link>
        </div>

        <div className="flex gap-4 mt-6 border-b">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "upcoming" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "past" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Past ({past.length})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === "cancelled" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            Cancelled ({cancelled.length})
          </button>
        </div>

        {loading ? (
          <div className="py-12 space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-gray-100 rounded-3xl" />
            ))}
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-2xl mb-4">
              <Luggage className="h-8 w-8 text-[#FF385C]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No {activeTab} trips... yet!</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Time to dust off your bags and start planning your next great adventure.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl border border-black bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
            >
              Start searching
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {activeBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
