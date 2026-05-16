import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { VideoModal } from "@/components/ui/VideoModal";
import { PageTransition } from "@/components/ui/PageTransition";
import { ModalProvider } from "@/store/modalStore";
import { HoverAudioProvider } from "@/components/audio/HoverAudioProvider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import PlaylistDetail from "./pages/PlaylistDetail.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Community from "./pages/Community.tsx";
import FAQ from "./pages/FAQ.tsx";
import Auth from "./pages/Auth.tsx";
import Founder from "./pages/Founder.tsx";
import Booking from "./pages/Booking.tsx";
import BlogAdmin from "./pages/admin/BlogAdmin.tsx";
import BlogEditor from "./pages/admin/BlogEditor.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ModalProvider>
          <HoverAudioProvider>
            <CustomCursor />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/playlists/:id" element={<PlaylistDetail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/founder" element={<Founder />} />
                  <Route path="/booking" element={<Booking />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin/blog" element={<BlogAdmin />} />
                  <Route path="/admin/blog/:id" element={<BlogEditor />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </BrowserRouter>
            <VideoModal />
          </HoverAudioProvider>
        </ModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
