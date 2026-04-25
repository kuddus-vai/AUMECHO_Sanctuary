import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateDDMMYYYY, formatViewCount } from "@/lib/format";
import { useModal } from "@/store/modalStore";
import type { Video } from "@/lib/types";

interface VideoCardProps {
  video: Video;
  index: number;
  className?: string;
  /** "panoramic" lays out as a wide horizontal card */
  layout?: "default" | "panoramic";
}

export function VideoCard({ video, index, className, layout = "default" }: VideoCardProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const reduced = useReducedMotion();
  const { openModal } = useModal();
  const [imgLoaded, setImgLoaded] = useState(false);

  const stagger = Math.min(index, 8) * 0.05;

  return (
    <motion.button
      ref={ref}
      data-cursor="video"
      onClick={() => openModal(video)}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.97 }}
      animate={
        inView
          ? reduced
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1 }
          : undefined
      }
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: stagger }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-xl text-left",
        "border border-[rgba(255,255,255,0.07)] bg-surface",
        "transition-[border-color,box-shadow] duration-[400ms] ease-out",
        "hover:border-[rgba(0,242,255,0.35)] hover:shadow-glow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="absolute inset-0">
        <motion.img
          src={video.thumbnail_url}
          alt={video.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          initial={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          animate={
            imgLoaded
              ? { opacity: 1, scale: 1, filter: "blur(0px)" }
              : { opacity: 0, scale: 1.04, filter: "blur(6px)" }
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
        />
      </div>

      {/* Bottom gradient mask */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,7,0.95) 0%, rgba(5,5,7,0.55) 40%, rgba(5,5,7,0.05) 75%, transparent 100%)",
        }}
      />

      {/* Hover play overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.25)] bg-[rgba(255,255,255,0.08)] backdrop-blur-md shadow-glow-sm">
          <Play size={20} className="text-pure" fill="currentColor" />
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "absolute left-0 right-0 bottom-0 flex flex-col gap-2 p-4 sm:p-5",
          layout === "panoramic" && "max-w-[60%]"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-2 py-[3px] font-mono text-[8px] uppercase tracking-hud text-ghost transition-colors group-hover:bg-[rgba(0,242,255,0.15)] group-hover:text-cyan group-hover:border-[rgba(0,242,255,0.4)]">
            {video.category}
          </span>
          {video.duration && (
            <span className="font-mono text-[9px] tracking-hud text-slate">
              {video.duration}
            </span>
          )}
        </div>
        <h3
          className={cn(
            "font-medium tracking-tighter text-pure",
            layout === "panoramic" ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
            "line-clamp-2"
          )}
        >
          {video.title}
        </h3>
        <div className="flex items-center gap-3 font-mono text-[9px] tracking-hud text-slate">
          <span>{formatDateDDMMYYYY(video.published_at)}</span>
          <span className="h-[2px] w-[2px] rounded-full bg-slate" />
          <span>{formatViewCount(video.view_count)}</span>
        </div>
      </div>
    </motion.button>
  );
}
