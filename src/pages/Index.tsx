import { RootLayout } from "@/components/layout/RootLayout";
import { SEO } from "@/components/seo/SEO";
import { HeroHUD } from "@/components/sections/HeroHUD";
import { PlaylistsShelf } from "@/components/sections/PlaylistsShelf";
import { ShortsShelf } from "@/components/sections/ShortsShelf";
import { VideoArchive } from "@/components/sections/VideoArchive";
import { AboutSection } from "@/components/sections/AboutSection";

const SITE = "https://aumecho.hightechenterprise.xyz";

const Index = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "AumEcho",
      url: SITE,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "AumEcho",
      url: SITE,
      logo: `${SITE}/placeholder.svg`,
    },
  ];

  return (
    <RootLayout>
      <SEO
        title="AumEcho — Sanskrit Mantras & Vedic Chants for Meditation"
        description="Sanskrit mantras, Hindi bhajans, and Vedic chants for meditation, healing, focus, and bhakti — including powerful 108x repetitions."
        canonical={`${SITE}/`}
        jsonLd={jsonLd}
      />
      <HeroHUD />
      <ShortsShelf />
      <PlaylistsShelf />
      <VideoArchive />
      <AboutSection />
    </RootLayout>
  );
};

export default Index;
