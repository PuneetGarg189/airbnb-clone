"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ListingForm from "@/components/host/ListingForm";

export default function CreateListingPage() {
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
          <h1 className="text-3xl font-black text-gray-900">Airbnb your home</h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish a new stay with photos, pricing, amenities, and guest capacity
          </p>
        </div>

        <ListingForm />
      </div>
    </div>
  );
}
