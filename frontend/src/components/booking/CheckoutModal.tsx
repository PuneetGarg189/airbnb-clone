"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShieldCheck, CreditCard, Lock, Star, Sparkles } from "lucide-react";
import { ListingDetail } from "@/types";
import { formatPrice, formatDate, calculateNights } from "@/lib/utils";
import { createBooking } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingDetail;
  startDate: string;
  endDate: string;
  guestsCount: number;
  onSuccess?: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  listing,
  startDate,
  endDate,
  guestsCount,
  onSuccess,
}: CheckoutModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const nights = calculateNights(startDate, endDate);
  const pNight = Number(listing.price_per_night) || 0;
  const cFee = Number(listing.cleaning_fee) || 0;
  const sFee = Number(listing.service_fee) || 0;
  const accommodationTotal = nights * pNight;
  const grandTotal = accommodationTotal + cFee + sFee;

  const handleConfirmPay = async () => {
    setIsProcessing(true);
    try {
      await createBooking({
        listing_id: listing.id,
        user_id: user.id,
        start_date: startDate,
        end_date: endDate,
        guests_count: guestsCount,
        // Pass full listing snapshot so mock trips are dynamic
        _listing_snapshot: {
          title: listing.title,
          city: listing.city,
          country: listing.country,
          price_per_night: listing.price_per_night,
          cleaning_fee: listing.cleaning_fee,
          service_fee: listing.service_fee,
          image: listing.images?.[0]?.url || "",
        },
      } as any);

      toast.success("Reservation confirmed! Have an incredible stay.", {
        duration: 5000,
        icon: "🎉",
      });

      onClose();
      if (onSuccess) onSuccess();
      router.push("/trips");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete reservation. Dates might be booked.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-gray-900">Confirm and pay</h2>
          <div className="w-9" />
        </div>

        {/* Mocked Checkout notice banner */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <span className="flex items-center gap-1.5 font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Mocked Payment Processing
          </span>
          <span className="bg-white text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            Real Payment Gateway (Stripe) Coming Soon
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 divide-y divide-gray-100">
          {/* Property snippet */}
          <div className="flex items-center gap-4 pb-2">
            <img
              src={listing.images[0]?.url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80"}
              alt={listing.title}
              className="h-24 w-24 rounded-xl object-cover ring-1 ring-gray-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-semibold uppercase">{listing.property_type}</p>
              <h3 className="text-sm font-bold text-gray-900 truncate">{listing.title}</h3>
              <p className="text-xs text-gray-500">{listing.location}</p>
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-900 mt-1">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span>{listing.rating.toFixed(2)}</span>
                <span className="text-gray-400">({listing.reviews_count} reviews)</span>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="pt-6 space-y-3">
            <h4 className="text-base font-bold text-gray-900">Your trip</h4>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-gray-800">Dates</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {formatDate(startDate)} – {formatDate(endDate)} ({nights} nights)
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-bold underline text-gray-800 hover:text-black cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <div>
                <p className="font-semibold text-gray-800">Guests</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-bold underline text-gray-800 hover:text-black cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-6 space-y-4">
            <h4 className="text-base font-bold text-gray-900 flex items-center justify-between">
              <span>Pay with</span>
              <span className="flex items-center gap-1 text-xs font-normal text-emerald-700 font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Mocked Secure Checkout
              </span>
            </h4>

            {/* Payment Options */}
            <div className="space-y-2">
              <label
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "card" ? "border-black bg-gray-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-900">Credit or debit card</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="accent-black"
                />
              </label>

              <label
                onClick={() => setPaymentMethod("paypal")}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "paypal" ? "border-black bg-gray-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-blue-800 italic">PayPal</span>
                  <span className="text-sm font-semibold text-gray-900">PayPal balance or cards</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "paypal"}
                  onChange={() => setPaymentMethod("paypal")}
                  className="accent-black"
                />
              </label>

              <label
                onClick={() => setPaymentMethod("apple")}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === "apple" ? "border-black bg-gray-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-gray-900">Pay / GPay</span>
                  <span className="text-sm font-semibold text-gray-900">Express 1-Click Pay</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "apple"}
                  onChange={() => setPaymentMethod("apple")}
                  className="accent-black"
                />
              </label>
            </div>

            {/* Mocked Card Form */}
            {paymentMethod === "card" && (
              <div className="rounded-xl border border-gray-300 p-3 space-y-2 bg-white text-xs">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Card number</label>
                  <input
                    type="text"
                    readOnly
                    value="•••• •••• •••• 4242"
                    className="w-full font-mono text-sm font-semibold outline-hidden text-gray-700 mt-0.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Expiration</label>
                    <input
                      type="text"
                      readOnly
                      value="12 / 28"
                      className="w-full font-mono text-sm font-semibold outline-hidden text-gray-700 mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">CVV</label>
                    <input
                      type="text"
                      readOnly
                      value="888"
                      className="w-full font-mono text-sm font-semibold outline-hidden text-gray-700 mt-0.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="pt-6 space-y-3">
            <h4 className="text-base font-bold text-gray-900">Price details</h4>
            <div className="flex justify-between text-sm text-gray-700">
              <span>
                {formatPrice(listing.price_per_night)} × {nights} nights
              </span>
              <span>{formatPrice(accommodationTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Cleaning fee</span>
              <span>{formatPrice(listing.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Airbnb service fee</span>
              <span>{formatPrice(listing.service_fee)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-extrabold text-base text-gray-900">
              <span>Total (USD)</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="pt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#FF385C]" />
              <span>AirCover protection included</span>
            </div>
            <p>
              Free cancellation before 48 hours of check-in. This is a simulated booking for evaluation purposes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50">
          <div>
            <div className="text-xs text-gray-500">Total payable</div>
            <div className="text-lg font-black text-gray-900">{formatPrice(grandTotal)}</div>
          </div>
          <button
            onClick={handleConfirmPay}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-8 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105 transition disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? "Processing reservation..." : "Confirm & Pay (Mock)"}
          </button>
        </div>
      </div>
    </div>
  );
}