// Fetches the items of a single YouTube playlist, hydrated with stats + duration.
// Used by the in-app playlist detail page so users never have to leave the site.
//
// Required secrets (set via Lovable Cloud → Edge Function Secrets):
//   - YOUTUBE_API_KEY

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface PlaylistItem {
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    position?: number;
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
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      return json({ error: "YOUTUBE_API_KEY is not configured." }, 500);
    }

    const url = new URL(req.url);
    let playlistId = url.searchParams.get("playlistId");
    if (!playlistId && req.method === "POST") {
      try {
        const body = await req.json();
        playlistId = body?.playlistId ?? null;
      } catch {
        // ignore
      }
    }
    if (!playlistId) {
      return json({ error: "Missing 'playlistId' query/body parameter." }, 400);
    }

    // 1. Paginate playlist items
    const items: PlaylistItem[] = [];
    let pageToken: string | undefined = undefined;
    do {
      const u = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      u.searchParams.set("part", "snippet");
      u.searchParams.set("maxResults", "50");
      u.searchParams.set("playlistId", playlistId);
      u.searchParams.set("key", apiKey);
      if (pageToken) u.searchParams.set("pageToken", pageToken);

      const res = await fetch(u.toString());
      const data = await res.json();
      if (!res.ok) {
        return json(
          { error: data?.error?.message ?? "YouTube API error", details: data },
          res.status
        );
      }
      const pageItems: PlaylistItem[] = data?.items ?? [];
      items.push(...pageItems);
      pageToken = data?.nextPageToken;
    } while (pageToken);

    if (items.length === 0) {
      return json({ items: [] });
    }

    // 2. Hydrate stats + duration in batches of 50
    const statsMap = new Map<string, VideoStat>();
    for (let i = 0; i < items.length; i += 50) {
      const batch = items.slice(i, i + 50);
      const ids = batch.map((it) => it.snippet.resourceId.videoId).join(",");
      const sRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${apiKey}`
      );
      const sData = await sRes.json();
      for (const v of (sData?.items ?? []) as VideoStat[]) {
        statsMap.set(v.id, v);
      }
    }

    // 3. Build response (preserve playlist order = oldest → newest as saved)
    const out = items.map((it) => {
      const yid = it.snippet.resourceId.videoId;
      const stat = statsMap.get(yid);
      const thumbs = it.snippet.thumbnails ?? {};
      const thumb =
        thumbs.maxres?.url ||
        thumbs.high?.url ||
        thumbs.medium?.url ||
        thumbs.default?.url ||
        `https://i.ytimg.com/vi/${yid}/hqdefault.jpg`;
      const seconds = isoDurationToSeconds(stat?.contentDetails?.duration);
      return {
        position: it.snippet.position ?? 0,
        youtube_id: yid,
        title: it.snippet.title,
        description: it.snippet.description ?? null,
        thumbnail_url: thumb,
        published_at: it.snippet.publishedAt,
        view_count: stat?.statistics?.viewCount
          ? parseInt(stat.statistics.viewCount, 10)
          : null,
        duration: secondsToHuman(seconds),
        duration_seconds: seconds,
      };
    });

    return json({ items: out });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500
    );
  }
});
