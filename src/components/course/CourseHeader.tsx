
import React, { useState } from "react";
import { Star } from "lucide-react";

export const CourseHeader = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  // ID do curso (simulado para demonstração)
  const courseId = "12345";

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return <div className="bg-white w-full border-b border-[rgba(239,239,239,1)]">
      <div className="flex min-w-60 w-full items-center justify-between flex-wrap px-2.5 py-[50px] max-w-7xl mx-auto">
        <div className="flex min-w-60 flex-col justify-center py-2.5 w-full md:w-auto">
          <div className="flex w-full items-center gap-2.5 text-[35px] md:text-[35px] text-[24px] text-[rgba(38,47,60,1)] font-bold leading-[31px]">
            <span className="bg-[#FFDEE2] text-[#272f3c] text-base px-3 py-1 rounded-full">
              #{courseId}
            </span>
            <h1 className="flex-1">Título do Curso - Loren Ipsun Dolor</h1>
            <button 
              onClick={toggleFavorite}
              className="flex items-center justify-center"
            >
              <Star 
                className={`w-[30px] h-[30px] cursor-pointer ${isFavorite ? "fill-[#ea2be2] text-[#ea2be2]" : "text-gray-400"}`} 
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col text-[17px] justify-center w-full md:w-auto md:ml-auto py-[13px] mt-4 md:mt-0">
          <button className="bg-[rgba(241,28,227,1)] flex items-center gap-2.5 justify-center px-5 py-4 rounded-[10px] text-white">
            <img src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/87eae3edb19d6590e38c55cc28e85559b7a359d44c6a2ea44df65f4dd696565f" alt="Certificate Icon" className="w-6" />
            Imprimir Certificado
          </button>
        </div>
      </div>
    </div>;
};
