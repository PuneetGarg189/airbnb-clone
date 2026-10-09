"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ListingForm from "@/components/host/ListingForm";
import { fetchListing } from "@/lib/api";
import { ListingDetail } from "@/types";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchListing(listingId);
        setListing(data);
      } catch {
        toast.error("Failed to load listing details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
          <div className="h-8 w-1/3 bg-gray-200 rounded-lg" />
          <div className="h-96 bg-white rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Listing not found</h2>
        <Link
          href="/host/dashboard"
          className="mt-4 inline-block text-sm font-bold text-[#FF385C] underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/host/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black mb-6 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Edit Listing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update pricing, photos, amenities, or descriptions for {listing.title}
          </p>
        </div>

        <ListingForm initialData={listing} isEdit={true} />
      </div>
    </div>
  );
}
