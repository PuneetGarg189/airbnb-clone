export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_host: boolean;
  is_superhost: boolean;
  joined_date?: string;
  created_at?: string;
}

export interface ListingImage {
  id?: number;
  url: string;
  is_cover: boolean;
  display_order: number;
}

export interface ListingCard {
  id: number;
  title: string;
  category: string;
  property_type: string;
  price_per_night: number;
  city: string;
  country: string;
  location: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  rating: number;
  reviews_count: number;
  cover_image: string;
  images: string[];
  is_guest_favourite?: boolean;
  is_wishlisted?: boolean;
  host?: { id: number; name: string; avatar_url: string };
}

export interface ListingDetail {
  id: number;
  host_id: number;
  title: string;
  description: string;
  category: string;
  property_type: string;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  city: string;
  country: string;
  location: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  rating: number;
  reviews_count: number;
  created_at: string;
  images: ListingImage[];
  host?: User;
  is_wishlisted?: boolean;
}

export interface ListingCreateInput {
  title: string;
  description: string;
  category: string;
  property_type: string;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  city: string;
  country: string;
  location: string;
  latitude: number;
  longitude: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: string[];
  images: string[];
  host_id?: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  guests_count: number;
  nightly_price: number;
  total_price: number;
  status: string;
  created_at: string;
  listing?: ListingCard;
}

export interface BookedDateRange {
  start_date: string;
  end_date: string;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location_rating: number;
  value_rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

export interface ReviewsSummary {
  average_rating: number;
  total_reviews: number;
  cleanliness_avg: number;
  accuracy_avg: number;
  communication_avg: number;
  location_avg: number;
  value_avg: number;
  reviews: Review[];
}

export interface HostStats {
  total_listings: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
}

export interface HostDashboardData {
  stats: HostStats;
  listings: ListingCard[];
  recent_bookings: Booking[];
}

export interface SearchFilterState {
  category?: string;
  search?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  guests?: number;
  property_type?: string;
  amenities?: string[];
  start_date?: string;
  end_date?: string;
}
