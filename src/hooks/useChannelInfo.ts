import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ChannelStats {
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  title: string;
  thumbnail: string;
  channelId: string;
  customUrl: string;
}

export interface CommunityPost {
  id: string;
  text: string;
  publishedTimeText: string;
  imageUrl?: string;
  likeCount?: string;
  commentCount?: string;
}

export interface ChannelInfo {
  stats: ChannelStats | null;
  posts: CommunityPost[];
  subscribeUrl: string;
  handle: string;
  loading: boolean;
  error: string | null;
}

const SUBSCRIBE_URL = "https://www.youtube.com/@AUMECHO?sub_confirmation=1";

export function useChannelInfo(): ChannelInfo {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase.functions.invoke(
          "youtube-channel-info",
          { method: "GET" },
        );
        if (cancelled) return;
        if (error) throw error;
        setStats(data?.stats ?? null);
        setPosts(data?.posts ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    // Refresh every 5 minutes — channel stats / community posts update slowly
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return {
    stats,
    posts,
    loading,
    error,
    subscribeUrl: SUBSCRIBE_URL,
    handle: "@AUMECHO",
  };
}
