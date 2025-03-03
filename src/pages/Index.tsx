
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { SecondHero } from "@/components/landing/SecondHero";
import { EmailCollection } from "@/components/landing/EmailCollection";
import { Subscription } from "@/components/landing/Subscription";

const Index = () => {
  return <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[88px]">
        <Hero />
        <Stats />
        <Features />
        <Subscription />
        <Testimonials />
        <SecondHero />
        <EmailCollection />
      </main>
      <Footer />
    </div>;
};
export default Index;
