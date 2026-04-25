import { RootLayout } from "@/components/layout/RootLayout";
import { HeroHUD } from "@/components/sections/HeroHUD";
import { PlaylistsShelf } from "@/components/sections/PlaylistsShelf";
import { ShortsShelf } from "@/components/sections/ShortsShelf";
import { VideoArchive } from "@/components/sections/VideoArchive";
import { AboutSection } from "@/components/sections/AboutSection";

const Index = () => {
  return (
    <RootLayout>
      <HeroHUD />
      <PlaylistsShelf />
      <VideoArchive />
      <ShortsShelf />
      <AboutSection />
    </RootLayout>
  );
};

export default Index;
