import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Benefits } from "@/components/landing/Benefits";
import { FAQ } from "@/components/landing/FAQ";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { Newsletter } from "@/components/landing/Newsletter";
import { ConcursoPreview } from "@/components/landing/ConcursoPreview";
import { PublicLayout } from "@/components/layout/PublicLayout";

const Index = () => {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Hero />
          <Stats />
          <Features />
          <Benefits />
          <ConcursoPreview />
          <Testimonials />
          <FAQ />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default Index;