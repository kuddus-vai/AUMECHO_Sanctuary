import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Play, Radio } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HudLabel } from "@/components/ui/HudLabel";
import { useVideos } from "@/hooks/useVideos";
import { useModal } from "@/store/modalStore";
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

  const featured: Video | undefined = useMemo(
    () => videos.find((v) => v.is_featured) ?? videos[0],
    [videos]
  );
  const recent = useMemo(() => {
    if (!featured) return videos.slice(0, 4);
    return videos.filter((v) => v.id !== featured.id).slice(0, 4);
  }, [videos, featured]);

  return (
    <section
      className="relative isolate min-h-[calc(100svh-4rem)] w-full overflow-hidden"
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

        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <SystemPanel />
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-6">
            <FeaturedPanel video={featured} loading={loading} />
          </motion.div>

          <motion.div variants={fadeUp} className="lg:col-span-3">
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

/* ---------------- Left: SYS.STATUS ---------------- */
function SystemPanel() {
  return (
    <GlassCard className="h-full p-4">
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-center justify-between">
          <HudLabel className="text-[9px]">SYS.STATUS</HudLabel>
          <Radio size={10} className="text-cyan/70" />
        </div>

        <FrequencyBars />

        <div className="space-y-2">
          <ReadoutRow label="SIGNAL" pct={87} />
          <ReadoutRow label="CLARITY" pct={62} />
          <ReadoutRow label="RESONANCE" pct={100} />
        </div>

        <div className="mt-auto space-y-1 border-t border-[rgba(255,255,255,0.06)] pt-3 font-mono text-[9px] tracking-hud text-slate">
          <Coordinates />
          <div className="flex items-center justify-between">
            <span>UPLINK</span>
            <span className="text-cyan/70">STABLE</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function FrequencyBars() {
  const [heights, setHeights] = useState<number[]>(() => Array.from({ length: 8 }, () => 30));
  useEffect(() => {
    const id = setInterval(() => {
      setHeights(Array.from({ length: 8 }, () => 18 + Math.random() * 82));
    }, 220);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-12 items-end gap-[3px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-cyan/60 transition-[height] duration-200 ease-out"
          style={{ height: `${h}%`, boxShadow: "0 0 8px rgba(0,242,255,0.35)" }}
        />
      ))}
    </div>
  );
}

function ReadoutRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="space-y-[6px]">
      <div className="flex items-center justify-between font-mono text-[9px] tracking-hud">
        <span className="text-slate">› {label}</span>
        <span className="text-pure">{pct}%</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="h-full rounded-full bg-cyan"
          style={{ boxShadow: "0 0 8px rgba(0,242,255,0.6)" }}
        />
      </div>
    </div>
  );
}

function Coordinates() {
  const [lat, setLat] = useState(48.8566);
  const [lon, setLon] = useState(2.3522);
  useEffect(() => {
    const id = setInterval(() => {
      setLat((l) => +(l + (Math.random() - 0.5) * 0.0008).toFixed(4));
      setLon((l) => +(l + (Math.random() - 0.5) * 0.0008).toFixed(4));
    }, 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-between tabular-nums">
      <span>COORD</span>
      <span className="text-ghost">
        {lat.toFixed(4)}° N {lon.toFixed(4)}° E
      </span>
    </div>
  );
}

/* ---------------- Center: FEATURED ---------------- */
function FeaturedPanel({ video, loading }: { video?: Video; loading: boolean }) {
  const { openModal } = useModal();

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
  return (
    <GlassCard className="h-full p-4">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <HudLabel className="text-[9px]">RECENT.LOG</HudLabel>
          <span className="font-mono text-[9px] tracking-hud text-slate">
            {loading ? "…" : `${videos.length}`}
          </span>
        </div>
        <ul className="flex-1 space-y-1.5 overflow-hidden">
          {(loading ? Array.from({ length: 4 }) : videos).map((v, i) => {
            const video = v as Video | undefined;
            return (
              <li key={video?.id ?? i}>
                {video ? (
                  <motion.button
                    type="button"
                    data-cursor="video"
                    onClick={() => openModal(video)}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="group relative flex w-full items-center gap-3 rounded-md border border-transparent px-2 py-2 text-left transition-[background-color,border-color] duration-300 hover:bg-[rgba(255,255,255,0.04)] hover:border-l-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]"
                    style={{ borderLeftWidth: 1 }}
                  >
                    <div className="h-[34px] w-[60px] shrink-0 overflow-hidden rounded-[3px] bg-surface">
                      <img
                        src={video.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[11px] text-pure">{video.title}</div>
                      <div className="font-mono text-[9px] tracking-hud text-slate">
                        {timeAgo(video.published_at)}
                      </div>
                    </div>
                  </motion.button>
                ) : (
                  <div className="h-[50px] w-full rounded-md text-shimmer" />
                )}
              </li>
            );
          })}
        </ul>
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
