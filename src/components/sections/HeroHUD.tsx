import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ChevronDown, ChevronUp, MessageCircle, Play, ThumbsUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HudLabel } from "@/components/ui/HudLabel";
import { useVideos } from "@/hooks/useVideos";
import { useChannelInfo, type ChannelStats, type CommunityPost } from "@/hooks/useChannelInfo";
import { useModal } from "@/store/modalStore";
import { useHoverAudioHandlers } from "@/components/audio/HoverAudioProvider";
import { formatDateDDMMYYYY, timeAgo } from "@/lib/format";
import type { Video } from "@/lib/types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function HeroHUD() {
  const { videos, loading } = useVideos();
  const reduced = useReducedMotion();
  const featuredColRef = useRef<HTMLDivElement | null>(null);
  const [sideMaxH, setSideMaxH] = useState<number | undefined>(undefined);

  const featured: Video | undefined = useMemo(
    () => videos.find((v) => v.is_featured) ?? videos[0],
    [videos]
  );
  const recent = useMemo(() => {
    if (!featured) return videos.slice(0, 12);
    return videos.filter((v) => v.id !== featured.id).slice(0, 12);
  }, [videos, featured]);

  // Match side panels' max-height to the center (featured) panel height,
  // so the channel + recent feeds scroll internally instead of stretching the row.
  useEffect(() => {
    const el = featuredColRef.current;
    if (!el) return;
    const apply = () => setSideMaxH(el.getBoundingClientRect().height);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [featured?.id]);

  const sideStyle = sideMaxH ? { height: `${sideMaxH}px`, maxHeight: `${sideMaxH}px` } : undefined;

  return (
    <section
      className="relative isolate w-full overflow-hidden"
      aria-label="AUMECHO Sanctuary control deck"
    >
      {/* Backdrop: featured thumbnail desaturated + blurred */}
      {featured && (
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={featured.thumbnail_url}
            alt=""
            className="h-full w-full scale-110 object-cover"
            style={{ filter: "blur(40px) saturate(0.15) brightness(0.5)" }}
          />
          <div className="absolute inset-0 bg-void/70" />
          <div className="absolute inset-0 bg-nebula-radial" />
        </div>
      )}

      <motion.div
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        initial={reduced ? "visible" : "hidden"}
        animate="visible"
        className="mx-auto flex h-full max-w-[1400px] flex-col gap-3 p-4 sm:p-6 lg:p-8"
      >
        <motion.div variants={fadeUp}>
          <StatusBar />
        </motion.div>

        <div className="grid flex-1 grid-cols-1 items-start gap-3 lg:grid-cols-12">
          <motion.div
            variants={fadeUp}
            className="min-h-0 lg:col-span-3 lg:overflow-hidden"
            style={sideStyle}
          >
            <ChannelPanel />
          </motion.div>

          <motion.div ref={featuredColRef} variants={fadeUp} className="lg:col-span-6">
            <FeaturedPanel video={featured} loading={loading} />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="min-h-0 lg:col-span-3 lg:overflow-hidden"
            style={sideStyle}
          >
            <RecentPanel videos={recent} loading={loading} />
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <TickerBar />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------- Status bar ---------------- */
function StatusBar() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-10 items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] px-3 font-mono text-[10px] tracking-hud text-ghost">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-70" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-red-500" />
        </span>
        <span className="text-pure">LIVE</span>
      </div>
      <div className="hidden truncate text-slate sm:block">
        AUMECHO SANCTUARY <span className="text-cyan/60">//</span> DEVOTIONAL SIGNAL ACTIVE
      </div>
      <div className="text-pure tabular-nums">{time || "--:--:--"}</div>
    </div>
  );
}

