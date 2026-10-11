# Airbnb Clone (Django REST + Next.js)

A working Airbnb-style marketplace: browse and search stays, see availability on a calendar, book,
cancel, review, save to a wishlist, and host your own listings with a dashboard.

| Layer | Stack |
|---|---|
| Backend | Django 6, Django REST Framework, SimpleJWT, SQLite, WhiteNoise, gunicorn |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, date-fns, Leaflet |

## Run it locally (2 terminals)

```bash
# 1. API  -> http://localhost:8000
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed            # 16 listings, 12 users, bookings, reviews (deterministic)
python manage.py runserver

# 2. Web  -> http://localhost:3000
cd frontend
cp .env.example .env.local       # NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm install
npm run dev
```

No other configuration is needed locally (`manage.py` supplies a dev-only SECRET_KEY and DEBUG).
Run the tests with `python manage.py test` (23 tests). Reset the demo data with `python manage.py seed --reset`.

**Demo accounts** (password `demo1234`): guest `alex`, host `elena`. Or create your own on the Sign up form.
The login screen has one-click buttons for both demo accounts.

## How the rules work

- **Availability** uses half-open date ranges `[check_in, check_out)`. Two stays overlap when
  `existing.check_in < new.check_out AND existing.check_out > new.check_in`. A stay that ends the day another
  starts is allowed (back-to-back). Cancelling frees the dates (status flips to `CANCELLED`, nothing is deleted).
- **Booking is atomic**: one transaction locks the listing row (`select_for_update`), re-checks overlap, then
  inserts. Two simultaneous requests for the same dates cannot both succeed.
- **The server decides the price** (`nights x nightly + cleaning + service`, in `Decimal`). The client sends
  only listing, dates and guest count.
- **Identity comes from the JWT**, never from the request body. Only a listing's owner can edit/delete it; only
  the guest or the host can cancel a booking; hosting is a flag on the user (`PATCH /api/users/me/`).
- **Reviews** need a completed stay on that listing, one per guest per listing; ratings are recomputed from reviews.
- **Search** supports text, category, price range, guests, property type, amenities and an availability window.

## API (prefix `/api`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/users/register/` `/users/login/` `/users/login/refresh/` | - | sign up, JWT login (email or username) |
| GET/PATCH | `/users/me/` | yes | profile / become a host |
| GET | `/listings/` | - | search + pagination `{listings,total,page,total_pages}` |
| GET | `/listings/{id}/` | - | detail |
| POST/PATCH/DELETE | `/listings/` `/listings/{id}/` | host / owner | create, edit, delete (409 if upcoming bookings) |
| GET | `/listings/my_listings/` | yes | my listings |
| GET/POST | `/listings/{id}/reviews/` | read-only / yes | reviews + averages, add review |
| GET | `/bookings/booked_dates/?listing_id=` | - | blocked ranges (no guest data) |
| POST | `/bookings/` | yes | book |
| GET | `/bookings/my_trips/` | yes | my bookings |
| DELETE | `/bookings/{id}/` | guest or host | cancel |
| GET / POST | `/wishlists/` `/wishlists/toggle/` | yes | saved listings / toggle |
| GET | `/host/dashboard/` | host | stats, listings, recent bookings |
| POST | `/uploads/` | yes | upload a photo (returns a URL) |

Errors always carry a human-readable top-level `detail` (plus `errors` for field errors).

## Data model

`User` (is_host) - `Listing` (host FK, price/fees as Decimal, amenities JSON, cached rating) -
`ListingImage` - `Booking` (listing, guest, dates, guests, total, status; DB check constraints
`check_out > check_in`, `guests >= 1`; index on listing+dates) - `Review` (unique per guest+listing) - `Wishlist` (unique per user+listing).

## Live links

- API: https://airbnb-clone-api-t8pv.onrender.com  (e.g. `/api/listings/`)
- Frontend: https://airbnb-clone-frontend-gamma.vercel.app

Where each link lives in the project:

| Link | File | Setting |
|---|---|---|
| API (Render) | `frontend/.env.production` and Vercel env vars | `NEXT_PUBLIC_API_URL=https://airbnb-clone-api-t8pv.onrender.com/api` |
| Frontend (Vercel) | Render env vars (see `backend/.env.example`, `render.yaml`) | `CORS_ALLOWED_ORIGINS=https://airbnb-clone-frontend-gamma.vercel.app` |
| API host | Render env vars | `ALLOWED_HOSTS=airbnb-clone-api-t8pv.onrender.com` |

## Deploying

`render.yaml` deploys the API (`build.sh` installs, collects static, migrates, seeds). Set `CORS_ALLOWED_ORIGINS`
to the frontend URL. Deploy `frontend/` to Vercel with `NEXT_PUBLIC_API_URL=https://<api>.onrender.com/api`.

## Known limits (and what production would change)

- SQLite and local-disk uploads: move to PostgreSQL (needs real range-overlap exclusion constraint) and S3/Cloudinary + CDN.
- Render free tier wipes the disk on redeploy, so the demo data is re-seeded on every deploy.
- No payments, emails, or real messaging (checkout is a clearly labelled demo; the fake messages screen was removed).
- JWT is stored in `localStorage` (XSS exposure); production would use httpOnly cookies + CSRF protection and refresh rotation.
- No rate limiting on login/register; no email verification or password reset.
- Search is `icontains` SQL; production would use full-text search (Postgres) or a search engine, plus geo queries for the map.
- Cancellation has no refund policy; time zones are treated as one calendar day per listing (no per-listing zone).
- Listing `service_fee` is host-entered in this demo; a platform would compute it.
