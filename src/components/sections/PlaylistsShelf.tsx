import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ListMusic, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { HudLabel } from "@/components/ui/HudLabel";
import { usePlaylists } from "@/hooks/usePlaylists";

export function PlaylistsShelf() {
  const { playlists, loading } = usePlaylists();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  if (loading || playlists.length === 0) return null;

  const featured = playlists.find((p) => p.is_featured) ?? playlists[0];
  const others = playlists.filter((p) => p.id !== featured.id);

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
            Curated devotional journeys — from the complete Bhagavad Gita to dedicated
            collections for each form of the Divine.
          </p>
        </div>
      </motion.div>

      {/* Featured (Gita) */}
      <a
        href={`https://www.youtube.com/playlist?list=${featured.youtube_playlist_id}`}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link"
        className={cn(
          "group relative mb-6 grid overflow-hidden rounded-2xl border border-[rgba(0,242,255,0.25)] bg-surface",
          "transition-all duration-500 hover:border-[rgba(0,242,255,0.55)] hover:shadow-glow-md",
          "lg:grid-cols-[1.2fr_1fr]"
        )}
      >
        <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[360px]">
          <img
            src={featured.thumbnail_url}
            alt={featured.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(5,5,7,0.6) 0%, rgba(5,5,7,0.2) 50%, rgba(5,5,7,0.85) 100%)",
            }}
          />
          <div className="absolute left-5 top-5">
            <span className="rounded-full border border-[rgba(0,242,255,0.5)] bg-[rgba(0,242,255,0.15)] px-3 py-1 font-mono text-[9px] uppercase tracking-hud text-cyan">
              ✦ Featured Series
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
          <HudLabel className="text-[10px] text-cyan">{featured.item_count} EPISODES</HudLabel>
          <h3 className="text-2xl font-semibold tracking-tighter text-pure sm:text-3xl lg:text-4xl">
            {featured.title}
          </h3>
          {featured.description && (
            <p className="line-clamp-3 text-sm text-ghost">{featured.description}</p>
          )}
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-hud text-cyan transition-transform duration-300 group-hover:translate-x-1">
            <span>OPEN ON YOUTUBE</span>
            <ExternalLink size={12} />
          </div>
        </div>
      </a>

      {/* Other playlists grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {others.map((p, i) => (
          <motion.a
            key={p.id}
            href={`https://www.youtube.com/playlist?list=${p.youtube_playlist_id}`}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
              delay: Math.min(i, 8) * 0.05,
            }}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl",
              "border border-[rgba(255,255,255,0.07)] bg-surface",
              "transition-[border-color,box-shadow] duration-[400ms]",
              "hover:border-[rgba(0,242,255,0.35)] hover:shadow-glow-sm"
            )}
          >
            <img
              src={p.thumbnail_url}
              alt={p.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.06]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.5) 45%, transparent 80%)",
              }}
            />
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.5)] px-2 py-[3px] font-mono text-[9px] tracking-hud text-pure backdrop-blur-md">
              <ListMusic size={9} />
              <span>{p.item_count}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="line-clamp-2 text-xs font-medium leading-tight tracking-tight text-pure sm:text-sm">
                {p.title}
              </h3>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
