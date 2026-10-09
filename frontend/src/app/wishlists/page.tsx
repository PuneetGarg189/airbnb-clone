"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { fetchWishlists } from "@/lib/api";
import { ListingCard } from "@/types";
import { useAuth } from "@/context/AuthContext";
import ListingGrid from "@/components/listings/ListingGrid";

export default function WishlistsPage() {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlists = async () => {
      setLoading(true);
      try {
        const data = await fetchWishlists(user.id);
        setWishlists(data);
      } catch {
        setWishlists([]);
      } finally {
        setLoading(false);
      }
    };
    loadWishlists();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b pb-6">
          <h1 className="text-3xl font-black text-gray-900">Wishlists</h1>
          <p className="text-sm text-gray-500 mt-1">
            Properties you&apos;ve saved for future stays
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-10 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : wishlists.length === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-2xl mb-4">
              <Heart className="h-8 w-8 fill-[#FF385C] text-[#FF385C]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              As you search, tap the heart icon on any listing to save your favorite stays here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-xl border border-black bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
            >
              Start exploring
            </Link>
          </div>
        ) : (
          <ListingGrid listings={wishlists} />
        )}
      </div>
    </div>
  );
}
