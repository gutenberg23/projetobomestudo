import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="flex-grow px-4 md:px-8 w-full max-w-7xl mx-auto pt-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};
