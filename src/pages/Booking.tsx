import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Loader2,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TourDate = {
  id: string;
  event_date: string;
  venue: string;
  city: string;
  country: string | null;
  ticket_url: string | null;
  status: string;
};

const TIERS = [
  {
    name: "Intimate Set",
    duration: "60 min",
    range: "€2k – €5k",
    blurb: "Lounges, listening rooms, brand activations.",
    includes: [
      "Solo performance + ambient visuals",
      "Travel within EU included",
      "Up to 150 guests",
    ],
  },
  {
    name: "Club Show",
    duration: "90 min",
    range: "€6k – €12k",
    blurb: "Late-night venues, after-hours, boutique clubs.",
    includes: [
      "Full live set with hardware rig",
      "VJ + reactive light cues",
      "Up to 800 capacity",
    ],
    featured: true,
  },
  {
    name: "Festival Headline",
    duration: "75–120 min",
    range: "On request",
    blurb: "Main / second stage festival slots worldwide.",
    includes: [
      "Custom production design",
      "Tech rider & advance support",
      "Press & content package",
    ],
  },
];

const PAST_SHOWS = [
  { title: "Berghain — Säule", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80" },
  { title: "Boiler Room Tokyo", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80" },
  { title: "Sónar Barcelona", img: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80" },
  { title: "Dekmantel Selectors", img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80" },
  { title: "Dimensions Festival", img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80" },
  { title: "Fabric London", img: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80" },
];

const FAQS = [
  {
    q: "What's included in your standard rider?",
    a: "A clean DJ booth or stage with 2x CDJ-3000 + DJM-A9, two booth monitors, FOH meeting 30 min before doors. Full rider sent after inquiry.",
  },
  {
    q: "How far in advance should I book?",
    a: "Club shows: 8–12 weeks lead time. Festivals: 4–6 months. Last-minute slots are possible if a window opens — get in touch.",
  },
  {
    q: "Do you handle travel and accommodation?",
    a: "Travel/lodging is on the promoter. For EU dates within 500 km of base we cover our own travel inside the Intimate tier fee.",
  },
  {
    q: "Can the set be recorded and released?",
    a: "Yes — recording and a multi-channel split can be added. Release rights are negotiated per booking.",
  },
  {
    q: "What deposit do you require?",
    a: "30% non-refundable deposit on contract signing, balance due 7 days before the show.",
  },
];

const BookingSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  event_type: z.string().max(80).optional().or(z.literal("")),
  venue: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  expected_attendance: z.string().max(40).optional().or(z.literal("")),
  budget_range: z.string().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a bit more (10+ chars)").max(2000),
});

type BookingInput = z.infer<typeof BookingSchema>;

const EMPTY: BookingInput = {
  name: "",
  email: "",
  phone: "",
  event_date: "",
  event_type: "",
  venue: "",
  city: "",
  expected_attendance: "",
  budget_range: "",
  message: "",
};

export default function Booking() {
  const [tour, setTour] = useState<TourDate[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let active = true;
    supabase
      .from("tour_dates")
      .select("id,event_date,venue,city,country,ticket_url,status")
      .eq("is_published", true)
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        if (active && data) setTour(data as TourDate[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      name: "AUMECHO",
      url: typeof window !== "undefined" ? window.location.href : undefined,
      event: tour.map((t) => ({
        "@type": "MusicEvent",
        name: `AUMECHO at ${t.venue}`,
        startDate: t.event_date,
        location: {
          "@type": "Place",
          name: t.venue,
          address: [t.city, t.country].filter(Boolean).join(", "),
        },
        offers: t.ticket_url
          ? { "@type": "Offer", url: t.ticket_url, availability: "https://schema.org/InStock" }
          : undefined,
      })),
    }),
    [tour],
  );

  return (
    <RootLayout>
      <SEO
        title="Book AUMECHO Live — Concert & Festival Booking"
        description="Book AUMECHO for clubs, festivals, and private events. Upcoming tour dates, performance packages, and inquiry form."
        jsonLd={jsonLd}
      />

      <Hero />
      <UpcomingShows tour={tour} />
      <Tiers />
      <PastShows />
      <BookingForm />
      <Faq openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <PressCta />
    </RootLayout>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-mono text-[11px] uppercase tracking-hud text-cyan"
      >
        // Live booking
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tightest text-pure sm:text-7xl"
      >
        Book AUMECHO <span className="text-cyan">live.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="mt-6 max-w-2xl text-lg text-ghost sm:text-xl"
      >
        Long-form ambient lofi performed live — for clubs, listening rooms,
        festivals, and bespoke brand moments. Hardware rig, reactive visuals,
        full tech advance.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="mt-10 flex flex-wrap items-center gap-4"
      >
        <a
          href="#inquire"
          className="group inline-flex items-center gap-2 rounded-full border border-cyan/50 bg-cyan/10 px-6 py-3 font-mono text-[12px] uppercase tracking-hud text-cyan shadow-glow-sm transition-all hover:bg-cyan/20 hover:shadow-glow-md"
        >
          Start a booking inquiry
          <Send size={14} className="transition-transform group-hover:translate-x-0.5" />
        </a>
        <a
          href="#tour"
          className="font-mono text-[12px] uppercase tracking-hud text-ghost transition-colors hover:text-pure"
        >
          See upcoming dates →
        </a>
      </motion.div>
    </section>
  );
}

/* ---------------- Upcoming Shows ---------------- */
function UpcomingShows({ tour }: { tour: TourDate[] }) {
  return (
    <section id="tour" className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeader eyebrow="// Tour" title="Upcoming shows" />
      {tour.length === 0 ? (
        <p className="mt-8 text-ghost">New dates announced soon — join the inquiry list above.</p>
      ) : (
        <ul className="mt-10 divide-y divide-[rgba(255,255,255,0.06)] border-y border-[rgba(255,255,255,0.06)]">
          {tour.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-1 items-center gap-4 py-6 sm:grid-cols-[180px_1fr_140px_auto]"
            >
              <div className="flex items-center gap-3 font-mono text-sm text-cyan">
                <CalendarDays size={16} />
                {new Date(t.event_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </div>
              <div>
                <div className="text-lg font-medium tracking-tightest text-pure">{t.venue}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-sm text-ghost">
                  <MapPin size={12} />
                  {[t.city, t.country].filter(Boolean).join(", ")}
                </div>
              </div>
              <StatusBadge status={t.status} />
              {t.ticket_url ? (
                <a
                  href={t.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.15)] px-5 py-2 font-mono text-[11px] uppercase tracking-hud text-pure transition-colors hover:border-cyan/50 hover:text-cyan"
                >
                  Tickets <ExternalLink size={12} />
                </a>
              ) : (
                <span className="font-mono text-[11px] uppercase tracking-hud text-ghost">
                  Soon
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    on_sale: { label: "On sale", cls: "border-cyan/40 text-cyan bg-cyan/5" },
    few_left: { label: "Few left", cls: "border-amber-400/40 text-amber-300 bg-amber-400/5" },
    sold_out: { label: "Sold out", cls: "border-[rgba(255,255,255,0.2)] text-ghost" },
    announced: { label: "Announced", cls: "border-[rgba(255,255,255,0.15)] text-pure" },
  };
  const m = map[status] ?? map.announced;
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-hud ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

/* ---------------- Pricing tiers ---------------- */
function Tiers() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeader eyebrow="// Packages" title="Performance tiers" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TIERS.map((t) => (
          <motion.div
            key={t.name}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={`relative flex flex-col rounded-2xl border p-7 ${
              t.featured
                ? "border-cyan/40 bg-cyan/[0.03] shadow-glow-sm"
                : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]"
            }`}
          >
            {t.featured && (
              <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full border border-cyan/50 bg-void px-3 py-1 font-mono text-[10px] uppercase tracking-hud text-cyan">
                <Sparkles size={11} /> Most booked
              </span>
            )}
            <div className="font-mono text-[11px] uppercase tracking-hud text-ghost">
              {t.duration}
            </div>
            <h3 className="mt-2 text-2xl font-semibold tracking-tightest text-pure">{t.name}</h3>
            <div className="mt-1 text-lg text-cyan">{t.range}</div>
            <p className="mt-3 text-sm text-ghost">{t.blurb}</p>
            <ul className="mt-6 space-y-2.5 text-sm text-pure/90">
              {t.includes.map((it) => (
                <li key={it} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan shadow-glow-sm" />
                  {it}
                </li>
              ))}
            </ul>
            <a
              href="#inquire"
              className="mt-7 inline-flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] py-2.5 font-mono text-[11px] uppercase tracking-hud text-pure transition-colors hover:border-cyan/50 hover:text-cyan"
            >
              Inquire about this tier
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Past shows gallery ---------------- */
function PastShows() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeader eyebrow="// Past performances" title="Where we've played" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {PAST_SHOWS.map((s, i) => (
          <motion.figure
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)]"
          >
            <img
              src={s.img}
              alt={s.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent opacity-80" />
            <figcaption className="absolute inset-x-0 bottom-0 p-3 font-mono text-[10px] uppercase tracking-hud text-pure">
              {s.title}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Booking form ---------------- */
function BookingForm() {
  const [values, setValues] = useState<BookingInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof BookingInput>(k: K, v: BookingInput[K]) {
    setValues((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = BookingSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Partial<Record<keyof BookingInput, string>> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof BookingInput;
        if (!fe[k]) fe[k] = i.message;
      });
      setErrors(fe);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    const payload = {
      ...parsed.data,
      phone: parsed.data.phone || null,
      event_date: parsed.data.event_date || null,
      event_type: parsed.data.event_type || null,
      venue: parsed.data.venue || null,
      city: parsed.data.city || null,
      expected_attendance: parsed.data.expected_attendance || null,
      budget_range: parsed.data.budget_range || null,
    };
    const { error } = await supabase.from("booking_inquiries").insert(payload);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send inquiry. Please try again.");
      return;
    }
    setSubmitted(true);
    setValues(EMPTY);
    toast.success("Inquiry sent — we'll be in touch within 48h.");
  }

  if (submitted) {
    return (
      <section id="inquire" className="mx-auto max-w-3xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-10 text-center shadow-glow-sm">
          <Sparkles className="mx-auto text-cyan" size={28} />
          <h2 className="mt-5 text-3xl font-semibold tracking-tightest text-pure">
            Inquiry received.
          </h2>
          <p className="mt-3 text-ghost">
            Thanks — we read every message and reply within 48 hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 font-mono text-[11px] uppercase tracking-hud text-cyan hover:text-pure"
          >
            Send another →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="inquire" className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeader eyebrow="// Inquire" title="Tell us about the show" />
      <p className="mt-4 text-ghost">
        Share the basics and we'll come back with availability, tech, and
        pricing within 48 hours.
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-5 sm:grid-cols-2" noValidate>
        <Field label="Your name *" error={errors.name}>
          <Input value={values.name} onChange={(v) => update("name", v)} />
        </Field>
        <Field label="Email *" error={errors.email}>
          <Input type="email" value={values.email} onChange={(v) => update("email", v)} />
        </Field>
        <Field label="Phone">
          <Input value={values.phone ?? ""} onChange={(v) => update("phone", v)} />
        </Field>
        <Field label="Event date">
          <Input type="date" value={values.event_date ?? ""} onChange={(v) => update("event_date", v)} />
        </Field>
        <Field label="Event type">
          <Select
            value={values.event_type ?? ""}
            onChange={(v) => update("event_type", v)}
            options={["", "Club show", "Festival", "Private event", "Brand activation", "Listening room", "Other"]}
          />
        </Field>
        <Field label="Expected attendance">
          <Select
            value={values.expected_attendance ?? ""}
            onChange={(v) => update("expected_attendance", v)}
            options={["", "<150", "150–500", "500–1500", "1500–5000", "5000+"]}
          />
        </Field>
        <Field label="Venue">
          <Input value={values.venue ?? ""} onChange={(v) => update("venue", v)} />
        </Field>
        <Field label="City">
          <Input value={values.city ?? ""} onChange={(v) => update("city", v)} />
        </Field>
        <Field label="Budget range">
          <Select
            value={values.budget_range ?? ""}
            onChange={(v) => update("budget_range", v)}
            options={["", "Under €5k", "€5k – €12k", "€12k – €25k", "€25k+", "Let's discuss"]}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Tell us about the show *" error={errors.message}>
            <textarea
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-pure outline-none transition-colors placeholder:text-ghost/50 focus:border-cyan/50"
              placeholder="Vibe, audience, stage details, anything else we should know."
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full border border-cyan/50 bg-cyan/10 px-7 py-3 font-mono text-[12px] uppercase tracking-hud text-cyan shadow-glow-sm transition-all hover:bg-cyan/20 hover:shadow-glow-md disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Sending
              </>
            ) : (
              <>
                Send inquiry <Send size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-hud text-ghost">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-pure outline-none transition-colors placeholder:text-ghost/50 focus:border-cyan/50"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-pure outline-none transition-colors focus:border-cyan/50"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-void">
          {o || "Select…"}
        </option>
      ))}
    </select>
  );
}

/* ---------------- FAQ ---------------- */
function Faq({
  openFaq,
  setOpenFaq,
}: {
  openFaq: number | null;
  setOpenFaq: (v: number | null) => void;
}) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <SectionHeader eyebrow="// Booking FAQ" title="Common questions" />
      <div className="mt-10 divide-y divide-[rgba(255,255,255,0.06)] border-y border-[rgba(255,255,255,0.06)]">
        {FAQS.map((f, i) => {
          const isOpen = openFaq === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-cyan"
                aria-expanded={isOpen}
              >
                <span className="text-lg font-medium tracking-tightest text-pure">{f.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-ghost transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-cyan" : ""
                  }`}
                />
              </button>
              {isOpen && <p className="pb-6 text-ghost">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Press CTA ---------------- */
function PressCta() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-10 text-center sm:p-14">
        <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">// Press & partnerships</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tightest text-pure sm:text-4xl">
          Working on something else?
        </h3>
        <p className="mx-auto mt-4 max-w-xl text-ghost">
          Sync, brand collaboration, or press request — reach out directly.
        </p>
        <a
          href="mailto:hello@aumecho.com"
          className="mt-6 inline-block font-mono text-[12px] uppercase tracking-hud text-cyan hover:text-pure"
        >
          hello@aumecho.com →
        </a>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-hud text-cyan">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tightest text-pure sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
