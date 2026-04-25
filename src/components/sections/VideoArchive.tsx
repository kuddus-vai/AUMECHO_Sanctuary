import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { HudLabel } from "@/components/ui/HudLabel";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { VideoCard } from "@/components/ui/VideoCard";
import { useVideos } from "@/hooks/useVideos";
import type { VideoCategory } from "@/lib/types";

type FilterKey = "all" | Exclude<VideoCategory, "shorts" | "playlist">;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "bhajan", label: "BHAJAN" },
  { key: "mantra", label: "MANTRA" },
  { key: "aarti", label: "AARTI" },
  { key: "kirtan", label: "KIRTAN" },
  { key: "katha", label: "KATHA" },
  { key: "gita", label: "GITA" },
];

/**
 * Bento grid sizing pattern for long-form videos.
 */
const PATTERN = [
  { col: "lg:col-span-8", height: "lg:h-[320px]", layout: "default" as const },
  { col: "lg:col-span-4", height: "lg:h-[320px]", layout: "default" as const },
  { col: "lg:col-span-4", height: "lg:h-[240px]", layout: "default" as const },
  { col: "lg:col-span-4", height: "lg:h-[240px]", layout: "default" as const },
  { col: "lg:col-span-4", height: "lg:h-[240px]", layout: "default" as const },
  { col: "lg:col-span-6", height: "lg:h-[280px]", layout: "default" as const },
  { col: "lg:col-span-6", height: "lg:h-[280px]", layout: "default" as const },
  { col: "lg:col-span-12", height: "lg:h-[220px]", layout: "panoramic" as const },
];

const PAGE_SIZE = 24;

export function VideoArchive() {
  const { videos, loading } = useVideos();
  const [filter, setFilter] = useState<FilterKey>("all");
  const reduced = useReducedMotion();
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });

  // Long-form only — Shorts have their own shelf
  const longForm = useMemo(
    () => videos.filter((v) => !v.is_short && v.category !== "shorts"),
    [videos]
  );

  const filtered = useMemo(() => {
    return filter === "all" ? longForm : longForm.filter((v) => v.category === filter);
  }, [longForm, filter]);

  return (
    <section
      id="archive"
      className="relative z-10 mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <motion.div
        ref={headerRef}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 space-y-5"
      >
        <div className="flex items-center gap-3">
          <HudLabel className="text-[10px]">SIGNAL.ARCHIVE</HudLabel>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
          <span className="font-mono text-[10px] tracking-hud text-slate">
            {longForm.length} TRANSMISSIONS
          </span>
        </div>

        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tighter text-pure sm:text-4xl">
              All Bhajans
            </h2>
            <p className="mt-2 max-w-md text-sm text-ghost">
              The complete devotional archive. Filter by frequency — bhajan, mantra, aarti,
              kirtan, katha, or the Bhagavad Gita series.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-hud transition-[background-color,border-color,color,box-shadow] duration-300",
                    active
                      ? "bg-cyan/15 border-[rgba(0,242,255,0.5)] text-cyan shadow-glow-sm"
                      : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] text-ghost hover:text-pure hover:border-[rgba(0,242,255,0.3)]"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {Array.from({ length: 8 }).map((_, i) => {
            const p = PATTERN[i % PATTERN.length];
            return (
              <SkeletonCard
                key={i}
                className={cn("h-[240px] sm:col-span-1", p.col, p.height)}
              />
            );
          })}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12"
          >
            {filtered.map((v, i) => {
              const p = PATTERN[i % PATTERN.length];
              return (
                <VideoCard
                  key={v.id}
                  video={v}
                  index={i}
                  layout={p.layout}
                  className={cn("h-[240px] sm:col-span-1", p.col, p.height)}
                />
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full flex h-40 items-center justify-center rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] font-mono text-[10px] tracking-hud text-slate">
                NO TRANSMISSIONS ON THIS FREQUENCY
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
