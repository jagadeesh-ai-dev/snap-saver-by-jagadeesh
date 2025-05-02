
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import FacebookPage from "./pages/Facebook";
import InstagramPage from "./pages/Instagram";
import TwitterPage from "./pages/Twitter";
import YouTubePage from "./pages/YouTube";
import PinterestPage from "./pages/Pinterest";
import TikTokPage from "./pages/TikTok";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/facebook" element={<FacebookPage />} />
            <Route path="/instagram" element={<InstagramPage />} />
            <Route path="/twitter" element={<TwitterPage />} />
            <Route path="/youtube" element={<YouTubePage />} />
            <Route path="/pinterest" element={<PinterestPage />} />
            <Route path="/tiktok" element={<TikTokPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
