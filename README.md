# StayNest — Airbnb Clone

A full-stack Airbnb-inspired rental marketplace built as an SDE Fullstack assignment. Closely replicates Airbnb's design, UX, and core booking workflows.

![StayNest Preview](https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd airbnb-clone
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# or: venv\Scripts\activate     # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py seed           # Seeds 40 listings, 5 users, 20 bookings, 30 reviews
python manage.py runserver 8000
```

Backend available at: `http://localhost:8000`  
Admin panel: `http://localhost:8000/admin`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create .env.local manually (see below)
npm run dev
```

App available at: `http://localhost:3000`

### Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## 🔑 Demo Accounts

| Role | Username | Password | Notes |
|---|---|---|---|
| Superhost | `elena_host` | `demo1234` | Has 15+ listings in Bali, Santorini |
| Host | `raj_host` | `demo1234` | Has 10 listings in India |
| Guest | `alex_guest` | `demo1234` | Has 3 bookings |
| Host | `sofia_host` | `demo1234` | European properties |
| Guest | `priya_guest` | `demo1234` | Wishlisted 5 properties |

Toggle between **Host Mode** and **Guest Mode** via the navbar user menu.

---

## 🏗️ Architecture Overview

```
airbnb-clone/
├── backend/          # Django REST Framework API
│   ├── config/       # Project settings, CORS, JWT config
│   ├── users/        # Custom User model, Auth endpoints
│   ├── listings/     # Listings, Reviews, Wishlists
│   └── bookings/     # Booking management
└── frontend/         # Next.js 14 App Router
    └── src/
        ├── app/      # Pages (home, rooms, trips, host dashboard)
        ├── components/  # Reusable UI components
        ├── context/  # Auth, Search, Wishlist state
        ├── lib/      # API client, utils
        └── types/    # TypeScript types
```

### Frontend Architecture

```
page.tsx (Home)
  ├── Navbar — scroll-aware search pill, host/guest switch, dark mode
  ├── CategoriesBar — horizontal scroll category filter + advanced filter modal
  ├── ListingGrid — responsive grid (1-4 cols) with skeleton loaders
  │   └── ListingCard — photo carousel (arrows + dots), heart save, Airbnb-style
  ├── MapView — Leaflet.js interactive map with price pins
  └── SearchModal — Destination + Dates + Guests search flow

rooms/[id]/page.tsx (Listing Detail)
  ├── PhotoGallery — 5-photo mosaic + lightbox
  ├── ReservationWidget (sticky) — date picker, guest count, price breakdown
  │   └── CheckoutModal — mock payment + booking confirmation
  ├── AmenitiesList — icon-matched amenities grid
  ├── ReviewsSummary — sub-ratings (cleanliness, accuracy, etc.)
  ├── ReviewCard — individual review cards
  └── MapView — single listing map

host/dashboard/page.tsx — stats, listings CRUD, booking management
host/create/page.tsx — multi-step listing creation form
host/edit/[id]/page.tsx — edit existing listing
trips/page.tsx — My Trips (upcoming, past, cancelled tabs)
wishlists/page.tsx — Saved properties
messages/page.tsx — Placeholder messaging UI
```

---

## 🗄️ Database Schema

### ERD

```
users.User
  ├── id (PK)
  ├── username, email, password
  ├── first_name, last_name
  ├── is_host (Boolean)
  └── profile_picture (ImageField)

listings.Listing
  ├── id (PK)
  ├── host (FK → User)
  ├── title, description
  ├── category, property_type
  ├── price_per_night, cleaning_fee, service_fee
  ├── city, country, location
  ├── latitude, longitude
  ├── max_guests, bedrooms, beds, baths
  ├── amenities (JSONField)
  ├── rating (Float, denormalized)
  └── reviews_count (Int, denormalized)

listings.ListingImage
  ├── id (PK)
  ├── listing (FK → Listing)
  ├── image_url (URLField)
  ├── image (ImageField)
  ├── is_primary (Boolean)
  └── display_order (Int)

listings.Review
  ├── id (PK)
  ├── listing (FK → Listing)
  ├── guest (FK → User)
  ├── rating (1-5 overall)
  ├── cleanliness, accuracy, communication
  ├── location_rating, value_rating (Float sub-ratings)
  └── comment, created_at

listings.Wishlist
  ├── id (PK)
  ├── user (FK → User)
  ├── listing (FK → Listing)
  └── created_at
  UNIQUE: (user, listing)

bookings.Booking
  ├── id (PK)
  ├── listing (FK → Listing)
  ├── guest (FK → User)
  ├── check_in_date, check_out_date
  ├── guest_count
  ├── total_price (Decimal)
  ├── status (CONFIRMED | CANCELLED)
  └── created_at, updated_at
```

---

## 🌐 API Overview

All endpoints prefixed with `/api/`.

### Listings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/listings/` | List + search + filter listings |
| POST | `/listings/` | Create listing (host) |
| GET | `/listings/{id}/` | Listing detail |
| PUT | `/listings/{id}/` | Edit listing (host, owner only) |
| DELETE | `/listings/{id}/` | Delete listing (host, owner only) |
| GET | `/listings/my_listings/` | Host's own listings |
| GET | `/listings/{id}/reviews/` | Reviews summary + list |
| POST | `/listings/{id}/reviews/` | Add a review |

**Query Params for listings list:**
- `search` — full-text search title/description/location
- `category` — filter by category slug
- `city` — filter by city
- `min_price`, `max_price` — price range
- `guests` — minimum capacity
- `property_type` — Villa, Cabin, Apartment, etc.
- `amenities` — comma-separated list
- `start_date`, `end_date` — availability filtering (excludes booked)
- `page`, `limit` — pagination

**Response format:**
```json
{
  "listings": [...],
  "total": 40,
  "page": 1,
  "total_pages": 2
}
```

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings/` | Create booking |
| GET | `/bookings/my_trips/?user_id={id}` | User's trips |
| DELETE | `/bookings/{id}/` | Cancel booking |
| GET | `/bookings/booked_dates/?listing_id={id}` | Booked date ranges |

### Wishlists
| Method | Endpoint | Description |
|---|---|---|
| GET | `/wishlists/?user_id={id}` | User's saved listings |
| POST | `/wishlists/toggle/` | Toggle save/unsave |

### Users & Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/users/register/` | Register new user |
| POST | `/users/login/` | Login (returns JWT) |
| GET | `/users/me/` | Current user profile |
| GET | `/users/` | List all users |

### Host
| Method | Endpoint | Description |
|---|---|---|
| GET | `/host/dashboard/?host_id={id}` | Dashboard stats + listings + bookings |

---

## ✨ Core Features

### 1. Home & Search
- Grid of listing cards with photo carousel (5 photos, swipeable), price, rating, location
- Sticky Navbar with Airbnb-style search pill (Destination | Dates | Guests)
- Advanced search modal with date range picker and guest selector
- Category filter bar (Beachfront, Cabins, Amazing views, Iconic cities, etc.)
- Advanced filter modal: price range slider, property type, amenities checkboxes
- Pagination (8 per page)
- Map/List toggle — interactive Leaflet.js map with price pins
- Active filter chips with individual clear buttons

### 2. Listing Detail Page
- 5-photo mosaic gallery with full-screen lightbox
- Sticky reservation widget with date picker, guest counter, price breakdown
  - Nightly rate × nights + Cleaning fee + Service fee = **Total before taxes**
  - Conflict detection (grays out unavailable dates)
- Host info with avatar, superhost badge, response rate, identity verified
- Amenities grid with matching icons (Wifi, Pool, Kitchen, etc.)
- Reviews section with sub-ratings (Cleanliness, Accuracy, Communication, Location, Value)
- "Where you'll be" Leaflet map centered on listing
- Contact Host modal (placeholder messaging)
- Write a Review button → modal with star picker and sub-rating sliders

### 3. Booking Flow
- Select dates → guest count → click Reserve
- Checkout modal with price breakdown + mock payment form
- Date conflict validation (no double-booking)
- Booking persisted to SQLite, blocks those dates immediately
- My Trips page: tabs for Upcoming / Past / Cancelled
- Cancel Trip button with confirmation modal
- Leave Review button on past trips

### 4. Host Experience
- Toggle between Host Mode and Guest Mode via navbar
- Host Dashboard: stats (total listings, bookings, revenue, avg rating), listings table, recent bookings
- Create Listing: multi-step form with title, description, photos (URLs), price, location, amenities
- Edit Listing: pre-filled form, update any field
- Delete Listing: with confirmation modal
- All data persists in SQLite

### 5. Airbnb UX Details
- Smooth scroll-aware navbar (search pill collapses on scroll)
- Dark mode toggle (persists to localStorage)
- Wishlist/favorites with heart pop animation
- Toast notifications (success, error, info)
- Skeleton loading states for all data-fetching components
- Empty state illustrations for no results / no trips
- Mobile-responsive design (hamburger nav on mobile)
- Fallback data mode (works without backend running)

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Maps | Leaflet.js + react-leaflet |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Backend | Python 3.11 + Django 5 + Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Database | SQLite |
| CORS | django-cors-headers |
| Filtering | django-filter |

---

## 📁 Mocked / Placeholder Sections

Per assignment requirements, the following are intentionally mocked:

| Feature | Implementation |
|---|---|
| Payment processing | Mock form (card number/expiry/CVV fields) — no real charge |
| Messaging | UI placeholder with "Coming soon" state |
| Identity verification | Modal with checkmark UI only |
| Real-time notifications | Toast-based (no WebSocket) |
| Image upload | URL-based (Unsplash links used in seed data) |
| Email confirmation | Console email backend in Django |

---

## 🎨 Design Decisions

1. **Airbnb color palette**: `#FF385C` (rausch/brand red), `#484848` (hof/dark text), `#767676` (foggy/secondary)
2. **Fallback-first data**: API calls have 4-second timeouts; if backend is unavailable, hardcoded fallback data is served instantly so the UI is always usable
3. **Denormalized ratings**: `rating` and `reviews_count` are stored on the Listing model directly (recalculated on review submit) for fast queries without JOINs
4. **Auth simplification**: The auth context uses mocked default users (Guest Alex / Superhost Elena) for immediate demo-ability. Real JWT auth is supported when backend is running.
5. **Wishlist persistence**: Wishlists are stored in both the backend (when available) and localStorage (as fallback via WishlistContext)

---

## 🚀 Deployment

### Deploy to Vercel (Frontend) + Render (Backend)

**Backend on Render:**
1. Connect GitHub repo → New Web Service
2. Build: `pip install -r requirements.txt`
3. Start: `gunicorn config.wsgi:application`
4. Add env var: `ALLOWED_HOSTS=your-render-url.onrender.com`

**Frontend on Vercel:**
1. Connect GitHub repo → Import project → `frontend/` as root
2. Add env var: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api`

A `render.yaml` is included for one-click Render deployment.

---

## 🧪 Assumptions

1. Authentication is simplified — no email verification required. JWT tokens expire in 7 days.
2. Photo upload uses URL strings (Unsplash for demo). Production would use S3/Cloudinary.
3. Reviews can be left without completing a stay (for demo purposes).
4. The "Superhost" badge is automatically awarded to hosts with 3+ listings.
5. Prices in seed data are in USD for international listings and INR for Indian listings.
6. The app works fully without a backend (fallback data mode) to ensure demo reliability.

---

## 📸 Screenshots

| Page | Description |
|---|---|
| Home | Grid of listings with category filter and search pill |
| Listing Detail | 5-photo gallery, amenities, sticky booking widget |
| Booking Flow | Date picker → price breakdown → mock checkout → confirmation |
| Host Dashboard | Stats, listings table, recent bookings |
| My Trips | Upcoming/Past/Cancelled tabs with booking cards |
| Map View | Leaflet.js with price-label pins |