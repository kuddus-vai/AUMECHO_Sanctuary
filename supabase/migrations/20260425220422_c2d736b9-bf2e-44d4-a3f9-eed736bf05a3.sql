ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS is_short boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_playlist_id text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  thumbnail_url text NOT NULL,
  item_count integer NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON public.playlists
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_videos_is_short ON public.videos(is_short);
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category);