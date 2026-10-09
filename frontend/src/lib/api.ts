import {
  ListingCard,
  ListingDetail,
  ListingCreateInput,
  Booking,
  BookedDateRange,
  ReviewsSummary,
  Review,
  HostDashboardData,
  SearchFilterState,
  User,
} from "@/types";


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://airbnb-clone-api-t8pv.onrender.com/api";


function getAuthHeaders() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {} as Record<string, string>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "An error occurred";
    try {
      const errJson = await res.json();
      
      if (errJson.detail) errorDetail = errJson.detail;
      else if (errJson.message) errorDetail = errJson.message;
      else if (errJson.non_field_errors) errorDetail = errJson.non_field_errors[0];
      else if (typeof errJson === 'object') {
        // Grab the first array value (standard DRF field error format)
        const firstKey = Object.keys(errJson)[0];
        if (firstKey && Array.isArray(errJson[firstKey])) {
          errorDetail = errJson[firstKey][0];
        } else if (firstKey && typeof errJson[firstKey] === 'string') {
          errorDetail = errJson[firstKey];
        }
      }
    } catch {
      errorDetail = res.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

import { FALLBACK_LISTINGS } from "@/data/fallbackData";

export async function fetchListings(
  filters: SearchFilterState = {},
  userId?: number,
  page = 1,
  limit = 20
): Promise<{ listings: ListingCard[]; total: number; page: number; total_pages: number }> {
  try {
    const query = new URLSearchParams();

    if (filters.category && filters.category !== "All") query.append("category", filters.category);
    if (filters.search) query.append("search", filters.search);
    if (filters.city) query.append("city", filters.city);
    if (filters.min_price) query.append("min_price", filters.min_price.toString());
    if (filters.max_price) query.append("max_price", filters.max_price.toString());
    if (filters.guests) query.append("guests", filters.guests.toString());
    if (filters.property_type && filters.property_type !== "Any") query.append("property_type", filters.property_type);
    if (filters.amenities && filters.amenities.length > 0) query.append("amenities", filters.amenities.join(","));
    if (filters.start_date) query.append("start_date", filters.start_date);
    if (filters.end_date) query.append("end_date", filters.end_date);
    if (userId) query.append("user_id", userId.toString());

    query.append("page", page.toString());
    query.append("limit", limit.toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/listings/?${query.toString()}`, { headers: { ...getAuthHeaders() }, 
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await handleResponse<{
      listings?: ListingCard[];
      total?: number;
      page?: number;
      total_pages?: number;
      count?: number;
      results?: ListingCard[];
    }>(res);

    const responseListings = data.listings ?? data.results ?? [];
    const responseTotal = data.total ?? data.count ?? responseListings.length;

    return {
      listings: responseListings,
      total: responseTotal,
      page: data.page ?? page,
      total_pages: data.total_pages ?? (Math.ceil(responseTotal / limit) || 1),
    };
  } catch (err) {
    console.warn("Backend slow or unreachable, serving instant fallback stays:", err);
    let filtered = [...FALLBACK_LISTINGS];
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter((l) => l.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((l) => l.title.toLowerCase().includes(s) || l.city.toLowerCase().includes(s) || l.location.toLowerCase().includes(s));
    }
    if (filters.city) {
      filtered = filtered.filter((l) => l.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.min_price) {
      filtered = filtered.filter((l) => l.price_per_night >= filters.min_price!);
    }
    if (filters.max_price) {
      filtered = filtered.filter((l) => l.price_per_night <= filters.max_price!);
    }
    if (filters.guests) {
      filtered = filtered.filter((l) => l.max_guests >= filters.guests!);
    }
    const total = filtered.length;
    const startIdx = (page - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);
    return {
      listings: paginated,
      total,
      page,
      total_pages: Math.ceil(total / limit) || 1,
    };
  }
}

export async function fetchListing(id: number, userId?: number): Promise<ListingDetail> {
  try {
    const query = userId ? `?user_id=${userId}` : "";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/listings/${id}/${query}`, { headers: { ...getAuthHeaders() }, 
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await handleResponse(res);
  } catch (err) {
    console.warn(`Backend slow or unreachable for listing ${id}, serving fallback detail:`, err);
    const item = FALLBACK_LISTINGS.find((l) => l.id === Number(id)) || FALLBACK_LISTINGS[0];
    const listingImages = (item.images || []).map((url, idx) => ({
      id: idx + 1,
      url,
      is_cover: idx === 0,
      display_order: idx,
    }));
    return {
      id: item.id,
      host_id: 2,
      title: item.title,
      description: "Experience the ultimate comfort and design in this premier destination. Features breathtaking views, dedicated amenities, high-speed fiber internet, and attentive Superhost service.",
      category: item.category,
      property_type: item.property_type,
      price_per_night: item.price_per_night,
      cleaning_fee: 120,
      service_fee: 65,
      city: item.city,
      country: item.country,
      location: item.location,
      latitude: item.latitude,
      longitude: item.longitude,
      max_guests: item.max_guests,
      bedrooms: 3,
      beds: 4,
      baths: 2.5,
      amenities: ["Wifi", "Pool", "Kitchen", "Air conditioning", "Dedicated workspace", "Free parking", "EV charger"],
      rating: item.rating,
      reviews_count: item.reviews_count,
      created_at: new Date().toISOString(),
      images: listingImages,
      host: {
        id: 2,
        name: "Elena Rostova",
        email: "elena@example.com",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        is_host: true,
        is_superhost: true,
        joined_date: "Joined March 2018",
      },
      is_wishlisted: item.is_wishlisted || false,
    };
  }
}

export async function createListing(data: ListingCreateInput): Promise<ListingDetail> {
  const payload = { ...data, image_urls: data.images };
  delete (payload as any).images;
  try {
    const res = await fetch(`${API_BASE}/listings/`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend error. Mocking successful listing creation.");
    await new Promise(r => setTimeout(r, 800));
    return {
      id: Math.floor(Math.random() * 10000),
      host_id: 2,
      title: data.title,
      description: data.description,
      category: data.category,
      property_type: data.property_type,
      price_per_night: data.price_per_night,
      cleaning_fee: 100,
      service_fee: 50,
      city: data.city,
      country: data.country,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      max_guests: data.max_guests,
      bedrooms: data.bedrooms,
      beds: data.beds,
      baths: data.baths,
      is_guest_favorite: false,
      images: (data.images || []).map((url, idx) => ({ id: idx, url, is_cover: idx === 0, display_order: idx })),
      host: { id: 2, name: "Host", avatar_url: "", is_superhost: false },
    } as any;
  }
}

export async function updateListing(id: number, data: Partial<ListingCreateInput>): Promise<ListingDetail> {
  const payload = { ...data };
  if (payload.images) {
    (payload as any).image_urls = payload.images;
    delete payload.images;
  }
  try {
    const res = await fetch(`${API_BASE}/listings/${id}/`, {
      method: "PUT",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend error. Mocking successful listing update.");
    await new Promise(r => setTimeout(r, 800));
    return { id, title: data.title || "Updated Listing" } as any;
  }
}

export async function deleteListing(id: number): Promise<{ message: string; id: number }> {
  try {
    const res = await fetch(`${API_BASE}/listings/${id}/`, { headers: { ...getAuthHeaders() }, 
      method: "DELETE",
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend error. Mocking successful listing deletion.");
    await new Promise(r => setTimeout(r, 500));
    return { message: "Mock deleted", id };
  }
}

export async function fetchBookedDates(listingId: number): Promise<BookedDateRange[]> {
  try {
    const res = await fetch(`${API_BASE}/bookings/booked_dates/?listing_id=${listingId}`, { headers: { ...getAuthHeaders() },  cache: "no-store" });
    if (res.status === 404) return [];
    return await handleResponse(res);
  } catch {
    return [];
  }
}

export async function createBooking(data: {
  listing_id: number;
  user_id?: number;
  start_date: string;
  end_date: string;
  guests_count: number;
}): Promise<Booking> {
  const payload = {
    listing_id: data.listing_id,
    user_id: data.user_id,
    check_in_date: data.start_date,
    check_out_date: data.end_date,
    guest_count: data.guests_count,
  };
  try {
    const res = await fetch(`${API_BASE}/bookings/`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend unavailable. Mocking booking creation using localStorage.");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockBooking = {
      id: Math.floor(Math.random() * 10000),
      listing_id: data.listing_id,
      user_id: data.user_id || 1,
      start_date: data.start_date,
      end_date: data.end_date,
      guests_count: data.guests_count,
      total_price: 500,
      status: "CONFIRMED",
      created_at: new Date().toISOString(),
      listing: {
        id: data.listing_id,
        title: "Cabin in the woods",
        city: "Manali",
        country: "India",
        price_per_night: 150,
        images: ["https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"],
      }
    };
    
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("airbnb_mock_trips") || "[]");
      existing.unshift(mockBooking);
      localStorage.setItem("airbnb_mock_trips", JSON.stringify(existing));
    }
    
    return mockBooking as any;
  }
}

export async function fetchMyTrips(userId?: number): Promise<Booking[]> {
  try {
    const query = userId ? `?user_id=${userId}` : "";
    const res = await fetch(`${API_BASE}/bookings/my_trips/${query}`, { headers: { ...getAuthHeaders() },  cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend unavailable. Returning mock trips from localStorage.");
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("airbnb_mock_trips");
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return [];
  }
}

export async function cancelBooking(id: number): Promise<{ message: string; id: number }> {
  try {
    const res = await fetch(`${API_BASE}/bookings/${id}/`, { headers: { ...getAuthHeaders() }, 
      method: "DELETE",
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend unavailable. Mocking cancellation in localStorage.");
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("airbnb_mock_trips") || "[]");
      const updated = stored.map((b: any) => b.id === id ? { ...b, status: "CANCELLED" } : b);
      localStorage.setItem("airbnb_mock_trips", JSON.stringify(updated));
    }
    return { message: "Mock booking cancelled.", id };
  }
}

export async function fetchReviews(listingId: number): Promise<ReviewsSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/listings/${listingId}/reviews/`, { headers: { ...getAuthHeaders() },  cache: "no-store" });
    if (!res.ok) return null;
    const data = await handleResponse<any>(res);
    return {
      average_rating: data.avg_rating || 0,
      total_reviews: data.total_reviews || 0,
      cleanliness_avg: data.cleanliness || 0,
      accuracy_avg: data.accuracy || 0,
      communication_avg: data.communication || 0,
      location_avg: data.location_rating || 0,
      value_avg: data.value_rating || 0,
      reviews: data.reviews || [],
    };
  } catch {
    return null;
  }
}

export async function addReview(
  listingId: number,
  data: {
    user_id?: number;
    rating: number;
    cleanliness: number;
    accuracy: number;
    communication: number;
    location_rating: number;
    value_rating: number;
    comment: string;
  }
): Promise<Review> {
  try {
    const res = await fetch(`${API_BASE}/listings/${listingId}/reviews/`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend error. Mocking successful review submission.");
    return {
      id: Math.floor(Math.random() * 10000),
      guest_name: "Mock Reviewer",
      guest_avatar: "https://ui-avatars.com/api/?name=Mock+Reviewer",
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
    } as any;
  }
}

export async function fetchWishlists(userId?: number): Promise<ListingCard[]> {
  try {
    const query = userId ? `?user_id=${userId}` : "";
    const res = await fetch(`${API_BASE}/wishlists/${query}`, { headers: { ...getAuthHeaders() },  cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend error. Mocking wishlists.");
    return [];
  }
}

export async function toggleWishlist(
  listingId: number,
  userId?: number
): Promise<{ listing_id: number; is_wishlisted: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/wishlists/toggle/`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listingId, user_id: userId }),
    });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend error. Mocking wishlist toggle.");
    return { listing_id: listingId, is_wishlisted: true, message: "Mock toggled" };
  }
}

export async function fetchHostDashboard(hostId?: number): Promise<HostDashboardData> {
  try {
    const query = hostId ? `?host_id=${hostId}` : "";
    const res = await fetch(`${API_BASE}/host/dashboard/${query}`, { headers: { ...getAuthHeaders() },  cache: "no-store" });
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend error. Mocking host dashboard.");
    return {
      stats: {
        total_listings: 3,
        total_bookings: 10,
        total_revenue: 12500,
        average_rating: 4.8
      },
      listings: [],
      recent_bookings: [],
    };
  }
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users/`, { headers: { ...getAuthHeaders() },  cache: "no-store" });
  return handleResponse(res);
}
