
import React from "react";

export const SecondHero = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c]">
            Todos os recursos incríveis
          </h2>
          <p className="text-[#67748a]">
            Acesse milhares de questões, videoaulas, resumos e simulados. Estude com os melhores materiais e professores para conquistar sua aprovação em concursos públicos.
          </p>
          <a href="#" className="text-[#ea2be2] flex items-center gap-2 hover:underline">
            Ver todos os recursos
            <span className="text-xl">→</span>
          </a>
        </div>
        <div className="flex-1">
          <img
            src="/lovable-uploads/94836d04-1225-493e-a113-36572286edcd.png"
            alt="Recursos em destaque"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
