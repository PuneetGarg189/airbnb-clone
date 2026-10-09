import React from "react";
import { Star, User } from "lucide-react";
import { Review } from "@/types";
import { formatDate } from "@/lib/utils";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="space-y-3">
      {/* Reviewer Header */}
      <div className="flex items-center gap-3">
        {review.user?.avatar_url ? (
          <img
            src={review.user.avatar_url}
            alt={review.user.name}
            className="h-11 w-11 rounded-full object-cover ring-1 ring-gray-200"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-gray-600">
            <User className="h-6 w-6" />
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-gray-900">
            {review.user?.name || "Guest"}
          </h4>
          <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="h-3 w-3 fill-black text-black" />
        ))}
      </div>

      {/* Comment */}
      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
    </div>
  );
}
