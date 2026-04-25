import { RootLayout } from "@/components/layout/RootLayout";
import { HeroHUD } from "@/components/sections/HeroHUD";
import { VideoArchive } from "@/components/sections/VideoArchive";
import { AboutSection } from "@/components/sections/AboutSection";

const Index = () => {
  return (
    <RootLayout>
      <HeroHUD />
      <VideoArchive />
      <AboutSection />
    </RootLayout>
  );
};

export default Index;
