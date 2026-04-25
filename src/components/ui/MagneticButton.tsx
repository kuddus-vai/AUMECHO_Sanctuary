import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  strength?: number;
}

/**
 * A button that subtly translates toward the cursor on hover (max ~6px).
 * Resets on mouse leave with a spring.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.25,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-6, Math.min(6, dx * strength)));
    y.set(Math.max(-6, Math.min(6, dy * strength)));
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
      style={{ x: sx, y: sy }}
      className={cn(
        "group relative inline-flex items-center gap-3 rounded-full px-8 py-3",
        "font-mono text-[11px] uppercase tracking-hud text-ghost",
        "border border-[rgba(255,255,255,0.2)] bg-transparent",
        "transition-[background-color,border-color,color,box-shadow] duration-300",
        "hover:bg-[rgba(0,242,255,0.08)] hover:border-[rgba(0,242,255,0.5)]",
        "hover:text-pure hover:shadow-glow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,242,255,0.5)]",
        className
      )}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
