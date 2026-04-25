import { motion, useInView, useReducedMotion, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { HudLabel } from "@/components/ui/HudLabel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useVideos } from "@/hooks/useVideos";

export function AboutSection() {
  const { videos } = useVideos();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  // Derived stats
  const videoCount = videos.length;
  const hoursOfMusic = Math.max(1, Math.round(videoCount * 0.85));
  const subscribers = 124000;

  return (
    <section
      id="about"
      ref={ref}
      className="relative z-10 mx-auto max-w-[1400px] px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="mb-12 flex items-center gap-3">
        <HudLabel>OPERATOR.NOTES</HudLabel>
        <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <h2 className="text-3xl font-light tracking-tightest text-pure sm:text-4xl lg:text-5xl">
            AUMECHO is a digital sanctuary
            <span className="block text-pure/55">
              for atmospheric music — slow,
            </span>
            <span className="block text-pure/55">deliberate, made for the quiet hours.</span>
          </h2>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-ghost">
            We publish lofi, ambient, and long-form mixes. Every transmission is
            mastered to be lived inside of — for working, drifting, or sleeping.
            No interruptions. No noise. Only signal.
          </p>

          <div className="mt-10">
            <MagneticButton
              data-cursor="pointer"
              onClick={() => window.open("https://youtube.com/", "_blank", "noreferrer")}
            >
              <span>SUBSCRIBE ON YOUTUBE</span>
              <ArrowUpRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
              />
            </MagneticButton>
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="lg:col-span-5"
        >
          <GlassCard className="p-7">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <HudLabel className="text-[9px]">CHANNEL.METRICS</HudLabel>
                <span className="font-mono text-[9px] tracking-hud text-cyan/70">LIVE</span>
              </div>

              <Counter label="Videos Published" value={videoCount} inView={inView} />
              <div className="h-px bg-[rgba(255,255,255,0.06)]" />
              <Counter label="Hours of Music" value={hoursOfMusic} inView={inView} suffix="h" />
              <div className="h-px bg-[rgba(255,255,255,0.06)]" />
              <Counter
                label="Subscribers"
                value={subscribers}
                inView={inView}
                formatter={(n) => {
                  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
                  return String(Math.round(n));
                }}
              />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}

function Counter({
  label,
  value,
  inView,
  suffix,
  formatter,
}: {
  label: string;
  value: number;
  inView: boolean;
  suffix?: string;
  formatter?: (n: number) => string;
}) {
  const [display, setDisplay] = useState("0");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(formatter ? formatter(value) : String(value));
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        setDisplay(formatter ? formatter(v) : String(Math.round(v)));
      },
    });
    return () => controls.stop();
  }, [inView, value, formatter, reduced]);

  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[10px] uppercase tracking-hud text-slate">{label}</span>
      <span className="text-3xl font-light tracking-tightest text-pure tabular-nums">
        {display}
        {suffix && <span className="ml-1 text-base text-ghost">{suffix}</span>}
      </span>
    </div>
  );
}
