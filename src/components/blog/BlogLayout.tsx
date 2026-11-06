import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-[10px] md:px-[32px] pt-6 md:pt-8 pb-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};
