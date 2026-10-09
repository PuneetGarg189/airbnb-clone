import React from "react";
import { Star } from "lucide-react";
import { ReviewsSummary as ReviewsSummaryType } from "@/types";

interface ReviewsSummaryProps {
  summary: ReviewsSummaryType;
}

export default function ReviewsSummary({ summary }: ReviewsSummaryProps) {
  const categories = [
    { label: "Cleanliness", score: summary.cleanliness_avg },
    { label: "Accuracy", score: summary.accuracy_avg },
    { label: "Communication", score: summary.communication_avg },
    { label: "Location", score: summary.location_avg },
    { label: "Value", score: summary.value_avg },
  ];

  return (
    <div className="py-6 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-6 w-6 fill-black text-black" />
        <span className="text-2xl font-black text-gray-900">
          {summary.average_rating.toFixed(2)}
        </span>
        <span className="text-xl text-gray-400">·</span>
        <span className="text-2xl font-bold text-gray-900">
          {summary.total_reviews} reviews
        </span>
      </div>

      {/* Progress Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{cat.label}</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: `${(cat.score / 5) * 100}%` }}
                />
              </div>
              <span className="font-bold text-xs text-gray-900 w-6 text-right">
                {cat.score.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
