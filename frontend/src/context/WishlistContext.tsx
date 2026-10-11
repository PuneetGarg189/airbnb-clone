"use client";

import React, { createContext, useCallback, useContext, useState, useEffect } from "react";
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

  const userId = user?.id;

  const refreshWishlist = useCallback(async () => {
    if (!userId) {
      setWishlistIds([]);
      return;
    }
    try {
      const items = await fetchWishlists();
      setWishlistIds(items.map((i) => i.id));
    } catch {
      setWishlistIds([]);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = (id: number) => wishlistIds.includes(id);

  const toggle = async (listingId: number) => {
    if (!user) {
      toast("Log in to save places to your wishlist");
      return;
    }
    // Optimistic update
    const already = wishlistIds.includes(listingId);
    setWishlistIds((prev) =>
      already ? prev.filter((id) => id !== listingId) : [...prev, listingId]
    );

    try {
      const res = await toggleWishlist(listingId);
      if (res.is_wishlisted) {
        toast.success("Saved to Wishlist", { icon: "❤️" });
      } else {
        toast("Removed from Wishlist", { icon: "❤️" });
      }
    } catch (err) {
      // Revert on error
      setWishlistIds((prev) =>
        already ? [...prev, listingId] : prev.filter((id) => id !== listingId)
      );
      toast.error(err instanceof Error ? err.message : "Failed to update wishlist");
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
