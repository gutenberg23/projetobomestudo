
import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa] overflow-x-hidden">
      <Header />
      <main className="flex-grow pt-[120px] px-3 sm:px-4 md:px-6 w-full max-w-7xl mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};
