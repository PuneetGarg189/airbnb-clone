"use client";

import React, { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Star,
  Share2,
  Heart,
  Award,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import { ApiError, fetchListing, fetchBookedDates, fetchReviews } from "@/lib/api";
import { ListingDetail, BookedDateRange, ReviewsSummary as ReviewsSummaryType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import PhotoGallery from "@/components/listings/PhotoGallery";
import ReservationWidget from "@/components/listings/ReservationWidget";
import AmenitiesList from "@/components/listings/AmenitiesList";
import ReviewsSummary from "@/components/reviews/ReviewsSummary";
import ReviewCard from "@/components/reviews/ReviewCard";
import AddReviewModal from "@/components/reviews/AddReviewModal";
import MapView from "@/components/map/MapView";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const listingId = parseInt(id, 10);

  const { user, loading: authLoading } = useAuth();
  const { isWishlisted, toggle } = useWishlist();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<ReviewsSummaryType | null>(null);
  const [reviewsError, setReviewsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);

  const userId = user?.id;

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      setListing(await fetchListing(listingId));
    } catch (err) {
      setListing(null);
      setLoadError({
        status: err instanceof ApiError ? err.status : 0,
        message: err instanceof Error ? err.message : "Failed to load listing",
      });
      setLoading(false);
      return;
    }
    setLoading(false);

    // Calendar and reviews are secondary: a failure here must not hide the listing.
    const [dates, reviews] = await Promise.allSettled([fetchBookedDates(listingId), fetchReviews(listingId)]);
    setBookedDates(dates.status === "fulfilled" ? dates.value : []);
    setReviewsSummary(reviews.status === "fulfilled" ? reviews.value : null);
    setReviewsError(reviews.status === "rejected");
  }, [listingId]);

  useEffect(() => {
    if (authLoading || Number.isNaN(listingId)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData, authLoading, userId, listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
          <div className="h-4 bg-gray-200 rounded-md w-1/3" />
          <div className="h-96 bg-gray-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    const notFound = Number.isNaN(listingId) || loadError?.status === 404;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center" role="alert">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {notFound ? "Listing not found" : "We couldn't load this stay"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {notFound ? "The stay you are looking for does not exist or has been removed." : loadError?.message}
        </p>
        <div className="flex gap-3">
          {!notFound && (
            <button
              onClick={() => { setLoading(true); loadData(); }}
              className="rounded-full border border-black px-6 py-2.5 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Try again
            </button>
          )}
          <Link href="/" className="rounded-full bg-black text-white px-6 py-2.5 text-xs font-bold hover:bg-gray-800 transition">
            Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(listing.id);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top navigation helper */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition"
          >
            <ChevronLeft className="w-4 h-4" /> All stays
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-800">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={() => toggle(listing.id)}
              className="flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlisted ? "fill-[#FF385C] text-[#FF385C]" : "text-gray-800"
                }`}
              />
              {wishlisted ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Listing Title Header */}
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-bold text-gray-900">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                {listing.rating.toFixed(2)}
              </span>
              <span>·</span>
              <span className="underline font-semibold text-gray-900">
                {listing.reviews_count} reviews
              </span>
              <span>·</span>
              {listing.host?.is_superhost && (
                <>
                  <span className="flex items-center gap-1 text-[#FF385C] font-semibold">
                    <Award className="w-3.5 h-3.5" /> Superhost
                  </span>
                  <span>·</span>
                </>
              )}
              <span className="underline font-semibold text-gray-800">{listing.location}</span>
            </div>
          </div>
        </div>

        {/* 5-Photo Mosaic Gallery */}
        <PhotoGallery images={listing.images} title={listing.title} />

        {/* Details & Booking Layout */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8 divide-y divide-gray-200">
            {/* Host overview with Identity Verified badge & Contact Host button */}
            <div className="flex items-start justify-between pb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {listing.property_type} hosted by {listing.host?.name ?? "the host"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} baths
                </p>

              </div>

              {listing.host?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.host.avatar_url}
                  alt={listing.host.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                />
              )}
            </div>

            {/* Description */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this space</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What this place offers</h3>
              <AmenitiesList amenities={listing.amenities} />
            </div>

            {/* Availability Notice */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Availability</h3>
              <p className="text-xs text-gray-500">
                Booked dates are blocked automatically in real time. Use the reservation calendar to select your stay.
              </p>
              {bookedDates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-600">
                  <span className="font-semibold text-gray-800">Currently reserved periods:</span>
                  {bookedDates.map((b, i) => (
                    <span key={i} className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md border border-red-100">
                      {b.start_date} → {b.end_date}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sticky Reservation Widget) */}
          <div className="lg:col-span-5">
            <ReservationWidget
              listing={listing}
              bookedDates={bookedDates}
              onBookingSuccess={loadData}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900">Guest reviews</h3>
            <button
              onClick={() => (user ? setIsAddReviewOpen(true) : toast("Log in to write a review"))}
              className="rounded-xl border border-black px-4 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition cursor-pointer"
            >
              Write a Review
            </button>
          </div>

          {reviewsError && (
            <p className="text-sm text-gray-500" role="alert">
              Reviews could not be loaded.{" "}
              <button onClick={loadData} className="font-bold underline cursor-pointer">Retry</button>
            </p>
          )}
          {reviewsSummary && reviewsSummary.total_reviews === 0 && (
            <p className="text-sm text-gray-500">No reviews yet. Guests can review after they have stayed.</p>
          )}
          {reviewsSummary && reviewsSummary.total_reviews > 0 && (
            <>
              <ReviewsSummary summary={reviewsSummary} />
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviewsSummary.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Location / Map Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-gray-900">Where you&apos;ll be</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#FF385C]" /> {listing.location}
          </p>
          <MapView
            listings={[
              {
                id: listing.id,
                title: listing.title,
                category: listing.category,
                property_type: listing.property_type,
                price_per_night: listing.price_per_night,
                city: listing.city,
                country: listing.country,
                location: listing.location,
                latitude: listing.latitude,
                longitude: listing.longitude,
                max_guests: listing.max_guests,
                rating: listing.rating,
                reviews_count: listing.reviews_count,
                cover_image: listing.images.find((i) => i.is_cover)?.url ?? listing.images[0]?.url ?? "",
                images: listing.images.map((i) => i.url),
                is_wishlisted: wishlisted,
              },
            ]}
            height="400px"
            singleListing={true}
          />
        </div>
      </div>

      {/* Leave a review modal */}
      <AddReviewModal
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        listingId={listing.id}
        onReviewAdded={loadData}
      />

    </div>
  );
}