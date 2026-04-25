// Returns YouTube channel stats + recent community posts for the AUMECHO channel.
// Channel stats use the official Data API v3.
// Community posts are scraped from the public YouTube `/community` page because
// the Data API v3 does not expose community posts.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CHANNEL_HANDLE = "@AUMECHO";

interface ChannelStats {
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  title: string;
  thumbnail: string;
  channelId: string;
  customUrl: string;
}

interface CommunityPost {
  id: string;
  text: string;
  publishedTimeText: string;
  imageUrl?: string;
  likeCount?: string;
  commentCount?: string;
}

async function fetchChannelStats(apiKey: string, channelId: string): Promise<ChannelStats> {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.searchParams.set("part", "statistics,snippet");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`YouTube channels API failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const item = data.items?.[0];
  if (!item) throw new Error("Channel not found");

  return {
    subscriberCount: Number(item.statistics?.subscriberCount ?? 0),
    videoCount: Number(item.statistics?.videoCount ?? 0),
    viewCount: Number(item.statistics?.viewCount ?? 0),
    title: item.snippet?.title ?? "AUMECHO",
    thumbnail: item.snippet?.thumbnails?.default?.url ?? "",
    channelId: item.id,
    customUrl: item.snippet?.customUrl ?? CHANNEL_HANDLE,
  };
}

/**
 * Scrape the YouTube community page for recent posts.
 * Parses the `ytInitialData` JSON embedded in the HTML.
 */
async function fetchCommunityPosts(handle: string, limit = 50): Promise<CommunityPost[]> {
  const url = `https://www.youtube.com/${handle}/community`;
  const res = await fetch(url, {
    headers: {
      // Pretend to be a normal browser so YouTube serves the SSR HTML
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) {
    console.warn("Community page fetch failed", res.status);
    return [];
  }
  const html = await res.text();

  // Extract ytInitialData JSON
  const match = html.match(/var ytInitialData\s*=\s*(\{.*?\});<\/script>/s);
  if (!match) {
    console.warn("ytInitialData not found in community page");
    return [];
  }

  let initialData: any;
  try {
    initialData = JSON.parse(match[1]);
  } catch (e) {
    console.warn("Failed to parse ytInitialData", e);
    return [];
  }

  // Walk the data tree to find backstagePostThreadRenderer entries.
  const posts: CommunityPost[] = [];
  const visit = (node: any) => {
    if (!node || typeof node !== "object" || posts.length >= limit) return;
    if (node.backstagePostThreadRenderer?.post?.backstagePostRenderer) {
      const p = node.backstagePostThreadRenderer.post.backstagePostRenderer;
      const textRuns = p.contentText?.runs ?? [];
      const text = textRuns.map((r: any) => r.text ?? "").join("").trim();
      const publishedTimeText =
        p.publishedTimeText?.runs?.[0]?.text ??
        p.publishedTimeText?.simpleText ??
        "";
      const id = p.postId ?? "";
      // Image (if present)
      let imageUrl: string | undefined;
      const thumb =
        p.backstageAttachment?.backstageImageRenderer?.image?.thumbnails;
      if (Array.isArray(thumb) && thumb.length > 0) {
        imageUrl = thumb[thumb.length - 1].url;
      }
      const likeCount =
        p.actionButtons?.commentActionButtonsRenderer?.likeButton
          ?.toggleButtonRenderer?.defaultText?.simpleText ??
        p.voteCount?.simpleText ??
        undefined;
      const commentCount =
        p.actionButtons?.commentActionButtonsRenderer?.replyButton
          ?.buttonRenderer?.text?.simpleText ?? undefined;
      if (text || imageUrl) {
        posts.push({
          id,
          text,
          publishedTimeText,
          imageUrl,
          likeCount,
          commentCount,
        });
      }
      return;
    }
    if (Array.isArray(node)) {
      for (const v of node) visit(v);
    } else {
      for (const k in node) visit(node[k]);
    }
  };
  visit(initialData);

  return posts.slice(0, limit);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    const channelId = Deno.env.get("YOUTUBE_CHANNEL_ID");
    if (!apiKey) throw new Error("YOUTUBE_API_KEY not configured");
    if (!channelId) throw new Error("YOUTUBE_CHANNEL_ID not configured");

    const [stats, posts] = await Promise.all([
      fetchChannelStats(apiKey, channelId),
      fetchCommunityPosts(CHANNEL_HANDLE, 50).catch((e) => {
        console.warn("Community posts failed:", e);
        return [] as CommunityPost[];
      }),
    ]);

    return new Response(
      JSON.stringify({
        stats,
        posts,
        handle: CHANNEL_HANDLE,
        subscribeUrl: `https://www.youtube.com/${CHANNEL_HANDLE}?sub_confirmation=1`,
        fetchedAt: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Cache at the edge for 5 minutes
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("youtube-channel-info error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