/* ---------------- Left: CHANNEL.LIVE (stats + community + subscribe) ---------------- */
function ChannelPanel() {
  const { stats, posts, loading, subscribeUrl, handle } = useChannelInfo();

  return (
    <GlassCard className="h-full p-4">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <HudLabel className="text-[9px]">CHANNEL.LIVE</HudLabel>
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-hud text-cyan/70">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan opacity-70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-cyan" />
            </span>
            SYNCED
          </span>
        </div>

        {/* Stats */}
        <ChannelStatsBlock stats={stats} loading={loading} />

        {/* Subscribe CTA */}
        <a
          href={subscribeUrl}
          target="_blank"
          rel="noreferrer"
          data-cursor="pointer"
          className="group flex h-10 items-center justify-center gap-2 rounded-md border border-[rgba(255,0,0,0.45)] bg-[rgba(255,0,0,0.12)] px-3 font-mono text-[10px] uppercase tracking-hud text-pure transition-[background-color,border-color,box-shadow] duration-300 hover:bg-[rgba(255,0,0,0.22)] hover:border-[rgba(255,0,0,0.7)] hover:shadow-[0_0_24px_rgba(255,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,0,0,0.5)]"
          aria-label={`Subscribe to ${handle} on YouTube`}
        >
          <Bell size={12} className="transition-transform duration-300 group-hover:rotate-[-12deg]" />
          <span>Subscribe</span>
        </a>

        {/* Community posts */}
        <CommunityFeed posts={posts} loading={loading} handle={handle} />
      </div>
    </GlassCard>
  );
}

function ChannelStatsBlock({ stats, loading }: { stats: ChannelStats | null; loading: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCell
        label="SUBS"
        value={stats ? compactNumber(stats.subscriberCount) : loading ? "…" : "—"}
        accent
      />
      <StatCell
        label="VIDEOS"
        value={stats ? compactNumber(stats.videoCount) : loading ? "…" : "—"}
      />
      <StatCell
        label="VIEWS"
        value={stats ? compactNumber(stats.viewCount) : loading ? "…" : "—"}
      />
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-2">
      <div className="font-mono text-[8px] tracking-hud text-slate">{label}</div>
      <div
        className={
          "mt-1 text-[15px] font-semibold tabular-nums tracking-tight " +
          (accent ? "text-cyan" : "text-pure")
        }
      >
        {value}
      </div>
    </div>
  );
}

function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

// Tracks how close the scroller is to its top/bottom edges as 0→1 opacities,
// updating on every frame the user interacts (wheel, drag, touch, keyboard).
function useScrollEdges<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null);
  const [upOpacity, setUpOpacity] = useState(0);
  const [downOpacity, setDownOpacity] = useState(0);
  const rafRef = useRef<number | null>(null);

  const measure = () => {
    rafRef.current = null;
    const el = ref.current;
    if (!el) return;
    const FADE = 48; // px window over which the cue fully fades
    const top = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const bottomDist = Math.max(0, maxScroll - top);
    const scrollable = maxScroll > 1;
    setUpOpacity(scrollable ? Math.min(1, top / FADE) : 0);
    setDownOpacity(scrollable ? Math.min(1, bottomDist / FADE) : 0);
  };

  const schedule = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(measure);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    el.addEventListener("scroll", schedule, { passive: true });
    el.addEventListener("wheel", schedule, { passive: true });
    el.addEventListener("touchmove", schedule, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", schedule);
      el.removeEventListener("wheel", schedule);
      el.removeEventListener("touchmove", schedule);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, upOpacity, downOpacity, refresh: schedule };
}

