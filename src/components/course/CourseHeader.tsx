
import React, { useState, useEffect } from "react";
import { Star, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CourseHeaderProps {
  courseId: string;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ courseId }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [courseTitle, setCourseTitle] = useState("Carregando...");
  const [courseInfo, setCourseInfo] = useState("");

  useEffect(() => {
    // Em um caso real, aqui você faria uma chamada para a API para buscar os detalhes do curso
    // Simulando uma busca de dados do curso com base no ID
    const fetchCourseData = () => {
      // Simulando dados
      const mockCourses = {
        "portugues": {
          title: "Português para Concursos",
          info: "Este curso contém 12 módulos e 48 aulas. Certificado disponível após conclusão de 80% do conteúdo. Material de apoio disponível para download."
        },
        "matematica": {
          title: "Matemática Financeira",
          info: "Este curso contém 8 módulos e 32 aulas. Certificado disponível após conclusão de 80% do conteúdo. Material de apoio disponível para download."
        },
        "direito": {
          title: "Direito Constitucional",
          info: "Este curso contém 15 módulos e 60 aulas. Certificado disponível após conclusão de 80% do conteúdo. Material de apoio disponível para download."
        },
        "default": {
          title: "Curso de Concurso",
          info: "Este curso contém múltiplos módulos e aulas. Certificado disponível após conclusão de 80% do conteúdo. Material de apoio disponível para download."
        }
      };

      // Obtendo o título do curso com base no ID (ou usando o padrão se não encontrar)
      const course = mockCourses[courseId as keyof typeof mockCourses] || mockCourses.default;
      setCourseTitle(course.title);
      setCourseInfo(course.info);
      
      // Simulando se o curso é favorito (para um caso real, isso viria do backend)
      setIsFavorite(courseId === "portugues" || courseId === "direito");
    };

    fetchCourseData();
  }, [courseId]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="w-full border-b border-[rgba(239,239,239,1)] bg-white">
      <div className="mx-auto flex min-w-60 w-full items-start justify-between flex-wrap py-[50px] px-[10px] md:px-[32px] bg-transparent">
        <div className="flex min-w-60 flex-col justify-center py-2.5 w-full md:w-auto md:flex-1">
          <div className="flex w-full max-w-[859px] gap-2.5 text-[35px] md:text-[35px] text-[24px] text-[rgba(38,47,60,1)] font-bold leading-[31px] items-center">
            <h1 className="inline-block w-auto">{courseTitle}</h1>
            <button onClick={toggleFavorite} className="flex items-center justify-center shrink-0">
              <Star className={`w-[30px] h-[30px] cursor-pointer ${isFavorite ? "fill-[#5f2ebe] text-[#5f2ebe]" : "text-gray-400"}`} />
            </button>
          </div>
          <div className="mt-2 text-left flex items-center gap-2">
            <span className="bg-[#ede7f9] text-sm px-3 py-1 rounded-full inline-block text-[#5f2ebe]">
              #{courseId}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ede7f9] cursor-pointer">
                    <Info className="w-3.5 h-3.5 text-[#5f2ebe]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white p-3 border border-[#5f2ebe]/20 shadow-lg rounded-md">
                  <p className="text-sm text-[#67748a]">{courseInfo}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col text-[17px] justify-center w-full md:w-[278px] py-[13px] mt-4 md:mt-0">
          <button className="flex items-center gap-2.5 justify-center px-5 py-4 rounded-[10px] text-white font-thin bg-gradient-to-r from-[#5f2ebe] to-[#7344d4] hover:shadow-lg hover:shadow-[#5f2ebe]/30 hover:-translate-y-1 transition-all border-b-4 border-[#491aa4]">
            <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/87eae3edb19d6590e38c55cc28e85559b7a359d44c6a2ea44df65f4dd696565f" alt="Certificate Icon" className="w-6" />
            Imprimir Certificado
          </button>
        </div>
      </div>
    </div>
  );
};
