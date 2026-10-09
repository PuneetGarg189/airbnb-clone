"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toggleWishlist, fetchWishlists } from "@/lib/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface WishlistContextType {
  wishlistIds: number[];
  isWishlisted: (id: number) => boolean;
  toggle: (listingId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  isWishlisted: () => false,
  toggle: async () => {},
  refreshWishlist: async () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const refreshWishlist = async () => {
    try {
      const items = await fetchWishlists(user.id);
      setWishlistIds(items.map((i) => i.id));
    } catch {
      // Ignore initial failure if server is still starting
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user.id]);

  const isWishlisted = (id: number) => wishlistIds.includes(id);

  const toggle = async (listingId: number) => {
    // Optimistic update
    const already = wishlistIds.includes(listingId);
    setWishlistIds((prev) =>
      already ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );

    try {
      const res = await toggleWishlist(listingId, user.id);
      if (res.is_wishlisted) {
        toast.success("Saved to Wishlist", { icon: "??" });
      } else {
        toast("Removed from Wishlist", { icon: "??" });
      }
    } catch (err: any) {
      // Revert on error
      setWishlistIds((prev) =>
        already ? [...prev, listingId] : prev.filter((id) => id !== listingId)
      );
      toast.error(err.message || "Failed to update wishlist");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isWishlisted,
        toggle,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
