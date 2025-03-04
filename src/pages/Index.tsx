
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { StudentBenefits } from "@/components/landing/StudentBenefits";
import { TeacherBenefits } from "@/components/landing/TeacherBenefits";
import { FAQ } from "@/components/landing/FAQ";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { Newsletter } from "@/components/landing/Newsletter";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[88px]">
        <Hero />
        <StudentBenefits />
        <TeacherBenefits />
        <FAQ />
        <Testimonials />
        <PricingPlans />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};
export default Index;