function CommunityFeed({
  posts,
  loading,
  handle,
}: {
  posts: CommunityPost[];
  loading: boolean;
  handle: string;
}) {
  const PAGE = 5;
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef<HTMLLIElement | null>(null);
  const { ref: scrollerRef, upOpacity, downOpacity, refresh } =
    useScrollEdges<HTMLUListElement>([loading, posts.length, visible]);

  // Reset paging when the underlying list changes (e.g. new fetch).
  useEffect(() => {
    setVisible(PAGE);
  }, [posts.length]);

  useEffect(() => {
    refresh();
  }, [loading, posts.length, visible, refresh]);

  // Infinite scroll via IntersectionObserver on a sentinel inside the scroll container.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE, posts.length));
        }
      },
      { root: el.parentElement, rootMargin: "120px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [posts.length]);

  const shown = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <HudLabel className="text-[9px]">COMMUNITY.FEED</HudLabel>
        <a
          href={`https://www.youtube.com/${handle}/community`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[9px] tracking-hud text-slate transition-colors hover:text-cyan"
        >
          OPEN ↗
        </a>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <ul
          ref={scrollerRef}
          className="h-full space-y-1.5 overflow-y-auto overscroll-contain pr-2 scrollbar-visible"
        >
        {loading && posts.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-[60px] rounded-md text-shimmer" />
          ))
        ) : posts.length === 0 ? (
          <li className="rounded-md border border-dashed border-[rgba(255,255,255,0.08)] p-3 text-center font-mono text-[9px] tracking-hud text-slate">
            NO RECENT POSTS
          </li>
        ) : (
          <>
            {shown.map((p) => (
              <CommunityPostRow key={p.id} post={p} handle={handle} />
            ))}
            {hasMore && (
              <li
                ref={sentinelRef}
                className="h-[40px] rounded-md text-shimmer"
                aria-hidden
              />
            )}
            {!hasMore && posts.length > PAGE && (
              <li className="py-2 text-center font-mono text-[9px] tracking-hud text-slate">
                — END OF FEED —
              </li>
            )}
          </>
        )}
        </ul>
        <ScrollCue direction="up" opacity={upOpacity} />
        <ScrollCue direction="down" opacity={downOpacity} />
      </div>
    </div>
  );
}

function ScrollCue({ direction, opacity }: { direction: "up" | "down"; opacity: number }) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  const isUp = direction === "up";
  return (
    <div
      aria-hidden
      style={{ opacity }}
      className={`pointer-events-none absolute inset-x-0 ${isUp ? "top-0 bg-gradient-to-b items-start" : "bottom-0 bg-gradient-to-t items-end"} z-10 flex h-10 justify-center from-void/95 via-void/60 to-transparent will-change-[opacity]`}
    >
      <Icon
        size={14}
        className="text-cyan/90 animate-bounce"
        style={{ animationDuration: "1.6s", margin: isUp ? "4px 0 0 0" : "0 0 4px 0" }}
      />
    </div>
  );
}

