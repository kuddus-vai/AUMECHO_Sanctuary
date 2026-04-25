import { Facebook, Youtube } from "lucide-react";
import { useChannelInfo } from "@/hooks/useChannelInfo";

export function Footer() {
  const { stats } = useChannelInfo();
  const logoUrl = stats?.thumbnail;

  return (
    <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="AUMECHO"
              className="h-7 w-7 rounded-full border border-[rgba(0,242,255,0.3)] object-cover shadow-glow-sm"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-glow-sm" />
          )}
          <span className="text-sm font-semibold tracking-tightest text-pure">AUMECHO</span>
          <span className="font-mono text-[10px] tracking-hud text-slate">© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-4">
          <SocialLink href="https://www.youtube.com/@AUMECHO" label="YouTube">
            <Youtube size={14} />
          </SocialLink>
          <SocialLink href="https://www.facebook.com/aumecho.official" label="Facebook">
            <Facebook size={14} />
          </SocialLink>
        </div>

        <div className="hidden font-mono text-[10px] tracking-hud text-ghost sm:block">
          BUILT WITH INTENTION.
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
