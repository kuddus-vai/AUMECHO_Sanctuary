export type VideoCategory = "lofi" | "ambient" | "mix" | "playlist";

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
  is_featured: boolean;
};