function CommunityPostRow({ post, handle }: { post: CommunityPost; handle: string }) {
  return (
    <li>
      <a
        href={`https://www.youtube.com/${handle}/community?lb=${post.id}`}
        target="_blank"
        rel="noreferrer"
        data-cursor="link"
        className="group flex gap-2 rounded-md border border-transparent px-2 py-2 transition-[background-color,border-color] duration-300 hover:bg-[rgba(255,255,255,0.04)] hover:border-l-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]"
        style={{ borderLeftWidth: 1 }}
      >
        {post.imageUrl && (
          <div className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[3px] bg-surface">
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[11px] leading-snug text-pure">
            {post.text || "(image post)"}
          </div>
          <div className="mt-1 flex items-center gap-3 font-mono text-[9px] tracking-hud text-slate">
            <span>{post.publishedTimeText || "—"}</span>
            {post.likeCount && (
              <span className="flex items-center gap-1">
                <ThumbsUp size={9} />
                {post.likeCount}
              </span>
            )}
            {post.commentCount && (
              <span className="flex items-center gap-1">
                <MessageCircle size={9} />
                {post.commentCount}
              </span>
            )}
          </div>
        </div>
      </a>
    </li>
  );
}

/* ---------------- Center: FEATURED ---------------- */
function FeaturedPanel({ video, loading }: { video?: Video; loading: boolean }) {
  const { openModal } = useModal();
  const hover = useHoverAudioHandlers(
    video
      ? { id: video.youtube_id, kind: "video", title: video.title, thumbnail: video.thumbnail_url }
      : null
  );

  if (!video) {
    return (
      <GlassCard className="h-full p-5">
        <div className="flex h-full items-center justify-center">
          <span className="font-mono text-[10px] tracking-hud text-slate">
            {loading ? "ACQUIRING SIGNAL…" : "NO TRANSMISSIONS YET"}
          </span>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow className="h-full overflow-hidden">
      <button
        type="button"
        data-cursor="video"
        onClick={() => openModal(video)}
        {...hover}
        className="group relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]"
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(5,5,7,0.9) 0%, rgba(5,5,7,0.2) 50%, transparent 100%)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[rgba(0,242,255,0.12)] group-hover:border-[rgba(0,242,255,0.6)] group-hover:shadow-glow-md">
              <Play size={22} className="text-pure" fill="currentColor" />
            </div>
          </div>

          {/* HUD corners */}
          <Corner className="left-2 top-2" />
          <Corner className="right-2 top-2 rotate-90" />
          <Corner className="right-2 bottom-2 rotate-180" />
          <Corner className="left-2 bottom-2 -rotate-90" />
        </div>

        <div className="space-y-2 p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[rgba(0,242,255,0.4)] bg-cyan/15 px-2 py-[3px] font-mono text-[9px] uppercase tracking-hud text-cyan">
              {video.category}
            </span>
            <span className="font-mono text-[9px] tracking-hud text-slate">FEATURED</span>
          </div>
          <h2 className="line-clamp-2 text-[22px] font-semibold tracking-tighter text-pure">
            {video.title}
          </h2>
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-hud text-ghost">
            <span>{formatDateDDMMYYYY(video.published_at)}</span>
            {video.duration && (
              <>
                <span className="h-[2px] w-[2px] rounded-full bg-slate" />
                <span>{video.duration}</span>
              </>
            )}
          </div>
        </div>
      </button>
    </GlassCard>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3 w-3 border-l border-t border-cyan/60 ${className ?? ""}`}
    />
  );
}

/* ---------------- Right: RECENT.LOG ---------------- */
function RecentPanel({ videos, loading }: { videos: Video[]; loading: boolean }) {
  const { openModal } = useModal();
  const { ref: scrollerRef, upOpacity, downOpacity, refresh } =
    useScrollEdges<HTMLUListElement>([loading, videos.length]);

  useEffect(() => {
    refresh();
  }, [loading, videos.length, refresh]);

  return (
    <GlassCard className="h-full p-4">
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <HudLabel className="text-[9px]">RECENT.LOG</HudLabel>
          <span className="font-mono text-[9px] tracking-hud text-slate">
            {loading ? "…" : `${videos.length}`}
          </span>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <ul
            ref={scrollerRef}
            className="h-full space-y-1.5 overflow-y-auto overscroll-contain pr-2 scrollbar-visible"
          >
          {(loading ? Array.from({ length: 4 }) : videos).map((v, i) => {
            const video = v as Video | undefined;
            return (
              <li key={video?.id ?? i}>
                {video ? (
                  <RecentRow video={video} onOpen={() => openModal(video)} />
                ) : (
                  <div className="h-[50px] w-full rounded-md text-shimmer" />
                )}
              </li>
            );
          })}
          </ul>
          <ScrollCue direction="up" opacity={upOpacity} />
          <ScrollCue direction="down" opacity={downOpacity} />
        </div>
      </div>
    </GlassCard>
  );
}


/* ---------------- Ticker ---------------- */
function TickerBar() {
  const segment =
    "AUMECHO  ✦  DEVOTIONAL BHAJANS  ✦  SACRED MANTRAS  ✦  BHAGAVAD GITA  ✦  AARTI · KIRTAN · KATHA  ✦  ∞  ∞  ∞  ✦  ";
  return (
    <div className="relative h-9 overflow-hidden border-y border-[rgba(255,255,255,0.06)]">
      <div className="flex h-full animate-marquee items-center whitespace-nowrap font-mono text-[10px] tracking-hud text-ghost">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="px-3">
            {segment}
          </span>
        ))}
      </div>
    </div>
  );
}
