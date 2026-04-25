import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Series", href: "#playlists" },
  { label: "Shorts", href: "#shorts" },
  { label: "Archive", href: "#archive" },
  { label: "About", href: "#about" },
  { label: "Facebook", href: "https://www.facebook.com/aumecho.official", external: true },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-[rgba(255,255,255,0.06)]"
        style={{
          background: "rgba(5,5,7,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label="AUMECHO home"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-cyan shadow-glow-sm" />
            </span>
            <span className="text-[18px] font-semibold tracking-tightest text-pure">
              AUMECHO
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.label} {...l} />
            ))}
          </nav>

          {/* Mobile trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] text-ghost hover:text-pure hover:border-[rgba(0,242,255,0.4)] transition-colors"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-void/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5">
              <span className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-glow-sm" />
                <span className="text-[18px] font-semibold tracking-tightest text-pure">
                  AUMECHO
                </span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] text-ghost hover:text-pure"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-start justify-center gap-6 px-8">
              {NAV_LINKS.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-4xl font-light tracking-tightest text-pure"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  label,
  href,
  external,
}: {
  label: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group relative font-mono text-[11px] uppercase tracking-hud text-ghost transition-colors duration-300 hover:text-pure"
    >
      {label}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 right-0 h-px origin-left scale-x-0 bg-cyan transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </a>
  );
}
