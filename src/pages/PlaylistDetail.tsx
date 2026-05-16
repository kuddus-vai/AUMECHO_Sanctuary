import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, ListMusic, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useModal } from "@/store/modalStore";
import { useHoverAudioHandlers } from "@/components/audio/HoverAudioProvider";
import { usePlaylists } from "@/hooks/usePlaylists";
import { useChannelInfo } from "@/hooks/useChannelInfo";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { HudLabel } from "@/components/ui/HudLabel";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { formatDateDDMMYYYY, formatViewCount } from "@/lib/format";
import type { Video } from "@/lib/types";

type ItemRow = {
  position: number;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string;
  published_at: string;
  view_count: number | null;
  duration: string | null;
  duration_seconds: number | null;
};

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { playlists } = usePlaylists();
  const { stats: channelStats } = useChannelInfo();
  const { openModal } = useModal();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const playlist = useMemo(
    () => playlists.find((p) => p.youtube_playlist_id === id),
    [playlists, id]
  );

  const isGita = useMemo(
    () => (playlist ? /gita|गीता|geeta/i.test(playlist.title) : false),
    [playlist]
  );

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const { data, error } = await supabase.functions.invoke(
        "fetch-playlist-items",
        { body: { playlistId: id } }
      );
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        const list = (data?.items ?? []) as ItemRow[];
        // Gita: oldest → newest (sort by position ascending which IS the playlist order).
        // Other playlists: also use the playlist's saved order.
        list.sort((a, b) => a.position - b.position);
        setItems(list);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const playItem = (it: ItemRow) => {
    // Open in the existing on-site VideoModal — never leave the site
    const video: Video = {
      id: it.youtube_id,
      youtube_id: it.youtube_id,
      title: it.title,
      description: it.description,
      thumbnail_url: it.thumbnail_url,
      published_at: it.published_at,
      category: "playlist",
      view_count: it.view_count,
      duration: it.duration,
      duration_seconds: it.duration_seconds,
      is_featured: false,
      is_short: false,
    };
    openModal(video);
  };

  return (
    <RootLayout>
      <SEO
        title={playlist ? `${playlist.title} — AumEcho Series` : "AumEcho Series"}
        description={
          playlist?.description?.slice(0, 160) ||
          `Listen to ${playlist?.title ?? "this AumEcho series"} — Sanskrit mantras and Vedic chants curated for meditation and bhakti.`
        }
        canonical={`https://aumecho.hightechenterprise.xyz/playlists/${id}`}
        image={playlist?.thumbnail_url ?? undefined}
        type="article"
        jsonLd={
          playlist
            ? {
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: playlist.title,
                numberOfItems: items.length || playlist.item_count,
                itemListElement: items.slice(0, 25).map((it) => ({
                  "@type": "ListItem",
                  position: it.position + 1,
                  name: it.title,
                  url: `https://www.youtube.com/watch?v=${it.youtube_id}`,
                })),
              }
            : undefined
        }
      />
      <div className="pt-8">
        {/* Header / hero */}
        <section className="relative mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/#playlists"
            data-cursor="link"
            className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] tracking-hud text-ghost transition-colors hover:text-cyan"
          >
            <ArrowLeft size={12} />
            BACK TO ALL SERIES
          </Link>

          {!playlist ? (
            <div className="space-y-4">
              <div className="h-6 w-48 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
              <div className="h-12 w-2/3 animate-pulse rounded bg-[rgba(255,255,255,0.05)]" />
            </div>
          ) : (
            <motion.div
              
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-6 lg:grid-cols-[1.1fr_1fr]"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-[rgba(0,242,255,0.18)] bg-gradient-to-br from-[rgba(0,242,255,0.08)] via-surface to-[rgba(5,5,7,0.95)]">
                {/* Soft halo */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 45%, rgba(0,242,255,0.18) 0%, rgba(0,242,255,0.05) 35%, transparent 70%)",
                  }}
                />
                {/* HUD corners */}
                <span aria-hidden className="pointer-events-none absolute left-3 top-3 h-3 w-3 border-l border-t border-cyan/60" />
                <span aria-hidden className="pointer-events-none absolute right-3 top-3 h-3 w-3 rotate-90 border-l border-t border-cyan/60" />
                <span aria-hidden className="pointer-events-none absolute right-3 bottom-3 h-3 w-3 rotate-180 border-l border-t border-cyan/60" />
                <span aria-hidden className="pointer-events-none absolute left-3 bottom-3 h-3 w-3 -rotate-90 border-l border-t border-cyan/60" />

                {/* Official channel logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {channelStats?.thumbnail ? (
                    <img
                      src={channelStats.thumbnail}
                      alt={`${channelStats.title || "AUMECHO"} channel logo`}
                      className="h-[58%] w-auto rounded-full border border-[rgba(0,242,255,0.35)] shadow-[0_0_60px_rgba(0,242,255,0.35)]"
                    />
                  ) : (
                    <div className="h-[58%] aspect-square animate-pulse rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]" />
                  )}
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <span className="font-mono text-[9px] uppercase tracking-hud text-slate">
                    AUMECHO · OFFICIAL CHANNEL
                  </span>
                </div>

                {isGita && (
                  <div className="absolute left-5 top-5">
                    <span className="rounded-full border border-[rgba(0,242,255,0.5)] bg-[rgba(0,242,255,0.15)] px-3 py-1 font-mono text-[9px] uppercase tracking-hud text-cyan">
                      ✦ Signature Series
                    </span>
                  </div>
                )}
              </div>


              <div className="flex flex-col justify-center gap-5">
                <HudLabel className="text-[10px] text-cyan">
                  <ListMusic size={10} className="mr-1.5 inline" />
                  {playlist.item_count} EPISODES
                </HudLabel>
                <h1 className="text-3xl font-semibold tracking-tighter text-pure sm:text-4xl lg:text-5xl">
                  {playlist.title}
                </h1>
                {playlist.description && (
                  <p className="line-clamp-4 text-sm text-ghost sm:text-[15px]">
                    {playlist.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {items.length > 0 && (
                    <button
                      data-cursor="video"
                      onClick={() => playItem(items[0])}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,242,255,0.5)] bg-[rgba(0,242,255,0.12)] px-5 py-2.5 font-mono text-[11px] tracking-hud text-cyan transition-all duration-300 hover:bg-[rgba(0,242,255,0.2)] hover:shadow-glow-sm"
                    >
                      <Play size={12} fill="currentColor" />
                      {isGita ? "PLAY FROM EPISODE 1" : "PLAY FIRST"}
                    </button>
                  )}
                  <a
                    data-cursor="link"
                    href={`https://www.youtube.com/playlist?list=${playlist.youtube_playlist_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-2.5 font-mono text-[10px] tracking-hud text-ghost transition-colors hover:text-pure hover:border-[rgba(255,0,0,0.4)]"
                  >
                    OPEN ON YOUTUBE <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Episode list */}
        <section className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <HudLabel className="text-[10px]">SIGNAL.EPISODES</HudLabel>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
            {!loading && (
              <span className="font-mono text-[10px] tracking-hud text-slate">
                {items.length} ITEMS
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} className="h-[220px]" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-dashed border-[rgba(255,0,0,0.3)] bg-[rgba(255,0,0,0.04)] p-6 font-mono text-[11px] text-pure">
              FAILED TO LOAD PLAYLIST: {error}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] font-mono text-[10px] tracking-hud text-slate">
              NO EPISODES FOUND
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((it, i) => (
                <EpisodeCard key={it.youtube_id} it={it} i={i} onPlay={() => playItem(it)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </RootLayout>
  );
};

function EpisodeCard({ it, i, onPlay }: { it: ItemRow; i: number; onPlay: () => void }) {
  const hover = useHoverAudioHandlers({
    id: it.youtube_id,
    kind: "video",
    title: it.title,
    thumbnail: it.thumbnail_url,
  });
  return (
    <motion.button
      data-cursor="video"
      onClick={onPlay}
      {...hover}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-[220px] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.07)] bg-surface text-left transition-[border-color,box-shadow] duration-300 hover:border-[rgba(0,242,255,0.35)] hover:shadow-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]"
    >
      <img
        src={it.thumbnail_url}
        alt={it.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.45) 45%, transparent 80%)",
        }}
      />
      <div className="absolute left-3 top-3 flex items-center gap-1.5">
        <span className="rounded-full border border-[rgba(0,242,255,0.4)] bg-[rgba(0,0,0,0.55)] px-2 py-[3px] font-mono text-[9px] tracking-hud text-cyan backdrop-blur-md">
          EP {String(it.position + 1).padStart(2, "0")}
        </span>
        {it.duration && (
          <span className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.55)] px-2 py-[3px] font-mono text-[9px] tracking-hud text-pure backdrop-blur-md">
            {it.duration}
          </span>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-glow-sm">
          <Play size={18} className="text-pure" fill="currentColor" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug tracking-tight text-pure">
          {it.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2 font-mono text-[9px] tracking-hud text-slate">
          <span>{formatDateDDMMYYYY(it.published_at)}</span>
          {it.view_count !== null && (
            <>
              <span className="h-[2px] w-[2px] rounded-full bg-slate" />
              <span>{formatViewCount(it.view_count)}</span>
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export default PlaylistDetail;
