## Goal

Add three SEO/growth-focused pages — **Blog**, **Community**, **FAQ** — fully linked from the main navigation, with proper meta tags, semantic HTML, and structured data for search visibility.

## Pages

### 1. Blog (`/blog` and `/blog/:slug`)
- **Index page** — grid of post cards (cover, title, excerpt, date, tag), latest first
- **Post detail** — long-form article with cover, title, author, date, rendered markdown body, tags, share buttons, "back to blog" link
- **Admin editor** (`/admin/blog`) — protected route to create/edit/delete posts (markdown body, cover image URL, tags, publish toggle)

### 2. Community (`/community`)
Static-content page promoting where to engage:
- Hero with "Join the AUMECHO community" CTA
- Tiles for YouTube subscribe, Discord (placeholder link), Instagram, Twitter/X, Spotify, Apple Music
- "Submit your lofi" / collab CTA section
- Newsletter signup (stored in DB — `subscribers` table)

### 3. FAQ (`/faq`)
Accordion of common questions (what is AUMECHO, music licensing/usage, how to submit, where to listen, collab requests, copyright). Includes **FAQPage JSON-LD** for rich Google snippets.

## Database (Lovable Cloud)

New tables via migration:

```text
blog_posts
  id uuid pk, slug text unique, title text, excerpt text,
  cover_url text, body_md text, tags text[],
  published boolean default false, published_at timestamptz,
  created_at, updated_at

subscribers
  id uuid pk, email text unique, created_at

user_roles  (standard pattern)
  id, user_id (auth.users), role app_role enum('admin','user')
  + has_role(uuid, app_role) security-definer function
```

**RLS:**
- `blog_posts`: public SELECT where `published = true`; admin-only INSERT/UPDATE/DELETE via `has_role(auth.uid(),'admin')`
- `subscribers`: public INSERT (anyone can subscribe), admin-only SELECT
- `user_roles`: user reads own roles, admin manages all

## Auth
- Email/password sign-in at `/auth` (sign-up disabled UI side; admin seeded manually)
- Auto-confirm enabled so the seeded admin can log in immediately
- `/admin/blog` wrapped in route guard checking `has_role(uid,'admin')`

## SEO

- Add **react-helmet-async** for per-route `<title>`, meta description, OG/Twitter cards, canonical URLs
- Article JSON-LD on blog posts; FAQPage JSON-LD on `/faq`
- Generate `public/sitemap.xml` build-time stub + dynamic client sitemap link in footer
- Update `public/robots.txt` to allow all and reference sitemap
- Semantic `<article>`, `<nav>`, `<main>` landmarks; descriptive alt text

## Navigation
- Add Blog, Community, FAQ links to `Navigation.tsx` (desktop + mobile)
- Add same links to `Footer.tsx` under a "Explore" column

## Files to create

```text
src/pages/Blog.tsx
src/pages/BlogPost.tsx
src/pages/Community.tsx
src/pages/FAQ.tsx
src/pages/Auth.tsx
src/pages/admin/BlogAdmin.tsx
src/pages/admin/BlogEditor.tsx
src/components/seo/SEO.tsx          (Helmet wrapper)
src/components/blog/PostCard.tsx
src/components/blog/MarkdownView.tsx
src/components/auth/RequireAdmin.tsx
src/hooks/useBlogPosts.ts
src/hooks/useAuth.ts
```

## Files to edit
- `src/App.tsx` — add routes + HelmetProvider
- `src/components/layout/Navigation.tsx` — new links
- `src/components/layout/Footer.tsx` — new links
- `index.html` — base SEO defaults
- `public/robots.txt` — sitemap reference

## Dependencies
- `react-helmet-async`, `react-markdown`, `remark-gfm`

## Out of scope (this round)
- Comments on blog posts
- Image uploads (cover URLs entered as text for now; storage bucket can be added later)
- Server-rendered SEO (Vite SPA — meta tags injected client-side; acceptable for Google but mention if pre-rendering needed later)

After approval I'll run the migration, scaffold the pages, wire routes, and seed one example blog post + FAQ items so the pages aren't empty on first load.