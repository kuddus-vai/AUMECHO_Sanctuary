import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Playlist } from "@/lib/types";

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("playlists")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("item_count", { ascending: false });

      if (cancelled) return;
      setPlaylists((data ?? []) as Playlist[]);
      setLoading(false);
    }

    load();

    const channel = supabase.channel(`playlists-realtime-${Math.random().toString(36).slice(2)}`);
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "playlists" },
        () => load()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { playlists, loading };
}
