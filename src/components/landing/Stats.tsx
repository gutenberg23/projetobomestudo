
import React from "react";

export const Stats = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <p className="text-xl md:text-2xl text-[#67748a]">
          A plataforma mais completa de estudos para concursos públicos, com milhares de questões e conteúdos atualizados para sua aprovação.
        </p>
      </div>
      <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8">
        <div className="text-center">
          <div className="text-[#ea2be2] text-4xl md:text-5xl font-bold mb-2">1,3M</div>
          <p className="text-[#67748a]">de questões para você praticar</p>
        </div>
        <div className="text-center">
          <div className="text-[#ea2be2] text-4xl md:text-5xl font-bold mb-2">+165k</div>
          <p className="text-[#67748a]">vagas disponíveis em concursos públicos em 2025</p>
        </div>
        <div className="text-center">
          <div className="text-[#ea2be2] text-4xl md:text-5xl font-bold mb-2">97%</div>
          <p className="text-[#67748a]">dos aprovados usaram nossa plataforma</p>
        </div>
      </div>
    </div>
  );
};
