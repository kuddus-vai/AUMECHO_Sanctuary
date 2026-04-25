// Lovable-managed edge function: sync-youtube-videos
// Pulls the latest uploads from the AUMECHO YouTube channel into the videos table.
//
// Required secrets (set via Lovable Cloud → Edge Function Secrets):
//   - YOUTUBE_API_KEY
//   - YOUTUBE_CHANNEL_ID  (a UC... channel ID)
//
// Auth note: this function is invokable without a user JWT. It only writes to
// the public.videos table using the service role to bypass RLS.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PlaylistItem {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    resourceId: { videoId: string };
    thumbnails?: Record<string, { url: string }>;
  };
}

interface VideoStat {
  id: string;
  statistics?: { viewCount?: string };
  contentDetails?: { duration?: string };
}

function isoDurationToSeconds(iso?: string): number | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  return h * 3600 + m * 60 + s;
}

function secondsToHuman(total: number | null): string | null {
  if (total === null) return null;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

function inferCategory(title: string, description: string): string {
  const t = `${title} ${description}`.toLowerCase();
  if (/(gita|गीता|geeta)/.test(t)) return "gita";
  if (/(aarti|aarati|आरती)/.test(t)) return "aarti";
  if (/(mantra|chant|jaap|japa|मंत्र|stotra|stotram|sloka|shloka)/.test(t)) return "mantra";
  if (/(kirtan|कीर्तन)/.test(t)) return "kirtan";
  if (/(katha|pravachan|discourse|कथा|story)/.test(t)) return "katha";
  return "bhajan";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    const channelId = Deno.env.get("YOUTUBE_CHANNEL_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!apiKey || !channelId) {
      return json(
        {
          error:
            "Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID. Add them in Lovable Cloud → Edge Function Secrets.",
        },
        400
      );
    }
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Supabase environment is not configured." }, 500);
    }

    // 1. Resolve uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    );
    const channelData = await channelRes.json();
    const uploadsId =
      channelData?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) {
      return json(
        { error: "Could not resolve uploads playlist for that channel ID.", channelData },
        404
      );
    }

    // 2. Fetch ALL playlist items (paginate through every page)
    const items: PlaylistItem[] = [];
    let pageToken: string | undefined = undefined;
    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      url.searchParams.set("part", "snippet");
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("playlistId", uploadsId);
      url.searchParams.set("key", apiKey);
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const playlistRes = await fetch(url.toString());
      const playlistData = await playlistRes.json();
      const pageItems: PlaylistItem[] = playlistData?.items ?? [];
      items.push(...pageItems);
      pageToken = playlistData?.nextPageToken;
    } while (pageToken);

    if (items.length === 0) {
      return json({ inserted: 0, message: "No videos found." });
    }

    // 3. Hydrate stats + duration (videos.list accepts max 50 IDs per call)
    const statsMap = new Map<string, VideoStat>();
    for (let i = 0; i < items.length; i += 50) {
      const batch = items.slice(i, i + 50);
      const ids = batch.map((it) => it.snippet.resourceId.videoId).join(",");
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${apiKey}`
      );
      const statsData = await statsRes.json();
      for (const v of (statsData?.items ?? []) as VideoStat[]) {
        statsMap.set(v.id, v);
      }
    }

    // 4. Build rows
    const rows = items.map((item) => {
      const yid = item.snippet.resourceId.videoId;
      const stat = statsMap.get(yid);
      const thumbs = item.snippet.thumbnails ?? {};
      const thumb =
        thumbs.maxres?.url ||
        thumbs.high?.url ||
        thumbs.medium?.url ||
        thumbs.default?.url ||
        `https://i.ytimg.com/vi/${yid}/hqdefault.jpg`;

      const seconds = isoDurationToSeconds(stat?.contentDetails?.duration);
      // YouTube Shorts are vertical videos <=60 seconds
      const isShort = seconds !== null && seconds > 0 && seconds <= 60;

      return {
        youtube_id: yid,
        title: item.snippet.title,
        description: item.snippet.description ?? null,
        thumbnail_url: thumb,
        published_at: item.snippet.publishedAt,
        category: isShort ? "shorts" : inferCategory(item.snippet.title, item.snippet.description ?? ""),
        view_count: stat?.statistics?.viewCount
          ? parseInt(stat.statistics.viewCount, 10)
          : null,
        duration: secondsToHuman(seconds),
        duration_seconds: seconds,
        is_short: isShort,
      };
    });

    // 5. Upsert videos
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { error: upsertErr } = await supabase
      .from("videos")
      .upsert(rows, { onConflict: "youtube_id" });

    if (upsertErr) {
      return json({ error: upsertErr.message }, 500);
    }

    // 6. Sync playlists from the channel
    const playlistRows: Array<Record<string, unknown>> = [];
    let plToken: string | undefined = undefined;
    do {
      const url = new URL("https://www.googleapis.com/youtube/v3/playlists");
      url.searchParams.set("part", "snippet,contentDetails");
      url.searchParams.set("channelId", channelId);
      url.searchParams.set("maxResults", "50");
      url.searchParams.set("key", apiKey);
      if (plToken) url.searchParams.set("pageToken", plToken);

      const plRes = await fetch(url.toString());
      const plData = await plRes.json();
      for (const pl of (plData?.items ?? []) as Array<{
        id: string;
        snippet: { title: string; description?: string; publishedAt: string; thumbnails?: Record<string, { url: string }> };
        contentDetails?: { itemCount?: number };
      }>) {
        const t = pl.snippet.thumbnails ?? {};
        const thumb =
          t.maxres?.url || t.high?.url || t.medium?.url || t.default?.url ||
          `https://i.ytimg.com/vi/default.jpg`;
        playlistRows.push({
          youtube_playlist_id: pl.id,
          title: pl.snippet.title,
          description: pl.snippet.description ?? null,
          thumbnail_url: thumb,
          item_count: pl.contentDetails?.itemCount ?? 0,
          published_at: pl.snippet.publishedAt,
        });
      }
      plToken = plData?.nextPageToken;
    } while (plToken);

    if (playlistRows.length > 0) {
      await supabase
        .from("playlists")
        .upsert(playlistRows, { onConflict: "youtube_playlist_id" });

      // Feature the Gita playlist if present, otherwise the largest playlist
      const gita = playlistRows.find((p) =>
        /gita|गीता|geeta/i.test(String(p.title))
      );
      const featured = gita ?? [...playlistRows].sort(
        (a, b) => (Number(b.item_count) || 0) - (Number(a.item_count) || 0)
      )[0];
      if (featured) {
        await supabase.from("playlists").update({ is_featured: false }).neq("youtube_playlist_id", featured.youtube_playlist_id);
        await supabase.from("playlists").update({ is_featured: true }).eq("youtube_playlist_id", featured.youtube_playlist_id);
      }
    }

    // Mark the most recent long-form video as featured
    const newest = rows.find((r) => !r.is_short) ?? rows[0];
    if (newest) {
      await supabase.from("videos").update({ is_featured: false }).neq("youtube_id", newest.youtube_id);
      await supabase
        .from("videos")
        .update({ is_featured: true })
        .eq("youtube_id", newest.youtube_id);
    }

    return json({
      videos_inserted: rows.length,
      shorts: rows.filter((r) => r.is_short).length,
      playlists_inserted: playlistRows.length,
      featured_video: newest?.youtube_id,
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
