import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/lib/types";

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("published_at", { ascending: false });

      if (cancelled) return;
      if (error) setError(error.message);
      else setVideos((data ?? []) as Video[]);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel("videos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { videos, loading, error };
}
