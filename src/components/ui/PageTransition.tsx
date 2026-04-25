import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { type ReactNode } from "react";

/**
 * "Liquid Wash" page transition.
 * A frosted-glass curtain sweeps across the screen between routes.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        className="relative"
      >
        {/* Wash curtain */}
        <motion.div
          aria-hidden
          initial={{ x: "-101%" }}
          animate={{ x: "101%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none fixed inset-0 z-[90]"
          style={{
            background: "rgba(0,242,255,0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
