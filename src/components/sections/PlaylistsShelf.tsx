import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ListMusic, ArrowUpRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { HudLabel } from "@/components/ui/HudLabel";
import { usePlaylists } from "@/hooks/usePlaylists";

export function PlaylistsShelf() {
  const { playlists, loading } = usePlaylists();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  if (loading || playlists.length === 0) return null;

  return (
    <section
      id="playlists"
      className="relative z-10 mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <motion.div
        ref={ref}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 space-y-4"
      >
        <div className="flex items-center gap-3">
          <HudLabel className="text-[10px]">SIGNAL.SERIES</HudLabel>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
          <span className="font-mono text-[10px] tracking-hud text-slate">
            {playlists.length} COLLECTIONS
          </span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-pure sm:text-4xl">
            Sacred Series
          </h2>
          <p className="mt-2 max-w-md text-sm text-ghost">
            Curated devotional journeys — every collection is a doorway. Tap to enter the stream.
          </p>
        </div>
      </motion.div>

      {/* All playlists — every one rendered as a featured wide card */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {playlists.map((p, i) => {
          // Gita series → open at the FIRST (oldest) episode in player view
          const isGita = /gita|गीता|geeta/i.test(p.title);
          const href = isGita
            ? `https://www.youtube.com/watch?list=${p.youtube_playlist_id}&index=1`
            : `https://www.youtube.com/playlist?list=${p.youtube_playlist_id}`;
          return (
          <motion.a
            key={p.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: Math.min(i, 10) * 0.05,
            }}
            className={cn(
              "group relative grid overflow-hidden rounded-2xl bg-surface",
              "border transition-all duration-500",
              p.is_featured
                ? "border-[rgba(0,242,255,0.3)] hover:border-[rgba(0,242,255,0.6)] hover:shadow-glow-md"
                : "border-[rgba(255,255,255,0.07)] hover:border-[rgba(0,242,255,0.35)] hover:shadow-glow-sm",
              "grid-cols-[1fr] sm:grid-cols-[1.1fr_1fr]"
            )}
          >
            {/* Thumb */}
            <div className="relative aspect-[16/9] sm:aspect-auto sm:min-h-[260px]">
              <img
                src={p.thumbnail_url}
                alt={p.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, rgba(5,5,7,0.45) 0%, rgba(5,5,7,0.15) 50%, rgba(5,5,7,0.85) 100%)",
                }}
              />
              {p.is_featured && (
                <div className="absolute left-4 top-4">
                  <span className="rounded-full border border-[rgba(0,242,255,0.5)] bg-[rgba(0,242,255,0.15)] px-3 py-1 font-mono text-[9px] uppercase tracking-hud text-cyan">
                    ✦ Signature Series
                  </span>
                </div>
              )}

              {/* Hover play overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:hidden">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-glow-sm">
                  <Play size={20} className="text-pure" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="relative flex flex-col justify-center gap-3 p-5 sm:gap-4 sm:p-6 lg:p-7">
              <div className="flex items-center gap-2">
                <HudLabel className={cn("text-[10px]", p.is_featured && "text-cyan")}>
                  <ListMusic size={10} className="mr-1.5 inline" />
                  {p.item_count} EPISODES
                </HudLabel>
              </div>
              <h3 className="line-clamp-2 text-xl font-semibold tracking-tighter text-pure sm:text-2xl lg:text-[28px] lg:leading-[1.15]">
                {p.title}
              </h3>
              {p.description && (
                <p className="line-clamp-2 text-sm text-ghost">{p.description}</p>
              )}
              <div className="mt-1 flex items-center gap-2 font-mono text-[10px] tracking-hud text-cyan transition-transform duration-300 group-hover:translate-x-1">
                <span>OPEN ON YOUTUBE</span>
                <ExternalLink size={11} />
              </div>
            </div>
          </motion.a>
          );
        })}
      </div>
    </section>
  );
}
