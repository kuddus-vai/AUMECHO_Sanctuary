## Concert Booking Page

New route `/booking` (linked from main nav) with a full booking system: inquiry form persisted to backend, automated email notifications, and rich content sections.

### Page sections

1. **Hero** — Title "Book Aum Echo Live", tagline, scroll cue. Reuses HUD/neon visual language from existing site.
2. **Upcoming Shows** — Card grid of confirmed tour dates (date, venue, city, ticket link, status badge). Placeholder content.
3. **Pricing Tiers / Packages** — 3 tiers (e.g. *Intimate Set*, *Club Show*, *Festival Headline*) with what's included, duration, indicative price range.
4. **Past Performances Gallery** — Masonry of past show photos/clips (placeholder thumbnails).
5. **Booking Inquiry Form** — Name, email, phone, event date, event type, venue/city, expected attendance, budget range, message. Zod-validated client + server side.
6. **FAQ** — Common questions (travel, rider, AV requirements, deposit).
7. **CTA footer** — Direct contact (email/social) for press.

### Backend

**New table `booking_inquiries`** with: name, email, phone, event_date, event_type, venue, city, expected_attendance, budget_range, message, status (`new`/`reviewing`/`confirmed`/`declined`), plus standard id/created_at/updated_at. RLS:
- Anyone can INSERT (public form)
- Only admins (existing `has_role` function) can SELECT / UPDATE / DELETE

**New table `tour_dates`** (so admin can manage upcoming shows later): event_date, venue, city, country, ticket_url, status, is_published, sort_order. RLS:
- Public can SELECT where `is_published = true`
- Admins can do everything
Seeded with 4–6 placeholder rows.

**Email notifications** via Lovable Emails:
- Set up email domain → infra → transactional scaffolding
- Two templates:
  - `booking-inquiry-received` → sent to inquirer (confirmation)
  - `booking-inquiry-admin-notification` → sent to founder/admin (new inquiry alert with details)
- Both triggered from the form submit via `send-transactional-email` with idempotency keys
- Admin recipient email = a constant in the trigger (will ask user to confirm address during build)

### Frontend technical

- `src/pages/Booking.tsx` — page composition
- `src/components/booking/HeroBooking.tsx`
- `src/components/booking/UpcomingShows.tsx` (fetches `tour_dates`)
- `src/components/booking/PricingTiers.tsx`
- `src/components/booking/PastPerformances.tsx`
- `src/components/booking/BookingForm.tsx` (react-hook-form + zod + shadcn form components)
- `src/components/booking/BookingFAQ.tsx`
- Route added in `src/App.tsx`
- Nav link added wherever main nav lives
- Styling uses existing semantic tokens (neon/HUD theme, glow shadows) — no new colors hardcoded
- Hover-audio handlers applied to any media cards (past performances) via existing `useHoverAudioHandlers`

### Out of scope (mention but don't build now)
- Admin dashboard to review inquiries / manage tour dates (can be added next)
- Payment / deposit collection
- Calendar integration

I'll need one detail at implementation time: the **admin email address** to receive new-inquiry notifications.
