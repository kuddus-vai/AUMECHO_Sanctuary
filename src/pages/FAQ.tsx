import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";

const FAQS = [
  {
    q: "What is AUMECHO?",
    a: "AUMECHO is a lofi music project producing long-form mixes, shorts, and curated playlists for studying, working, and slow living.",
  },
  {
    q: "Where can I listen?",
    a: "All of our music is on YouTube — start at the home page or browse our Series and Archive sections. Streaming on Spotify and Apple Music is on the way.",
  },
  {
    q: "Can I use AUMECHO music in my videos or streams?",
    a: "Our tracks are protected by copyright. For personal-use background play in a stream you're typically fine, but for any commercial reuse, monetised video, or paid project, please contact us first for a licensing arrangement.",
  },
  {
    q: "Do you accept submissions or collaborations?",
    a: "Yes. If you produce lofi or chill instrumental music and want to be featured, reach out via Facebook DM with a link to your work.",
  },
  {
    q: "How often do you release new mixes?",
    a: "We aim to release at least one new long-form mix every week, plus shorts in between. Subscribe on YouTube or join our newsletter on the Community page.",
  },
  {
    q: "Where do your visuals come from?",
    a: "Most thumbnails and loops are produced in-house, sometimes in collaboration with independent illustrators we credit in the video description.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <RootLayout>
      <SEO
        title="FAQ — Common questions about AUMECHO"
        description="Answers to common questions about AUMECHO: licensing, submissions, where to listen, and more."
        jsonLd={jsonLd}
      />
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">// FAQ</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tightest text-pure sm:text-5xl">
            Frequently asked
          </h1>
          <p className="mt-4 text-base text-ghost sm:text-lg">
            Everything you might want to know about AUMECHO. Still curious?
            Reach out on Facebook.
          </p>
        </header>

        <div className="divide-y divide-[rgba(255,255,255,0.06)] border-y border-[rgba(255,255,255,0.06)]">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-cyan"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-medium tracking-tightest text-pure">
                    {f.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-ghost transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-cyan" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="pb-6 text-ghost">{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </RootLayout>
  );
}
