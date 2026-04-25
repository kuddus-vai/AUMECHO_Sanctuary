# AUMECHO — Digital Sanctuary

A full-bleed, "Living HUD" experience for a YouTube-centric lofi/atmospheric music label. Built as one cohesive pass across all 10 phases of the spec.

## What the user will experience

**A single immersive landing experience** with these zones, scrolled top-to-bottom:

1. **Custom cursor** — desktop only. Two layers: a zero-lag white dot, and a trailing cyan ring (spring-eased) that morphs to a "PLAY" label over video tiles, expands over buttons/links, and falls back to the native cursor on touch devices and for users with `prefers-reduced-motion`.

2. **Top navigation** — fixed, glassmorphic, 64px. Pulsing cyan status dot + "AUMECHO" wordmark. Right-side mono nav links (Archive · About · YouTube). Mobile: full-screen staggered overlay menu.

3. **Hero "Living HUD"** — the design centerpiece. Full-viewport, divided into:
   - Top status bar (LIVE indicator · "AUMECHO SANCTUARY // ATMOSPHERIC SIGNAL ACTIVE" · live HH:MM:SS clock)
   - Left panel: animated 8-bar frequency visualizer + terminal-style readouts (SIGNAL/CLARITY/RESONANCE) + drifting coordinates
   - Center: glassmorphic "Now Playing / Featured" card with the featured video thumbnail, play overlay, category pill, title, date — opens the video modal
   - Right panel: 4 most recent transmissions with hover slide + cyan border accent
   - Bottom marquee ticker
   - Backdrop: the featured thumbnail desaturated/blurred, plus the nebula radial gradient and noise overlay
   - Entrance: staggered blur+rise reveal across panels

4. **Bento Video Archive** — labeled "SIGNAL.ARCHIVE / All Transmissions". Category filter pills (ALL · LOFI · AMBIENT · MIX · PLAYLIST) with animated filtering via AnimatePresence. 12-column bento grid with a repeating size pattern (large/medium/wide/panoramic) so the grid feels editorial, not uniform. Cards: scale-on-hover thumbnail, breathing cyan border, fade-in PLAY overlay, gradient-mask title block. Skeleton shimmer while loading.

5. **Aether Video Modal** — opens via React Portal. Full-screen blurred backdrop, glassmorphic player container, top bar (category + title + Focus / Open-on-YouTube / Close icons), 16:9 YouTube embed with autoplay, bottom info bar (description with read-more, formatted date, view count, YouTube/Spotify/Apple Music pill links with branded hover tints). **Focus Mode** hides the chrome and darkens the backdrop for pure-video viewing. ESC closes; click-outside closes.

6. **About section** — split layout: large low-weight statement on the left, glassmorphic stat panel on the right with counters that animate from 0 to value when scrolled into view. CTA: "SUBSCRIBE ON YOUTUBE" with magnetic hover and arrow.

7. **Footer** — minimal, mono, three social glyphs with cyan glow on hover, "Built with intention." tag.

8. **Page transitions** — even though this is a single primary page, the route shell uses the "Liquid Wash" transition (frosted-glass curtain sweeping L→R then off R→∞) so future routes inherit it, plus per-section in-view reveals throughout.

## Data + backend

- **Lovable Cloud** (built-in Supabase) — no external account.
- A `videos` table with the exact schema from the spec (youtube_id, title, description, thumbnail_url, published_at, category enum, view_count, duration, is_featured), public-read RLS, indexes on `published_at` and `is_featured`.
- A `useVideos` hook that fetches all videos and subscribes to realtime changes so new uploads appear without refresh.
- A **YouTube sync edge function** (`sync-youtube-videos`) that uses the YouTube Data API v3 to fetch the channel's uploads playlist, upserts rows into `videos`. It reads `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` from edge-function secrets. After deploy I'll prompt you for both values.
- A small admin trigger button (hidden, dev-only) to invoke the sync on demand. The site loads instantly from the DB regardless.

## Visual system

- Tailwind extended with the full token set from the spec: `void`, `surface`, `glass`, `border-glow`, `cyan` family, `ghost`, `pure`; mono + sans families; `tracking-hud`; nebula and glow gradients; `glow-sm/md/lg` shadows; float/scan/noise-shift keyframes.
- Inter + JetBrains Mono via Google Fonts.
- A noise overlay pinned at `#root::before` (z-9999, pointer-events-none) using a generated SVG-filter texture so we don't depend on a binary asset.
- Global cursor hidden on desktop pointer devices only.
- Custom scrollbar, cyan text-selection, smooth scroll.

## Micro-interaction standards (applied universally)

- 1px borders everywhere; cubic-bezier eases (no linear); `whileTap` scale 0.97 on all interactive surfaces.
- Magnetic hover on primary CTAs.
- Border "breathing" on glass cards (white/7 → cyan/25, 400ms).
- Image load: blur+scale → sharp on `onLoad`.
- Reserved aspect ratios on every thumbnail to eliminate layout shift.
- Visible cyan focus rings on all focusable elements.
- `useReducedMotion` short-circuits non-essential animation.

## Technical notes (for reference)

```
src/
├── lib/                 supabase client, youtube helper, cn()
├── hooks/               useVideos, useCursor, useReducedMotion wrapper
├── store/               modalStore (Context: activeVideo, focusMode)
├── components/
│   ├── ui/              CustomCursor, GlassCard, HudLabel, VideoCard,
│   │                    SkeletonCard, VideoModal, PageTransition,
│   │                    MagneticButton
│   ├── layout/          RootLayout, Navigation, Footer
│   └── sections/        HeroHUD, VideoArchive, AboutSection
├── pages/Index.tsx      Composes the sections
└── index.css            Tokens, fonts, noise overlay, cursor reset

supabase/
├── migrations/…         videos table + RLS + indexes
└── functions/sync-youtube-videos/index.ts
```

- Framer Motion is the sole animation engine; no GSAP.
- All thumbnails use fixed aspect-ratio wrappers.
- The custom cursor mounts above all routes, but is gated by a pointer-fine media query so it disappears on touch and respects reduced motion.
- The video modal is portaled to `document.body` so it escapes any stacking context.

## What I'll need from you after the build

After deploy I'll prompt for:
1. **YouTube Data API v3 key** (from Google Cloud Console → APIs & Services)
2. **AUMECHO YouTube channel ID** (the `UC…` string from the channel URL)

Then I'll trigger the sync once and the archive will populate with real videos.
