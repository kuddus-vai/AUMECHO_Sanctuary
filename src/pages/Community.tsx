import { useState } from "react";
import { Facebook, Instagram, Mail, Music, Youtube } from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CHANNELS = [
  {
    label: "YouTube",
    desc: "New mixes & series every week.",
    href: "https://www.youtube.com/@AUMECHO",
    Icon: Youtube,
  },
  {
    label: "Facebook",
    desc: "Updates, polls, and behind-the-scenes.",
    href: "https://www.facebook.com/aumecho.official",
    Icon: Facebook,
  },
  {
    label: "Instagram",
    desc: "Visuals, snippets, and studio life.",
    href: "https://www.instagram.com/aumecho.official",
    Icon: Instagram,
  },
  {
    label: "Spotify",
    desc: "Listen on the go (coming soon).",
    href: "#",
    Icon: Music,
  },
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
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
        <header className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">// COMMUNITY</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tightest text-pure sm:text-5xl">
            Find your people. Find your sound.
          </h1>
          <p className="mt-4 text-base text-ghost sm:text-lg">
            AUMECHO is more than a channel — it's a slow-listening community.
            Pick your favourite spot and join in.
          </p>
        </header>

        <section className="mt-14 grid gap-5 sm:grid-cols-2">
          {CHANNELS.map(({ label, desc, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 transition-all hover:border-[rgba(0,242,255,0.3)] hover:shadow-glow-sm"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgba(0,242,255,0.3)] text-cyan">
                <Icon size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tightest text-pure transition-colors group-hover:text-cyan">
                  {label}
                </h2>
                <p className="mt-1 text-sm text-ghost">{desc}</p>
              </div>
            </a>
          ))}
        </section>

        <section className="mt-16 rounded-xl border border-[rgba(0,242,255,0.2)] bg-[rgba(0,242,255,0.04)] p-8 sm:p-12">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-hud text-cyan">
            <Mail size={14} /> Newsletter
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tightest text-pure sm:text-3xl">
            Get new mixes the moment they drop.
          </h2>
          <p className="mt-2 text-ghost">
            One email per release. No noise. Unsubscribe anytime.
          </p>
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
