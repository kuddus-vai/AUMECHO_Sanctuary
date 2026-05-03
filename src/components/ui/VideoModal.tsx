import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, ExternalLink, Maximize2, Minimize2, X } from "lucide-react";
import { useModal } from "@/store/modalStore";
import { formatDateLong, formatViewCount } from "@/lib/format";

const SUBSCRIBE_URL =
  "https://www.youtube.com/@AUMECHO?sub_confirmation=1";

export function VideoModal() {
  const { activeVideo, closeModal, focusMode, toggleFocusMode } = useModal();
  const reduced = useReducedMotion();

  // Esc to close, lock body scroll
  useEffect(() => {
    if (!activeVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focusMode) toggleFocusMode();
        else closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [activeVideo, closeModal, focusMode, toggleFocusMode]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {activeVideo && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={closeModal}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{
            background: focusMode ? "rgba(0,0,0,0.97)" : "rgba(5,5,7,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            transition: "background-color 400ms ease",
          }}
        >
          <motion.div
            key="modal-shell"
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.93, y: 40 }}
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[1100px] flex-col overflow-y-auto rounded-[20px] border border-[rgba(255,255,255,0.1)] sm:max-h-[calc(100dvh-4rem)]"
            style={{
              background: "rgba(10,10,15,0.9)",
              boxShadow:
                "0 0 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,242,255,0.05)",
            }}
          >
            {/* Top bar */}
            <AnimatePresence initial={false}>
              {!focusMode && (
                <motion.div
                  key="topbar"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex h-[52px] items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] px-4 sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-2 py-[3px] font-mono text-[9px] uppercase tracking-hud text-ghost">
                      {activeVideo.category}
                    </span>
                    <h2 className="truncate text-sm font-medium tracking-tighter text-pure">
                      {activeVideo.title}
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={SUBSCRIBE_URL}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="pointer"
                      aria-label="Subscribe to AUMECHO on YouTube"
                      className="group hidden h-9 items-center gap-2 rounded-full border border-[rgba(255,0,0,0.45)] bg-[rgba(255,0,0,0.12)] px-3.5 font-mono text-[10px] uppercase tracking-hud text-pure transition-[background-color,border-color,box-shadow] duration-300 hover:bg-[rgba(255,0,0,0.22)] hover:border-[rgba(255,0,0,0.7)] hover:shadow-[0_0_24px_rgba(255,0,0,0.35)] sm:inline-flex"
                    >
                      <Bell size={12} className="transition-transform duration-300 group-hover:rotate-[-12deg]" />
                      <span>Subscribe</span>
                    </a>
                    <ModalIconBtn onClick={toggleFocusMode} label="Focus mode">
                      {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </ModalIconBtn>
                    <ModalIconBtn
                      as="a"
                      href={`https://www.youtube.com/watch?v=${activeVideo.youtube_id}`}
                      target="_blank"
                      rel="noreferrer"
                      label="Open on YouTube"
                    >
                      <ExternalLink size={14} />
                    </ModalIconBtn>
                    <ModalIconBtn onClick={closeModal} label="Close">
                      <X size={14} />
                    </ModalIconBtn>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Iframe */}
            <div className="relative w-full shrink-0 bg-black" style={{ aspectRatio: "16 / 9", maxHeight: focusMode ? "100dvh" : "calc(100dvh - 2rem - 52px - 200px)" }}>
              <iframe
                title={activeVideo.title}
                src={`https://www.youtube.com/embed/${activeVideo.youtube_id}?autoplay=1&rel=0&modestbranding=1&color=white`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 mx-auto h-full"
                style={{ aspectRatio: "16 / 9", maxWidth: "100%" }}
              />
            </div>

            {/* Bottom info */}
            <AnimatePresence initial={false}>
              {!focusMode && (
                <motion.div
                  key="bottombar"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-6 border-t border-[rgba(255,255,255,0.06)] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold tracking-tighter text-pure sm:text-lg">
                      {activeVideo.title}
                    </h3>
                    {activeVideo.description && (
                      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ghost">
                        {activeVideo.description}
                      </p>
                    )}
                    <a
                      href={SUBSCRIBE_URL}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="pointer"
                      className="group mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(255,0,0,0.5)] bg-[rgba(255,0,0,0.14)] px-4 py-2 text-[12px] font-semibold tracking-tight text-pure transition-[background-color,border-color,box-shadow] duration-300 hover:bg-[rgba(255,0,0,0.24)] hover:border-[rgba(255,0,0,0.75)] hover:shadow-[0_0_28px_rgba(255,0,0,0.4)]"
                    >
                      <Bell size={13} className="transition-transform duration-300 group-hover:rotate-[-12deg]" />
                      <span>Subscribe to AUMECHO</span>
                    </a>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <div className="font-mono text-[10px] tracking-hud text-slate">
                      {formatDateLong(activeVideo.published_at)}
                    </div>
                    <div className="font-mono text-[10px] tracking-hud text-ghost">
                      {formatViewCount(activeVideo.view_count)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ExtPill
                        href={`https://www.youtube.com/watch?v=${activeVideo.youtube_id}`}
                        tint="rgba(255,0,0,0.18)"
                        border="rgba(255,0,0,0.4)"
                      >
                        YouTube
                      </ExtPill>
                      <ExtPill
                        href={`https://open.spotify.com/search/${encodeURIComponent(
                          activeVideo.title
                        )}`}
                        tint="rgba(29,185,84,0.18)"
                        border="rgba(29,185,84,0.4)"
                      >
                        Spotify
                      </ExtPill>
                      <ExtPill
                        href={`https://music.apple.com/search?term=${encodeURIComponent(
                          activeVideo.title
                        )}`}
                        tint="rgba(252,60,68,0.18)"
                        border="rgba(252,60,68,0.4)"
                      >
                        Apple Music
                      </ExtPill>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Focus mode hint */}
            <AnimatePresence>
              {focusMode && (
                <motion.div
                  key="focushint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-mono text-[9px] tracking-hud text-ghost"
                >
                  ESC TO EXIT FOCUS MODE
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

type IconBtnProps = {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
} & (
  | { as?: "button"; href?: never; target?: never; rel?: never }
  | { as: "a"; href: string; target?: string; rel?: string }
);

function ModalIconBtn(props: IconBtnProps) {
  const className =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-ghost transition-[border-color,color,box-shadow,background-color] duration-300 hover:border-[rgba(0,242,255,0.5)] hover:text-pure hover:shadow-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]";

  if (props.as === "a") {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        aria-label={props.label}
        className={className}
      >
        {props.children}
      </a>
    );
  }
  return (
    <button onClick={props.onClick} aria-label={props.label} className={className}>
      {props.children}
    </button>
  );
}

function ExtPill({
  href,
  tint,
  border,
  children,
}: {
  href: string;
  tint: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-3 py-[5px] font-mono text-[9px] uppercase tracking-hud text-ghost transition-[background-color,border-color,color] duration-300 hover:text-pure"
      style={
        {
          // Inline custom property so hover can use it
          "--tint": tint,
          "--tint-border": border,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = tint;
        e.currentTarget.style.borderColor = border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      {children}
    </a>
  );
}
