# AUMECHO — Official Web Platform

A cinematic, HUD-inspired web experience for the **AUMECHO** YouTube channel. Built to showcase the channel's signature playlists, shorts, and long-form archive in an immersive, futuristic interface that mirrors the brand's spiritual-meets-sci-fi identity.

> **Live preview:** auto-deployed via Lovable Cloud
> **Brand:** AUMECHO · Official Channel
> **Developed by:** [High Tech Enterprise](https://hightechenterprise.xyz)

---

## ✦ Overview

AUMECHO's web platform brings the channel to life with:

- **HUD Hero** — animated, mission-control style landing with smooth scroll cues
- **Sacred Series & Playlists** — branded shelves powered live by the YouTube Data API
- **Shorts Reel** — vertical, swipeable shorts gallery
- **Video Archive** — searchable long-form catalog with rich modal playback
- **Official Branding** — channel logo auto-synced into header, footer, and playlist pages

Every surface is themed through a strict design-token system (HSL semantic tokens) so the visual identity stays consistent across light/dark and every breakpoint.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18** + **Vite 5** + **TypeScript 5** |
| Styling | **Tailwind CSS v3** + custom HSL design tokens |
| UI Primitives | **shadcn/ui** (Radix UI) |
| Motion | **Framer Motion** |
| Data | **TanStack Query** |
| Backend | **Lovable Cloud** (Supabase: Postgres, Auth, Edge Functions, Storage) |
| External API | **YouTube Data API v3** (via Edge Functions) |
| Testing | **Vitest** + **Testing Library** |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (or **Bun** 1.0+)
- A Lovable Cloud / Supabase project (auto-provisioned in Lovable)

### Installation

```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd <PROJECT_DIRECTORY>

# Install dependencies
npm install
# or
bun install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

The `.env` file is auto-managed by Lovable Cloud and contains:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

Do **not** edit this file manually.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the codebase |
| `npm run test` | Run the Vitest suite |
| `npm run test:watch` | Run tests in watch mode |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Navigation, Footer, RootLayout
│   ├── sections/        # HeroHUD, PlaylistsShelf, ShortsShelf, VideoArchive, AboutSection
│   └── ui/              # Reusable UI primitives + shadcn components
├── hooks/               # useChannelInfo, usePlaylists, useVideos
├── integrations/        # Lovable Cloud (Supabase) client
├── lib/                 # Utilities, formatters, types
├── pages/               # Index, PlaylistDetail, NotFound
└── store/               # Global state (modal, etc.)

supabase/
└── functions/           # Edge functions: youtube-channel-info, sync-youtube-videos, fetch-playlist-items
```

---

## 🎨 Design System

All colors, gradients, and effects are defined as **HSL semantic tokens** in `src/index.css` and `tailwind.config.ts`. Components must consume tokens (e.g. `bg-background`, `text-primary`) rather than raw colors. This guarantees a coherent HUD aesthetic across the entire app.

---

## ☁️ Backend

The backend runs on **Lovable Cloud**, providing:

- **Postgres database** with Row-Level Security
- **Edge Functions** for YouTube API integration
- **Storage** for assets
- **Auth** ready for future authenticated experiences

Edge functions deploy automatically — no manual deployment required.

---

## 🧪 Testing

```bash
npm run test          # Single run
npm run test:watch    # Watch mode
```

Tests live alongside source files and in `src/test/`.

---

## 🤝 Contributing

This is a private brand project for AUMECHO. For collaboration inquiries, reach out via the contact details below.

---

## 📄 License

© AUMECHO. All rights reserved. The AUMECHO name, logo, and content are the property of their respective owner.

---

## 👨‍💻 Developed By

**[High Tech Enterprise](https://hightechenterprise.xyz)**
Crafting premium digital experiences.

🌐 [hightechenterprise.xyz](https://hightechenterprise.xyz)

---

<sub>Built with ❤️ on Lovable · Powered by Lovable Cloud</sub>
