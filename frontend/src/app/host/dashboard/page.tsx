"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  DollarSign,
  CalendarCheck,
  Star,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { fetchHostDashboard, deleteListing } from "@/lib/api";
import { HostDashboardData } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function HostDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchHostDashboard(user.id);
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user.id]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing? All associated bookings and photos will be removed.")) {
      return;
    }
    // Optimistically remove from UI immediately so the card disappears right away
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        listings: prev.listings.filter((l) => l.id !== id),
        stats: {
          ...prev.stats,
          total_listings: Math.max(0, prev.stats.total_listings - 1),
        },
      };
    });
    try {
      await deleteListing(id);
      toast.success("Listing deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete listing");
      // Re-fetch to restore state if something truly went wrong
      loadDashboard();
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-8 w-1/4 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    total_listings: 0,
    total_bookings: 0,
    total_revenue: 0,
    average_rating: 5.0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Welcome back, {user.name}
              </h1>
              {user.is_superhost && (
                <span className="bg-red-50 text-[#FF385C] border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Superhost
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Host management control center for your properties &amp; guest reservations
            </p>
          </div>

          <Link
            href="/host/create"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-5 py-3 text-xs font-bold text-white shadow-md hover:brightness-105 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create New Listing
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-3xl bg-white p-6 border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-[#FF385C]">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Listings</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.total_listings}</h3>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Reservations</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.total_bookings}</h3>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Earnings</p>
              <h3 className="text-2xl font-black text-gray-900">{formatPrice(stats.total_revenue)}</h3>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-gray-200 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Avg Rating</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.average_rating.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Owned Listings Table */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-black text-gray-900">Your Listings</h3>
            <span className="text-xs font-bold text-gray-500">
              {data?.listings.length || 0} active spaces
            </span>
          </div>

          {data?.listings && data.listings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500 font-bold">
                    <th className="pb-3">Property</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Price / night</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.listings.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={l.cover_image}
                            alt={l.title}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{l.title}</p>
                            <p className="text-xs text-gray-500">{l.property_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-medium text-gray-600">{l.location}</td>
                      <td className="py-4 font-bold text-gray-900">{formatPrice(l.price_per_night)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-xs font-bold">
                          <Star className="h-3 w-3 fill-black text-black" />
                          <span>{l.rating.toFixed(2)}</span>
                          <span className="text-gray-400 font-normal">({l.reviews_count})</span>
                        </div>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <Link
                          href={`/rooms/${l.id}`}
                          className="inline-flex p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          title="View listing"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/host/edit/${l.id}`}
                          className="inline-flex p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit listing"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(l.id)}
                          className="inline-flex p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 text-xs">
              You haven&apos;t created any listings yet.
            </div>
          )}
        </div>

        {/* Recent Reservations Table */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-black text-gray-900">Recent Guest Reservations</h3>
            <span className="text-xs font-bold text-gray-500">
              {data?.recent_bookings.length || 0} bookings
            </span>
          </div>

          {data?.recent_bookings && data.recent_bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-gray-500 font-bold">
                    <th className="pb-3">Stay</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Guests</th>
                    <th className="pb-3">Payout</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {data.recent_bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 font-semibold text-gray-900">
                        {b.listing?.title || `Stay #${b.listing?.id || b.listing_id}`}
                      </td>
                      <td className="py-3 text-gray-600 font-medium">
                        {formatDate(b.start_date)}  {formatDate(b.end_date)}
                      </td>
                      <td className="py-3 text-gray-600">{b.guests_count}</td>
                      <td className="py-3 font-bold text-gray-900">{formatPrice(b.total_price)}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            b.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 text-xs">
              No recent reservations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
