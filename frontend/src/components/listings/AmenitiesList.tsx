import React from "react";
import {
  Wifi,
  Waves,
  Utensils,
  Car,
  Wind,
  Bath,
  Laptop,
  Zap,
  RefreshCw,
  Flame,
  Coffee,
  Heart,
  Snowflake,
  Sun,
  Tv,
  Sparkles,
} from "lucide-react";

interface AmenitiesListProps {
  amenities: string[];
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("wifi")) return <Wifi className="h-5 w-5 text-gray-700" />;
    if (lower.includes("pool")) return <Waves className="h-5 w-5 text-gray-700" />;
    if (lower.includes("kitchen")) return <Utensils className="h-5 w-5 text-gray-700" />;
    if (lower.includes("parking")) return <Car className="h-5 w-5 text-gray-700" />;
    if (lower.includes("air condition")) return <Wind className="h-5 w-5 text-gray-700" />;
    if (lower.includes("tub")) return <Bath className="h-5 w-5 text-gray-700" />;
    if (lower.includes("workspace")) return <Laptop className="h-5 w-5 text-gray-700" />;
    if (lower.includes("ev")) return <Zap className="h-5 w-5 text-gray-700" />;
    if (lower.includes("washer") || lower.includes("dryer")) return <RefreshCw className="h-5 w-5 text-gray-700" />;
    if (lower.includes("fireplace")) return <Flame className="h-5 w-5 text-gray-700" />;
    if (lower.includes("breakfast")) return <Coffee className="h-5 w-5 text-gray-700" />;
    if (lower.includes("pet")) return <Heart className="h-5 w-5 text-gray-700" />;
    if (lower.includes("ski")) return <Snowflake className="h-5 w-5 text-gray-700" />;
    if (lower.includes("patio") || lower.includes("balcony")) return <Sun className="h-5 w-5 text-gray-700" />;
    if (lower.includes("tv")) return <Tv className="h-5 w-5 text-gray-700" />;
    return <Sparkles className="h-5 w-5 text-gray-700" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
      {amenities.map((amenity) => (
        <div key={amenity} className="flex items-center gap-3 text-sm text-gray-800">
          {getIcon(amenity)}
          <span>{amenity}</span>
        </div>
      ))}
    </div>
  );
}
