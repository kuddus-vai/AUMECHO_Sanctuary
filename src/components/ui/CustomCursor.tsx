import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorVariant = "default" | "pointer" | "video" | "text";

/**
 * Two-layer custom cursor.
 *  - Layer 1: a 6px white dot, zero-lag, updated directly via transform
 *  - Layer 2: a 32px ring that follows with spring lag
 *
 * Hides itself on touch / coarse-pointer devices and on prefers-reduced-motion.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(true);

  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const springX = useSpring(ringX, springConfig);
  const springY = useSpring(ringY, springConfig);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) {
      setEnabled(false);
      document.documentElement.classList.add("reduced-motion");
      return;
    }
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      ringX.set(e.clientX);
      ringY.set(e.clientY);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
      }
      if (hidden) setHidden(false);

      const target = e.target as HTMLElement | null;
      if (!target) return setVariant("default");

      const cursorAttr = target.closest("[data-cursor]")?.getAttribute("data-cursor") as
        | CursorVariant
        | null;
      if (cursorAttr) return setVariant(cursorAttr);

      const interactive = target.closest("a, button, [role='button'], input, textarea, select, label");
      if (interactive) return setVariant("pointer");

      setVariant("default");
    };

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled, hidden, ringX, ringY]);

  if (!enabled) return null;

  const ringSize =
    variant === "pointer" ? 56 : variant === "video" ? 72 : variant === "text" ? 2 : 32;

  return (
    <>
      {/* Trailing ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] flex items-center justify-center"
        style={{
          x: springX,
          y: springY,
          width: ringSize,
          height: variant === "text" ? 22 : ringSize,
          translateX: variant === "text" ? -1 : -ringSize / 2,
          translateY: variant === "text" ? -11 : -ringSize / 2,
          opacity: hidden ? 0 : 1,
          transition: "width 220ms cubic-bezier(0.16,1,0.3,1), height 220ms cubic-bezier(0.16,1,0.3,1), opacity 200ms",
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center rounded-full"
          style={{
            border: variant === "text" ? "none" : "1px solid rgba(0,242,255,0.6)",
            background:
              variant === "pointer"
                ? "rgba(0,242,255,0.08)"
                : variant === "video"
                ? "rgba(0,242,255,0.12)"
                : variant === "text"
                ? "rgba(0,242,255,0.6)"
                : "transparent",
            boxShadow:
              variant === "video" || variant === "pointer"
                ? "0 0 30px rgba(0,242,255,0.25)"
                : "none",
          }}
        >
          {variant === "video" && (
            <span className="font-mono text-[9px] tracking-[0.25em] text-pure">PLAY</span>
          )}
        </div>
      </motion.div>

      {/* Zero-lag dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[101]"
        style={{
          width: variant === "pointer" || variant === "video" ? 3 : 6,
          height: variant === "pointer" || variant === "video" ? 3 : 6,
          background: "#FFFFFF",
          borderRadius: "9999px",
          opacity: hidden || variant === "text" ? 0 : 1,
          transition: "width 200ms, height 200ms, opacity 200ms",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
