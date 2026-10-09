"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Heart, Star, ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { deleteListing } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ListingCard as ListingCardType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface ListingCardProps {
  listing: ListingCardType;
  onDelete?: (id: number) => void;
}

export default function ListingCard({ listing, onDelete }: ListingCardProps) {
  const { isWishlisted, toggle } = useWishlist();
  const { user, isHost, isLoggedIn } = useAuth();
  const router = useRouter();

  const isOwner = isLoggedIn && isHost && user?.id === listing.host?.id;
  const wishlisted = isWishlisted(listing.id);

  // Build photo array
  const photos: string[] = [
    ...(listing.cover_image ? [listing.cover_image] : []),
    ...(listing.images || []).filter((img) => img !== listing.cover_image),
  ].filter(Boolean).slice(0, 5);

  if (photos.length === 0) {
    photos.push('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800');
  }

  const [photoIndex, setPhotoIndex] = useState(0);
  const [heartAnimating, setHeartAnimating] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const prevPhoto = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);


  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/host/edit/${listing.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this listing?")) {
      // Instantly hide the card
      setIsDeleted(true);
      try {
        await deleteListing(listing.id);
        toast.success("Listing removed successfully");
        if (onDelete) onDelete(listing.id);
      } catch (err) {
        toast.error("Failed to remove listing");
        setIsDeleted(false); // restore if it failed
      }
    }
  };

  // Don't render if deleted
  if (isDeleted) return null;


  const nextPhoto = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimating(true);
    toggle(listing.id);
    setTimeout(() => setHeartAnimating(false), 300);
  };

  return (
    <Link href={`/rooms/${listing.id}`} className="group block">
      {/* Photo area */}
      <div
        className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200"
        onMouseEnter={() => setShowArrows(true)}
        onMouseLeave={() => setShowArrows(false)}
      >
        <img
          src={photos[photoIndex]}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Guest Favourite badge */}
        {listing.is_guest_favourite && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-gray-900 shadow-sm">
              Guest favourite
            </span>
          </div>
        )}

        
        {isOwner ? (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button
              onClick={handleEdit}
              className="p-2 rounded-full bg-white/90 shadow-md hover:scale-110 hover:bg-blue-50 hover:text-blue-600 transition"
              title="Edit listing"
            >
              <Edit2 className="w-4 h-4 text-gray-700 hover:text-blue-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-white/90 shadow-md hover:scale-110 hover:bg-red-50 hover:text-red-600 transition"
              title="Remove listing"
            >
              <Trash2 className="w-4 h-4 text-gray-700 hover:text-red-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:scale-110 transition-transform"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save'}
          >
            <Heart
              className={`w-5 h-5 drop-shadow transition-all duration-200 ${
                heartAnimating ? 'scale-125' : 'scale-100'
              } ${
                wishlisted
                  ? 'fill-[#FF385C] text-[#FF385C]'
                  : 'fill-black/30 text-white'
              }`}
            />
          </button>
        )}


        {/* Nav arrows */}
        {photos.length > 1 && showArrows && (
          <>
            <button
              onClick={prevPhoto}
              disabled={photoIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-1.5 shadow-md hover:scale-110 transition disabled:opacity-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextPhoto}
              disabled={photoIndex === photos.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 rounded-full p-1.5 shadow-md hover:scale-110 transition disabled:opacity-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPhotoIndex(i); }}
                className={`rounded-full transition-all ${
                  i === photoIndex ? 'bg-white w-2 h-2' : 'bg-white/60 w-1.5 h-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-900 truncate flex-1 pr-2">
            {listing.city}, {listing.country}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
            <span className="text-sm text-gray-900">{listing.rating.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 truncate">{listing.title}</p>
        <p className="text-sm text-gray-500">{listing.reviews_count} reviews</p>
        <p className="text-sm">
          <span className="font-semibold text-gray-900">{formatPrice(listing.price_per_night)}</span>
          <span className="text-gray-500 font-normal"> night</span>
        </p>
      </div>
    </Link>
  );
}
