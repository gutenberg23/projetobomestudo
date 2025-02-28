
import React, { useState } from "react";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { CourseHeader } from "./CourseHeader";
import { CourseNavigation } from "./CourseNavigation";
import { SubjectsList } from "./SubjectsList";
import { ProgressPanel } from "./ProgressPanel";
import { EditorializedView } from "./EditorializedView";
import { Star } from "lucide-react";

export const CourseLayout = () => {
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'edital' | 'simulados'>('disciplinas');
  const [isProgressVisible, setIsProgressVisible] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const progressRef = React.useRef<HTMLDivElement>(null);
  
  const handleProgressClick = () => {
    setIsProgressVisible(!isProgressVisible);
    if (!isProgressVisible) {
      setTimeout(() => {
        progressRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[88px]">
        <div className="relative">
          <CourseHeader />
          <button 
            onClick={toggleFavorite}
            className="absolute top-4 right-8 text-yellow-400 hover:text-yellow-500"
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star className={`w-8 h-8 ${isFavorite ? 'fill-yellow-400' : 'fill-none'}`} />
          </button>
        </div>
        <CourseNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onProgressClick={handleProgressClick} 
          isProgressVisible={isProgressVisible} 
        />
        {activeTab === 'disciplinas' && (
          <div className="bg-[rgba(246,248,250,1)] flex w-full gap-5 px-2.5 py-0 flex-col md:flex-row">
            <div className="flex-1">
              <SubjectsList />
            </div>
            {isProgressVisible && (
              <div ref={progressRef} className="w-full md:min-w-[300px] md:max-w-[400px] mb-10">
                <ProgressPanel />
              </div>
            )}
          </div>
        )}
        {(activeTab === 'edital' || activeTab === 'simulados') && (
          <div className="bg-[rgba(246,248,250,1)] w-full">
            <EditorializedView activeTab={activeTab} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
