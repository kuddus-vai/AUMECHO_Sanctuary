import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Music, Sparkles, ScrollText, Play, ListMusic, X } from "lucide-react";
import { Link } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { usePlaylists } from "@/hooks/usePlaylists";
import type { Playlist } from "@/lib/types";
import founderImg from "@/assets/shuvo-mistry.jpg";

const FB_URL = "https://www.facebook.com/shuvo.mistry.96/";

export default function Founder() {
  const { playlists, loading } = usePlaylists();
  const featured = playlists.slice(0, 5);
  const [previewing, setPreviewing] = useState<Playlist | null>(null);

  useEffect(() => {
    if (!previewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreviewing(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [previewing]);


  return (
    <RootLayout>
      <SEO
        title="Shuvo Mistry — Founder of AUMECHO"
        description="Shuvo Mistry, the heart behind AUMECHO, recreates lost Sanatan scriptures and ancient knowledge as music to spread divinity to as many souls as possible."
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Shuvo Mistry",
          jobTitle: "Founder, AUMECHO",
          sameAs: [FB_URL],
          description:
            "Founder of AUMECHO. Recreates ancient Sanatan scriptures as music and song.",
        }}
      />

      <section className="relative pt-32 pb-24">
        {/* ambient backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 20%, rgba(0,242,255,0.08), transparent 70%), radial-gradient(50% 40% at 80% 60%, rgba(255,153,51,0.06), transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          {/* Hero */}
          <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[420px]"
            >
              <div
                aria-hidden
                className="absolute -inset-4 -z-10 rounded-[2rem] blur-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,242,255,0.25), rgba(255,153,51,0.18))",
                }}
              />
              <img
                src={founderImg}
                alt="Shuvo Mistry, founder of AUMECHO"
                className="aspect-square w-full rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] object-cover shadow-2xl"
                loading="eager"
              />
              <div className="mt-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-hud text-ghost">
                <span>FOUNDER · AUMECHO</span>
                <span className="text-cyan">∞ AUM</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">
                The mind behind the echo
              </p>
              <h1 className="mt-3 text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[0.95] tracking-tightest text-pure">
                Shuvo <span className="italic text-ghost">Mistry</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ghost">
                One vision — to spread divinity to as many people as he can.
                Shuvo carries that mission from the core of himself, weaving
                forgotten Sanatan wisdom into sound that any modern ear can
                receive.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={FB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,242,255,0.4)] bg-cyan/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-hud text-pure transition-colors hover:bg-cyan/20"
                >
                  Connect on Facebook <ExternalLink size={12} />
                </a>
                <a
                  href="/#playlists"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.1)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-hud text-ghost transition-colors hover:text-pure hover:border-[rgba(255,255,255,0.2)]"
                >
                  Listen to the work
                </a>
              </div>
            </motion.div>
          </div>

          {/* Pillars */}
          <div className="mt-28 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ScrollText,
                title: "Lost Scriptures, Reawakened",
                body: "He returns to the oldest layers of Sanatan thought — verses, mantras, and oral traditions that time tried to forget — and listens for what they still want to say.",
              },
              {
                icon: Music,
                title: "Scripture as Sound",
                body: "What was written on palm leaves becomes melody. Each AUMECHO release is a recreation: ancient creations rebuilt as music and song you can carry with you.",
              },
              {
                icon: Sparkles,
                title: "Divinity, Shared Freely",
                body: "His one motive is to spread divinity — not as doctrine, but as a feeling. The work goes out to as many minds as possible, asking nothing in return.",
              },
            ].map(({ icon: Icon, title, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-7 backdrop-blur-sm transition-colors hover:border-[rgba(0,242,255,0.25)]"
              >
                <Icon size={20} className="text-cyan" />
                <h3 className="mt-5 text-[18px] font-medium tracking-tight text-pure">
                  {title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ghost">
                  {body}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Listen — featured tracks & playlists */}
          <div className="mt-28">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">
                  Hear the work
                </p>
                <h2 className="mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] font-light tracking-tight text-pure">
                  Begin with these
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ghost">
                  A handful of AUMECHO playlists Shuvo points new listeners to
                  first — ancient verses, rebuilt as sound.
                </p>
              </div>
              <Link
                to="/#playlists"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-hud text-ghost transition-colors hover:text-pure"
              >
                All playlists <ListMusic size={12} />
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] animate-pulse rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]"
                    />
                  ))
                : featured.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.55, delay: i * 0.07 }}
                    >
                      <div className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] transition-colors hover:border-[rgba(0,242,255,0.3)]">
                        <button
                          type="button"
                          onClick={() => setPreviewing(p)}
                          aria-label={`Preview ${p.title}`}
                          className="block w-full text-left"
                        >
                          <div className="relative aspect-video overflow-hidden">
                            <img
                              src={p.thumbnail_url}
                              alt={p.title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan/60 bg-black/50 backdrop-blur-sm">
                                <Play size={18} className="ml-0.5 text-cyan" fill="currentColor" />
                              </span>
                            </div>
                            {p.is_featured && (
                              <span className="absolute left-3 top-3 rounded-full bg-cyan/20 px-2 py-1 font-mono text-[9px] uppercase tracking-hud text-cyan backdrop-blur-sm">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="line-clamp-2 text-[15px] font-medium leading-snug tracking-tight text-pure transition-colors group-hover:text-cyan">
                              {p.title}
                            </h3>
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-hud text-ghost">
                              {p.item_count} tracks · Tap to preview
                            </p>
                          </div>
                        </button>
                        <Link
                          to={`/playlists/${p.id}`}
                          className="absolute bottom-3 right-3 rounded-full border border-[rgba(255,255,255,0.1)] bg-black/50 px-3 py-1 font-mono text-[9px] uppercase tracking-hud text-ghost backdrop-blur-sm transition-colors hover:text-pure hover:border-cyan/50"
                        >
                          Open
                        </Link>
                      </div>

                    </motion.div>
                  ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.youtube.com/@aumecho"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,242,255,0.4)] bg-cyan/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-hud text-pure transition-colors hover:bg-cyan/20"
              >
                <Music size={12} /> Listen on YouTube <ExternalLink size={12} />
              </a>
            </div>
          </div>


          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-28 rounded-3xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(0,242,255,0.04)] to-[rgba(255,153,51,0.03)] p-10 sm:p-14"
          >
            <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">
              In his own pursuit
            </p>
            <blockquote className="mt-6 text-[clamp(1.5rem,3vw,2.25rem)] font-light leading-snug tracking-tight text-pure">
              “The old <span className="italic text-cyan">Sanatan</span>{" "}
              knowledge was never lost — it was waiting for the right
              frequency. Through AUMECHO, we tune ourselves back to it, one
              note at a time.”
            </blockquote>
            <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ghost">
              Shuvo spends most of his hours sitting with what the rishis left
              behind — Vedic chants, forgotten ragas, slokas that never made
              it into modern translation. He studies them not as artifacts,
              but as living instructions. Then he goes into the studio and
              lets them breathe again, this time in lofi textures, ambient
              washes, and slow rhythms suited to a restless generation.
            </p>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-ghost">
              That is what AUMECHO is — a single person's quiet attempt to
              hand divinity back to anyone willing to listen.
            </p>
          </motion.div>
        </div>
      </section>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {previewing && (
              <motion.div
                key="founder-preview-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setPreviewing(null)}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
                style={{
                  background: "rgba(5,5,7,0.92)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                <motion.div
                  key="founder-preview-shell"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.94, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.1)]"
                  style={{
                    background: "rgba(10,10,15,0.9)",
                    boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 40px rgba(0,242,255,0.05)",
                  }}
                >
                  <div className="flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.95)] px-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-2 py-[3px] font-mono text-[9px] uppercase tracking-hud text-ghost">
                        Playlist · {previewing.item_count} tracks
                      </span>
                      <h2 className="truncate text-sm font-medium tracking-tighter text-pure">
                        {previewing.title}
                      </h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href={`https://www.youtube.com/playlist?list=${previewing.youtube_playlist_id}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Open on YouTube"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-ghost transition-colors hover:border-[rgba(0,242,255,0.5)] hover:text-pure"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => setPreviewing(null)}
                        aria-label="Close"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-ghost transition-colors hover:border-[rgba(0,242,255,0.5)] hover:text-pure"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
                    <iframe
                      key={previewing.id}
                      title={previewing.title}
                      src={`https://www.youtube.com/embed/videoseries?list=${previewing.youtube_playlist_id}&autoplay=1&rel=0&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] p-5">
                    <p className="text-[13px] text-ghost">
                      Previewing inline — open the full playlist for the complete experience.
                    </p>
                    <Link
                      to={`/playlists/${previewing.id}`}
                      onClick={() => setPreviewing(null)}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,242,255,0.4)] bg-cyan/10 px-4 py-2 font-mono text-[10px] uppercase tracking-hud text-pure transition-colors hover:bg-cyan/20"
                    >
                      Open playlist
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </RootLayout>
  );
}
