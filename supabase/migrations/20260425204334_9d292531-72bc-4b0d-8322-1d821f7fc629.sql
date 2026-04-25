CREATE TABLE IF NOT EXISTS public.videos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id    TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT NOT NULL,
  published_at  TIMESTAMPTZ NOT NULL,
  category      TEXT NOT NULL DEFAULT 'lofi'
                CHECK (category IN ('lofi','ambient','mix','playlist')),
  view_count    BIGINT,
  duration      TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON public.videos FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_videos_published_at
  ON public.videos (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_is_featured
  ON public.videos (is_featured)
  WHERE is_featured = true;

-- Seed with a handful of placeholder rows so the UI has data immediately
INSERT INTO public.videos (youtube_id, title, description, thumbnail_url, published_at, category, view_count, duration, is_featured)
VALUES
  ('jfKfPfyJRdk', 'lofi hip hop radio - beats to relax/study to', 'Atmospheric lofi transmissions for late night focus and quiet study sessions.', 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg', NOW() - INTERVAL '1 day',  'lofi',     2400000, '∞',     true),
  ('5qap5aO4i9A', 'Midnight Cassette // Side A', 'A deep dive into hazy tape-warped textures. Drift slow.',                            'https://i.ytimg.com/vi/5qap5aO4i9A/maxresdefault.jpg', NOW() - INTERVAL '4 days', 'ambient',   894000, '52:14', false),
  ('DWcJFNfaw9c', 'Neon Rainfall — Atmospheric Mix Vol. III',  'Slow synths, warm rain, 3am cities.',                                     'https://i.ytimg.com/vi/DWcJFNfaw9c/maxresdefault.jpg', NOW() - INTERVAL '9 days', 'mix',      1230000, '1:12:08', false),
  ('rUxyKA_-grg', 'Signal Drift // Lofi Study Set',            'Continuous study transmission. No interruptions.',                        'https://i.ytimg.com/vi/rUxyKA_-grg/maxresdefault.jpg', NOW() - INTERVAL '14 days','lofi',      572000, '2:04:20', false),
  ('Dx5qFachd3A', 'Aether Frequencies — Ambient Bloom',        'Choral pads, distant percussion, the sound of empty rooms.',              'https://i.ytimg.com/vi/Dx5qFachd3A/maxresdefault.jpg', NOW() - INTERVAL '21 days','ambient',   341000, '38:51', false),
  ('lTRiuFIWV54', 'Sanctuary Playlist // Slow Hours',          'A curated walk-through of the slowest tracks in the archive.',            'https://i.ytimg.com/vi/lTRiuFIWV54/maxresdefault.jpg', NOW() - INTERVAL '28 days','playlist',  198000, '46:33', false),
  ('7NOSDKb0HlU', 'Quiet City — Lofi for Empty Streets',       'Recorded at 3:42am in a city that does not exist.',                       'https://i.ytimg.com/vi/7NOSDKb0HlU/maxresdefault.jpg', NOW() - INTERVAL '40 days','lofi',      812000, '1:01:15', false),
  ('MVPTGNGiI-4', 'Glass Architecture // Ambient Set',         'For long working sessions when the world feels far away.',                'https://i.ytimg.com/vi/MVPTGNGiI-4/maxresdefault.jpg', NOW() - INTERVAL '55 days','ambient',   267000, '57:02', false),
  ('n61ULEU7CO0', 'Blue Hour Mix // Vol. II',                  'The sound of dusk in eight movements.',                                   'https://i.ytimg.com/vi/n61ULEU7CO0/maxresdefault.jpg', NOW() - INTERVAL '70 days','mix',       456000, '1:24:10', false),
  ('4xDzrJKXOOY', 'Slow Rotation — Late Night Playlist',       'Hand-picked transmissions for the quiet hours.',                          'https://i.ytimg.com/vi/4xDzrJKXOOY/maxresdefault.jpg', NOW() - INTERVAL '90 days','playlist',  389000, '52:18', false),
  ('UedTcufyrHc', 'Dust & Tape — Lofi Sessions',                'Crackle, warmth, and the comfort of analog imperfection.',               'https://i.ytimg.com/vi/UedTcufyrHc/maxresdefault.jpg', NOW() - INTERVAL '110 days','lofi',     623000, '48:42', false),
  ('zhDwjnYZiCo', 'Cathedral of Air — Ambient Mix',             'Vast, slow, reverent.',                                                  'https://i.ytimg.com/vi/zhDwjnYZiCo/maxresdefault.jpg', NOW() - INTERVAL '130 days','ambient',  178000, '1:08:30', false)
ON CONFLICT (youtube_id) DO NOTHING;