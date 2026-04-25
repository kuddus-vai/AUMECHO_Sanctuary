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

function isoDurationToHuman(iso?: string) {
  if (!iso) return null;
  // PT1H12M34S → 1:12:34
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

function inferCategory(title: string, description: string): string {
  const t = `${title} ${description}`.toLowerCase();
  if (/(aarti|aarati|आरती)/.test(t)) return "aarti";
  if (/(mantra|chant|jaap|jaap|japa|मंत्र)/.test(t)) return "mantra";
  if (/(kirtan|कीर्तन)/.test(t)) return "kirtan";
  if (/(katha|pravachan|discourse|कथा)/.test(t)) return "katha";
  if (/(playlist|collection|jukebox)/.test(t)) return "playlist";
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

    // 2. Fetch latest playlist items (up to 50)
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsId}&key=${apiKey}`
    );
    const playlistData = await playlistRes.json();
    const items: PlaylistItem[] = playlistData?.items ?? [];

    if (items.length === 0) {
      return json({ inserted: 0, message: "No videos found." });
    }

    // 3. Hydrate stats + duration in a single videos.list call
    const ids = items.map((i) => i.snippet.resourceId.videoId).join(",");
    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${apiKey}`
    );
    const statsData = await statsRes.json();
    const statsMap = new Map<string, VideoStat>(
      (statsData?.items ?? []).map((v: VideoStat) => [v.id, v])
    );

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

      return {
        youtube_id: yid,
        title: item.snippet.title,
        description: item.snippet.description ?? null,
        thumbnail_url: thumb,
        published_at: item.snippet.publishedAt,
        category: inferCategory(item.snippet.title, item.snippet.description ?? ""),
        view_count: stat?.statistics?.viewCount
          ? parseInt(stat.statistics.viewCount, 10)
          : null,
        duration: isoDurationToHuman(stat?.contentDetails?.duration),
      };
    });

    // 5. Upsert
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { error: upsertErr } = await supabase
      .from("videos")
      .upsert(rows, { onConflict: "youtube_id" });

    if (upsertErr) {
      return json({ error: upsertErr.message }, 500);
    }

    // Mark the most recent video as featured
    const newest = rows[0];
    if (newest) {
      await supabase.from("videos").update({ is_featured: false }).neq("youtube_id", newest.youtube_id);
      await supabase
        .from("videos")
        .update({ is_featured: true })
        .eq("youtube_id", newest.youtube_id);
    }

    return json({ inserted: rows.length, featured: newest?.youtube_id });
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
