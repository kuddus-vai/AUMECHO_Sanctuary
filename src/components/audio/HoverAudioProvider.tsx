import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Volume2, X } from "lucide-react";

type AudioKind = "video" | "playlist";

type HoverTarget = {
  id: string;          // youtube video id OR playlist id
  kind: AudioKind;
  title: string;
  thumbnail?: string | null;
};

type Ctx = {
  /** Begin a hover-intent timer; if not cancelled in ~280ms, audio starts. */
  start: (t: HoverTarget) => void;
  /** Begin a leave-intent timer; if not re-entered in ~200ms, audio stops. */
  stop: () => void;
  /** Cancel any pending start/stop (used when entering the floating panel). */
  cancel: () => void;
  /** Force stop immediately (close button). */
  forceStop: () => void;
  current: HoverTarget | null;
};

const HoverAudioCtx = createContext<Ctx | null>(null);

export function useHoverAudio() {
  const ctx = useContext(HoverAudioCtx);
  if (!ctx) throw new Error("useHoverAudio must be used within HoverAudioProvider");
  return ctx;
}

/** Convenience hook returning ready-to-spread mouse/focus handlers for a card. */
export function useHoverAudioHandlers(target: HoverTarget | null) {
  const { start, stop } = useHoverAudio();
  if (!target) return {};
  return {
    onMouseEnter: () => start(target),
    onMouseLeave: () => stop(),
    onFocus: () => start(target),
    onBlur: () => stop(),
  };
}

export function HoverAudioProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<HoverTarget | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (startTimer.current) { clearTimeout(startTimer.current); startTimer.current = null; }
    if (stopTimer.current) { clearTimeout(stopTimer.current); stopTimer.current = null; }
  }, []);

  const start = useCallback((t: HoverTarget) => {
    cancel();
    startTimer.current = setTimeout(() => setCurrent(t), 280);
  }, [cancel]);

  const stop = useCallback(() => {
    if (startTimer.current) { clearTimeout(startTimer.current); startTimer.current = null; }
    stopTimer.current = setTimeout(() => setCurrent(null), 200);
  }, []);

  const forceStop = useCallback(() => {
    cancel();
    setCurrent(null);
  }, [cancel]);

  useEffect(() => () => cancel(), [cancel]);

  // Esc closes
  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") forceStop(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, forceStop]);

  const src = current
    ? current.kind === "playlist"
      ? `https://www.youtube.com/embed/videoseries?list=${current.id}&autoplay=1&rel=0&modestbranding=1`
      : `https://www.youtube.com/embed/${current.id}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <HoverAudioCtx.Provider value={{ start, stop, cancel, forceStop, current }}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {current && src && (
              <motion.div
                key="hover-audio-panel"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={cancel}
                onMouseLeave={stop}
                className="fixed bottom-6 right-6 z-[120] flex w-[320px] items-center gap-3 rounded-2xl border border-[rgba(0,242,255,0.25)] bg-[rgba(10,10,14,0.92)] p-3 shadow-2xl backdrop-blur-xl"
              >
                {current.thumbnail ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)]">
                    <img src={current.thumbnail} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,242,255,0.1)] text-cyan">
                    <Volume2 size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="font-mono text-[9px] uppercase tracking-hud text-cyan">Audio preview</span>
                    <div className="flex items-end gap-[2px] h-3">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="w-[2px] rounded-full bg-cyan"
                          style={{
                            animation: `eq-bounce 0.9s ease-in-out ${i * 0.12}s infinite`,
                            height: "100%",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="truncate text-[12px] text-pure">{current.title}</p>
                </div>
                <button
                  onClick={forceStop}
                  aria-label="Stop preview"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] text-ghost transition-colors hover:border-[rgba(0,242,255,0.5)] hover:text-pure"
                >
                  <X size={13} />
                </button>
                {/* Hidden audio source: YouTube iframe rendered off-screen */}
                <iframe
                  key={`${current.kind}-${current.id}`}
                  title={current.title}
                  src={src}
                  allow="autoplay; encrypted-media"
                  aria-hidden
                  tabIndex={-1}
                  className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px opacity-0"
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </HoverAudioCtx.Provider>
  );
}
