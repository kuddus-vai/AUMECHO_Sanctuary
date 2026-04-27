import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { HudLabel } from "@/components/ui/HudLabel";
import { useVideos } from "@/hooks/useVideos";
import { useModal } from "@/store/modalStore";

export function ShortsShelf() {
  const { videos } = useVideos();
  const railRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { openModal } = useModal();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const shorts = videos
    .filter((v) => v.is_short || v.category === "shorts")
    .slice(0, 24);

  // Track scroll edges to enable/disable arrows
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [shorts.length]);

  const scrollByAmount = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    // Scroll by ~80% of visible width — reveals next set of cards
    const amount = Math.round(el.clientWidth * 0.8) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (shorts.length === 0) return null;

  return (
    <section
      id="shorts"
      className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 space-y-4"
      >
        <div className="flex items-center gap-3">
          <HudLabel className="text-[10px]">SIGNAL.SHORTS</HudLabel>
          <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
          <span className="font-mono text-[10px] tracking-hud text-slate">
            ≤ 60 SEC
          </span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tighter text-pure sm:text-4xl">
              Devotional Shorts
            </h2>
            <p className="mt-2 max-w-md text-sm text-ghost">
              Quick darshans, vertical fragments — micro-moments of bhakti.
            </p>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center gap-2">
            <CarouselBtn
              disabled={!canScrollLeft}
              onClick={() => scrollByAmount(-1)}
              label="Previous shorts"
            >
              <ChevronLeft size={16} />
            </CarouselBtn>
            <CarouselBtn
              disabled={!canScrollRight}
              onClick={() => scrollByAmount(1)}
              label="Next shorts"
            >
              <ChevronRight size={16} />
            </CarouselBtn>
          </div>
        </div>
      </motion.div>

      {/* Single-row horizontal carousel — snap, no autoplay */}
      <div className="relative">
        {/* Edge fade masks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-void to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-void to-transparent"
        />

        <div
          ref={railRef}
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-4 scrollbar-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {shorts.map((v, i) => (
            <motion.button
              key={v.id}
              data-cursor="video"
              onClick={() => openModal(v)}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: Math.min(i, 10) * 0.04,
              }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "group relative flex-shrink-0 snap-start overflow-hidden rounded-xl text-left",
                "h-[360px] w-[200px] sm:h-[400px] sm:w-[225px]",
                "border border-[rgba(255,255,255,0.07)] bg-surface",
                "transition-[border-color,box-shadow] duration-[400ms] ease-out",
                "hover:border-[rgba(0,242,255,0.35)] hover:shadow-glow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]"
              )}
            >
              <img
                src={v.thumbnail_url}
                alt={v.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.45) 45%, rgba(5,5,7,0.05) 80%, transparent 100%)",
                }}
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-glow-sm">
                  <Play size={18} className="text-pure" fill="currentColor" />
                </div>
              </div>

              <div className="absolute left-3 top-3">
                <span className="rounded-full border border-[rgba(0,242,255,0.4)] bg-[rgba(0,242,255,0.12)] px-2 py-[3px] font-mono text-[8px] uppercase tracking-hud text-cyan">
                  SHORT
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="line-clamp-3 text-sm font-medium leading-tight tracking-tight text-pure">
                  {v.title}
                </h3>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border transition-[opacity,border-color,color,background-color,box-shadow] duration-300",
        disabled
          ? "border-[rgba(255,255,255,0.06)] text-slate opacity-40"
          : "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] text-ghost hover:border-[rgba(0,242,255,0.5)] hover:text-pure hover:bg-[rgba(0,242,255,0.06)] hover:shadow-glow-sm"
      )}
    >
      {children}
    </button>
  );
}
