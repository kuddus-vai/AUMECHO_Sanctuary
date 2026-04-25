import { type ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div id="top" className="relative min-h-screen overflow-hidden bg-void text-pure">
      {/* Nebula gradient backdrop, fixed under everything */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-nebula-radial"
      />
      {/* Subtle scanline */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-px bg-cyan/30 animate-scan"
        style={{ opacity: 0.15 }}
      />

      <Navigation />

      <main className="relative z-10 pt-16">{children}</main>

      <Footer />
    </div>
  );
}
