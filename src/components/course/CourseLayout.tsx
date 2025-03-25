import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../layout/Header";
import { Footer } from "../layout/Footer";
import { CourseHeader } from "./CourseHeader";
import { CourseNavigation } from "./CourseNavigation";
import { SubjectsList } from "./SubjectsList";
import { ProgressPanel } from "./ProgressPanel";
import { EditorializedView } from "./EditorializedView";

export const CourseLayout = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState<'disciplinas' | 'edital' | 'simulados'>('disciplinas');
  const [isProgressVisible, setIsProgressVisible] = useState(true);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const [subjectsCount, setSubjectsCount] = useState<number>(0);
  const [subjectsData, setSubjectsData] = useState<any[]>([]);

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

  // Função para receber o número de disciplinas e os dados das disciplinas do componente SubjectsList
  const handleSubjectsCountChange = (count: number, data?: any[]) => {
    setSubjectsCount(count);
    if (data) {
      setSubjectsData(data);
      console.log("CourseLayout - Recebendo dados de disciplinas:", data.length);
    }
  };

  const showProgress = isProgressVisible;

  return (
    <div className="min-h-screen bg-[#f6f8fa]">
      <Header />
      <main className="pt-[88px]">
        <CourseHeader courseId={courseId || ''} />
        <CourseNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onProgressClick={handleProgressClick}
          isProgressVisible={isProgressVisible}
        />
        {activeTab === 'disciplinas' && (
          <div className="bg-[rgba(246,248,250,1)] flex w-full gap-5 py-0 flex-col xl:flex-row px-[10px] md:px-[32px]">
            <div className="flex-1">
              <SubjectsList onSubjectsCountChange={handleSubjectsCountChange} />
            </div>
            {showProgress && (
              <div ref={progressRef} className="w-full xl:min-w-[300px] xl:max-w-[400px] mb-10">
                <ProgressPanel subjectsFromCourse={subjectsData} />
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
