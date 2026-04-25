export type VideoCategory =
  | "bhajan"
  | "mantra"
  | "aarti"
  | "kirtan"
  | "katha"
  | "gita"
  | "playlist"
  | "shorts";

export type Video = {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  published_at: string;
  category: VideoCategory;
  view_count: number | null;
  duration: string | null;
  duration_seconds: number | null;
  is_featured: boolean;
  is_short: boolean;
};

export type Playlist = {
  id: string;
  youtube_playlist_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  item_count: number;
  published_at: string;
  is_featured: boolean;
};
