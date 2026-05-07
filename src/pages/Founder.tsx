import { motion } from "framer-motion";
import { ExternalLink, Music, Sparkles, ScrollText } from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import founderImg from "@/assets/shuvo-mistry.jpg";

const FB_URL = "https://www.facebook.com/shuvo.mistry.96/";

export default function Founder() {
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

          {/* Manifesto */}
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
    </RootLayout>
  );
}
