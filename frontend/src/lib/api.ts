import type {
  Booking,
  BookedDateRange,
  HostDashboardData,
  ListingCard,
  ListingCreateInput,
  ListingDetail,
  Review,
  ReviewsSummary,
  SearchFilterState,
  User,
} from "@/types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** Thrown for every failed request so the UI can show a real message. */
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// ---- token storage -------------------------------------------------------
const ACCESS = "access_token";
const REFRESH = "refresh_token";

export const tokens = {
  get access() {
    return typeof window === "undefined" ? null : localStorage.getItem(ACCESS);
  },
  get refresh() {
    return typeof window === "undefined" ? null : localStorage.getItem(REFRESH);
  },
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};

// ---- request helper ------------------------------------------------------
function messageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.detail === "string") return b.detail;
    if (typeof b.message === "string") return b.message;
  }
  return fallback;
}

async function refreshAccess(): Promise<boolean> {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/users/login/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokens.set(data.access, data.refresh);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isForm && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = tokens.access;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 401 && token && retry && (await refreshAccess())) {
    return request<T>(path, init, false);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) tokens.clear();
    throw new ApiError(messageFrom(body, res.statusText || "Something went wrong."), res.status);
  }
  return body as T;
}

const post = <T>(path: string, data: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(data) });

// ---- auth ----------------------------------------------------------------
export async function login(identifier: string, password: string): Promise<User> {
  const t = await post<{ access: string; refresh: string }>("/users/login/", {
    username: identifier,
    password,
  });
  tokens.set(t.access, t.refresh);
  return fetchMe();
}

export async function register(name: string, email: string, password: string): Promise<User> {
  await post("/users/register/", { name, email, password });
  return login(email, password);
}

export const fetchMe = () => request<User>("/users/me/");

export const becomeHost = () =>
  request<User>("/users/me/", { method: "PATCH", body: JSON.stringify({ is_host: true }) });

// ---- listings ------------------------------------------------------------
export interface ListingsPage {
  listings: ListingCard[];
  total: number;
  page: number;
  total_pages: number;
}

export function fetchListings(filters: SearchFilterState = {}, page = 1, limit = 20) {
  const q = new URLSearchParams();
  if (filters.category && filters.category !== "All") q.set("category", filters.category);
  if (filters.search) q.set("search", filters.search);
  if (filters.city) q.set("city", filters.city);
  if (filters.min_price) q.set("min_price", String(filters.min_price));
  if (filters.max_price) q.set("max_price", String(filters.max_price));
  if (filters.guests) q.set("guests", String(filters.guests));
  if (filters.property_type && filters.property_type !== "Any") q.set("property_type", filters.property_type);
  if (filters.amenities?.length) q.set("amenities", filters.amenities.join(","));
  if (filters.start_date && filters.end_date) {
    q.set("start_date", filters.start_date);
    q.set("end_date", filters.end_date);
  }
  q.set("page", String(page));
  q.set("limit", String(limit));
  return request<ListingsPage>(`/listings/?${q}`);
}

export const fetchListing = (id: number | string) => request<ListingDetail>(`/listings/${id}/`);

export const createListing = (data: ListingCreateInput) =>
  post<ListingDetail>("/listings/", data);

export const updateListing = (id: number, data: Partial<ListingCreateInput>) =>
  request<ListingDetail>(`/listings/${id}/`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteListing = (id: number) =>
  request<{ message: string; id: number }>(`/listings/${id}/`, { method: "DELETE" });

export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await request<{ url: string }>("/uploads/", { method: "POST", body: form });
  return res.url;
}

// ---- bookings ------------------------------------------------------------
export const fetchBookedDates = (listingId: number) =>
  request<BookedDateRange[]>(`/bookings/booked_dates/?listing_id=${listingId}`);

export const createBooking = (data: {
  listing_id: number;
  start_date: string;
  end_date: string;
  guests_count: number;
}) => post<Booking>("/bookings/", data);

export const fetchMyTrips = () => request<Booking[]>("/bookings/my_trips/");

export const cancelBooking = (id: number) =>
  request<{ message: string; id: number }>(`/bookings/${id}/`, { method: "DELETE" });

// ---- reviews -------------------------------------------------------------
export const fetchReviews = (listingId: number) =>
  request<ReviewsSummary>(`/listings/${listingId}/reviews/`);

export const addReview = (
  listingId: number,
  data: {
    rating: number;
    cleanliness: number;
    accuracy: number;
    communication: number;
    location_rating: number;
    value_rating: number;
    comment: string;
  }
) => post<Review>(`/listings/${listingId}/reviews/`, data);

// ---- wishlist & dashboard ------------------------------------------------
export const fetchWishlists = () => request<ListingCard[]>("/wishlists/");

export const toggleWishlist = (listingId: number) =>
  post<{ listing_id: number; is_wishlisted: boolean; message: string }>("/wishlists/toggle/", {
    listing_id: listingId,
  });

export const fetchHostDashboard = () => request<HostDashboardData>("/host/dashboard/");
