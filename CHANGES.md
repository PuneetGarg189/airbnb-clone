# What changed, and why (explain-it-in-30-seconds version)

## Bugs that would have failed an evaluation
1. **Dashboard crashed** - the frontend expected `stats/recent_bookings`; the API returned something else. Contract fixed; one shape on both sides.
2. **Anyone could act as anyone** - `user_id` / `host_id` were taken from the request. Now identity comes from the JWT everywhere; owners only for edit/delete.
3. **Fake login** - the login button only set a flag and impersonated a hard-coded user. Real register/login (email or username), `/me/`, logout, protected pages.
4. **Mock data hid failures** - when the API failed, the app silently showed 16 fake listings and fake bookings. Removed; there are real loading, error, retry and 404 states.
5. **Double-booking race** - overlap check and insert were not atomic. Now one transaction with a row lock + DB constraints.
6. **Price from the client** - total price can no longer be sent by the browser; the server computes it in Decimal.
7. **Reviews** - anyone could review anything, repeatedly, and "Leave review" showed for future stays. Now: completed stay required, one per guest, button only on past stays; reviewer name shown correctly.
8. **Dates** - UTC `toISOString()` shifted dates by a day for some users; all date logic is now local-date safe, with a real range calendar that blocks booked nights.
9. **Delete a listing with bookings** silently destroyed them; now blocked with a clear message (409).
10. **Photo upload** stored base64 inside the database; now a validated upload endpoint (type + 5 MB limit) returning a URL.

## Production hygiene
- Settings from environment variables (SECRET_KEY required, DEBUG off by default, CORS limited to your frontend).
- Fresh migrations, deterministic seed (`seed --reset`), 23 automated tests, N+1 queries removed (wishlist/superhost looked up once per request).
- Pagination reset bug on filter change fixed; filters live in the URL (shareable, back button works).
- Removed fake features that could not be backed by data: messaging screen, "identity verified", "replies in an hour", fake card form.
- TypeScript strict + ESLint clean, no `any` in touched code, unused dependencies removed.

## Verified
`python manage.py test` (23 pass), `tsc`, `eslint`, `next build`, and a browser run through: bad login, sign up, become host, search with dates, book, blocked dates, cancel, create/edit listing with upload, dashboard, 404.
