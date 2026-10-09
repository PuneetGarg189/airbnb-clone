"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Star,
  Share2,
  Heart,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Key,
  Laptop,
  ChevronLeft,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { fetchListing, fetchBookedDates, fetchReviews } from "@/lib/api";
import { ListingDetail, BookedDateRange, ReviewsSummary as ReviewsSummaryType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import PhotoGallery from "@/components/listings/PhotoGallery";
import ReservationWidget from "@/components/listings/ReservationWidget";
import AmenitiesList from "@/components/listings/AmenitiesList";
import ReviewsSummary from "@/components/reviews/ReviewsSummary";
import ReviewCard from "@/components/reviews/ReviewCard";
import AddReviewModal from "@/components/reviews/AddReviewModal";
import MessageHostModal from "@/components/host/MessageHostModal";
import MapView from "@/components/map/MapView";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const listingId = parseInt(id, 10);

  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<ReviewsSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isMessageHostOpen, setIsMessageHostOpen] = useState(false);

  const loadData = async () => {
    try {
      const listingData = await fetchListing(listingId, user.id);
      setListing(listingData);
      setLoading(false);

      // Supplementary data
      try {
        const datesData = await fetchBookedDates(listingId);
        setBookedDates(datesData);
      } catch {
        setBookedDates([]);
      }

      try {
        const reviewsData = await fetchReviews(listingId);
        setReviewsSummary(reviewsData);
      } catch {
        // keep null or fallback
      }
    } catch (err) {
      console.warn("Failed to load listing details:", err);
      toast.error("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [listingId, user.id]);

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
        <p className="text-sm text-gray-500 mb-6">The stay you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="rounded-full bg-black text-white px-6 py-2.5 text-xs font-bold hover:bg-gray-800 transition"
        >
          Return to Explore
        </Link>
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
                  {listing.property_type} hosted by {listing.host?.name || "Elena"}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Identity verified
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500 font-normal">
                    {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} baths
                  </span>
                </div>

                {/* Host Response Time Badge */}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Generally replies in an hour
                  </span>
                  <span>·</span>
                  <span>Response rate: 100%</span>
                </div>

                {/* Contact Host Button */}
                <button
                  onClick={() => setIsMessageHostOpen(true)}
                  className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-800 hover:border-black hover:bg-gray-50 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#FF385C]" />
                  Contact Host
                  <span className="text-[10px] bg-pink-50 text-[#FF385C] px-1.5 py-0.2 rounded-md ml-1">
                    Direct Message
                  </span>
                </button>
              </div>

              <img
                src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"}
                alt={listing.host?.name || "Host"}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
              />
            </div>

            {/* Standout highlights */}
            <div className="pt-6 space-y-5">
              <div className="flex items-start gap-4">
                <Laptop className="h-6 w-6 text-gray-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Dedicated workspace</h4>
                  <p className="text-xs text-gray-500">A high-speed wifi workspace suitable for remote work.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Key className="h-6 w-6 text-gray-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Self check-in</h4>
                  <p className="text-xs text-gray-500">Easily check yourself in with the smart lock or lockbox.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-[#FF385C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">AirCover Protection</h4>
                  <p className="text-xs text-gray-500">Every booking includes free protection from Host cancellations.</p>
                </div>
              </div>
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
              onClick={() => setIsAddReviewOpen(true)}
              className="rounded-xl border border-black px-4 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition cursor-pointer"
            >
              Write a Review
            </button>
          </div>

          {reviewsSummary && (
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
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">
              Interactive Leaflet Map
            </span>
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
                cover_image: listing.images[0]?.url || "",
                images: listing.images.map((i) => i.url),
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

      {/* Message host modal */}
      <MessageHostModal
        isOpen={isMessageHostOpen}
        onClose={() => setIsMessageHostOpen(false)}
        host={listing.host}
        listingTitle={listing.title}
      />
    </div>
  );
}