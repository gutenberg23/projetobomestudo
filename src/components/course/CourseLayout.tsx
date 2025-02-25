
import React from "react";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { CourseHeader } from "./CourseHeader";
import { CourseNavigation } from "./CourseNavigation";
import { SubjectsList } from "./SubjectsList";
import { ProgressPanel } from "./ProgressPanel";

export const CourseLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[88px]">
        <CourseHeader />
        <CourseNavigation />
        <div className="bg-[rgba(246,248,250,1)] flex w-full gap-5 px-2.5 py-0 flex-col md:flex-row">
          <div className="flex-1">
            <SubjectsList />
          </div>
          <div className="w-full md:min-w-[300px] md:max-w-[400px]">
            <ProgressPanel />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
