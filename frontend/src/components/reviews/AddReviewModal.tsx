"use client";

import React, { useState } from "react";
import { X, Star } from "lucide-react";
import { addReview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  onReviewAdded?: () => void;
}

export default function AddReviewModal({
  isOpen,
  onClose,
  listingId,
  onReviewAdded,
}: AddReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [locationRating, setLocationRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please write a few words about your stay");
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview(listingId, {
        user_id: user.id,
        rating,
        cleanliness,
        accuracy,
        communication,
        location_rating: locationRating,
        value_rating: valueRating,
        comment: comment.trim(),
      });
      toast.success("Review submitted! Thank you for your feedback.");
      setComment("");
      onClose();
      if (onReviewAdded) onReviewAdded();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarPicker = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-115 transition cursor-pointer"
          >
            <Star
              className={`h-4 w-4 ${
                star <= value
                  ? "fill-[#FF385C] text-[#FF385C]"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">Leave a review</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Overall Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1.5 hover:scale-120 transition cursor-pointer"
                >
                  <Star
                    className={`h-7 w-7 ${
                      star <= rating
                        ? "fill-[#FF385C] text-[#FF385C]"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 space-y-1 bg-gray-50">
            <StarPicker label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
            <StarPicker label="Accuracy" value={accuracy} onChange={setAccuracy} />
            <StarPicker label="Communication" value={communication} onChange={setCommunication} />
            <StarPicker label="Location" value={locationRating} onChange={setLocationRating} />
            <StarPicker label="Value" value={valueRating} onChange={setValueRating} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Your Review
            </label>
            <textarea
              required
              rows={4}
              placeholder="What made your stay special? Describe the host, view, amenities, and location..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-black outline-hidden"
            />
          </div>

          <div className="border-t pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
