import { Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useChannelInfo } from "@/hooks/useChannelInfo";

const EXPLORE = [
  { label: "Blog", to: "/blog" },
  { label: "Community", to: "/community" },
  { label: "FAQ", to: "/faq" },
];

export function Footer() {
  const { stats } = useChannelInfo();
  const logoUrl = stats?.thumbnail;

  return (
    <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-10 sm:px-8 sm:py-12 md:grid-cols-3">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="AUMECHO"
              className="h-8 w-8 rounded-full border border-[rgba(0,242,255,0.3)] object-cover shadow-glow-sm"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-glow-sm" />
          )}
          <div>
            <div className="text-sm font-semibold tracking-tightest text-pure">AUMECHO</div>
            <div className="font-mono text-[10px] tracking-hud text-slate">
              © {new Date().getFullYear()} · Lofi for focused minds
            </div>
          </div>
        </div>

        <nav aria-label="Explore" className="flex flex-col gap-2">
          <h2 className="font-mono text-[10px] uppercase tracking-hud text-slate">Explore</h2>
          {EXPLORE.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className="text-sm text-ghost transition-colors hover:text-cyan"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 md:items-end">
          <h2 className="font-mono text-[10px] uppercase tracking-hud text-slate">Follow</h2>
          <div className="flex items-center gap-3">
            <SocialLink href="https://www.youtube.com/@AUMECHO" label="YouTube">
              <Youtube size={14} />
            </SocialLink>
            <SocialLink href="https://www.facebook.com/aumecho.official" label="Facebook">
              <Facebook size={14} />
            </SocialLink>
          </div>
          <a
            href="https://hightechenterprise.xyz"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-hud text-ghost hover:text-cyan"
          >
            Built by High Tech Enterprise
          </a>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] text-ghost transition-[color,border-color,box-shadow,background-color] duration-300 hover:text-pure hover:border-[rgba(0,242,255,0.4)] hover:bg-[rgba(0,242,255,0.06)] hover:shadow-glow-sm"
    >
      {children}
    </a>
  );
}
