import { useState } from "react";
import { Facebook, Heart, Instagram, Mail, MessageCircle, Music, Music2, Pin, Sparkles, Youtube } from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CHANNELS = [
  { label: "YouTube", desc: "New mixes & series every week.", href: "https://www.youtube.com/@AUMECHO", Icon: Youtube },
  { label: "Facebook", desc: "Updates, polls, behind-the-scenes.", href: "https://www.facebook.com/aumecho.official", Icon: Facebook },
  { label: "Instagram", desc: "Visuals, snippets, studio life.", href: "https://www.instagram.com/aumecho.official", Icon: Instagram },
  { label: "TikTok", desc: "Short clips and moments.", href: "https://www.tiktok.com/@aum.echo", Icon: Music2 },
  { label: "Spotify", desc: "Listen on the go (soon).", href: "#", Icon: Music },
];

const FEED = [
  { author: "Ananya R.", time: "2h", body: "The new Bhajan mix put my whole evening on a different frequency. Thank you 🙏", likes: 42 },
  { author: "Karan M.", time: "5h", body: "Anyone else loop the Aarti series while working? It's become my focus ritual.", likes: 28 },
  { author: "Priya S.", time: "1d", body: "Heard the Gita reading at 4am — woke up calm for the first time in weeks.", likes: 117 },
  { author: "Devansh", time: "2d", body: "Suggestion: a long-form Kirtan playlist for travel? Pretty please.", likes: 19 },
  { author: "Meera K.", time: "3d", body: "The visuals on the latest short are unreal. Who's behind the art?", likes: 64 },
];

const FEATURED = {
  tag: "Editor's pick",
  title: "Sunrise Bhajan — 108 min meditation",
  body: "A continuous flow recorded at Rishikesh, designed to anchor your morning practice without a single break.",
  meta: "12,840 listens this week",
};

const RECENT = [
  { kind: "Mix", title: "Twilight Mantra Vol. 4", time: "Today" },
  { kind: "Short", title: "Behind the Aarti sessions", time: "Yesterday" },
  { kind: "Blog", title: "Why slow listening matters", time: "2 days ago" },
  { kind: "Mix", title: "Monsoon Kirtan Live", time: "5 days ago" },
  { kind: "Short", title: "Studio diary — week 12", time: "1 week ago" },
];

export default function Community() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    const { error } = await supabase.from("subscribers").insert({ email });
    setSubmitting(false);
    if (error) {
      const msg = error.message.includes("duplicate")
        ? "You're already subscribed."
        : "Something went wrong. Try again.";
      toast({ title: msg, variant: "destructive" });
      return;
    }
    setEmail("");
    toast({ title: "Subscribed", description: "Welcome to the AUMECHO community." });
  };

  return (
    <RootLayout>
      <SEO
        title="Community — Join the AUMECHO listening circle"
        description="Join the AUMECHO community: subscribe on YouTube, follow on social, and get new releases in your inbox."
      />
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <header className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">// COMMUNITY</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tightest text-pure sm:text-5xl">
            Find your people. Find your sound.
          </h1>
          <p className="mt-4 text-base text-ghost sm:text-lg">
            AUMECHO is more than a channel — it's a slow-listening community.
          </p>
        </header>

        {/* 3-column: Feed · Featured · Recent */}
        <section className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* FEED */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
              <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-hud text-cyan">
                <MessageCircle size={12} /> Feed
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-hud text-slate">Live</span>
            </div>
            <ul className="mt-4 space-y-4">
              {FEED.map((p) => (
                <li key={p.author + p.time} className="rounded-lg border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.015)] p-4 transition-colors hover:border-[rgba(0,242,255,0.2)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-pure">{p.author}</span>
                    <span className="font-mono text-[10px] uppercase tracking-hud text-slate">{p.time}</span>
                  </div>
                  <p className="mt-2 text-sm text-ghost">{p.body}</p>
                  <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-hud text-slate">
                    <Heart size={11} className="text-cyan" /> {p.likes}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* FEATURED */}
          <div className="rounded-xl border border-[rgba(0,242,255,0.2)] bg-[rgba(0,242,255,0.04)] p-6 shadow-glow-sm">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-hud text-cyan">
              <Sparkles size={12} /> Featured
            </h2>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-[rgba(0,242,255,0.2)] bg-gradient-to-br from-cyan/20 via-void to-void" />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-hud text-cyan">{FEATURED.tag}</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tightest text-pure">{FEATURED.title}</h3>
            <p className="mt-2 text-sm text-ghost">{FEATURED.body}</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-hud text-slate">{FEATURED.meta}</p>
            <button className="mt-5 w-full rounded-md bg-cyan px-4 py-2.5 font-mono text-[11px] uppercase tracking-hud text-void transition-opacity hover:opacity-90">
              Listen now
            </button>
          </div>

          {/* RECENT */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-hud text-cyan">
              <Pin size={12} /> Recent
            </h2>
            <ul className="mt-4 space-y-3">
              {RECENT.map((r) => (
                <li key={r.title} className="group flex items-start justify-between gap-3 border-b border-[rgba(255,255,255,0.04)] pb-3 last:border-0">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-hud text-cyan">{r.kind}</p>
                    <p className="mt-1 text-sm text-pure transition-colors group-hover:text-cyan">{r.title}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-hud text-slate">{r.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-hud text-slate">Follow</p>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] text-ghost transition-colors hover:border-[rgba(0,242,255,0.4)] hover:text-cyan"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-12 rounded-xl border border-[rgba(0,242,255,0.2)] bg-[rgba(0,242,255,0.04)] p-8 sm:p-12">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-hud text-cyan">
            <Mail size={14} /> Newsletter
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tightest text-pure sm:text-3xl">
            Get new mixes the moment they drop.
          </h2>
          <p className="mt-2 text-ghost">One email per release. No noise. Unsubscribe anytime.</p>
          <form onSubmit={subscribe} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-md border border-[rgba(255,255,255,0.1)] bg-void px-4 py-3 text-pure placeholder:text-slate focus:border-cyan focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-cyan px-6 py-3 font-mono text-[11px] uppercase tracking-hud text-void transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </section>
      </div>
    </RootLayout>
  );
}
