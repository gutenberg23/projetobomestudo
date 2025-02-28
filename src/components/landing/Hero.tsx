
import React from "react";

export const Hero = () => {
  return (
    <div className="w-full px-2.5 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#272f3c] leading-tight">
            Estude de graça! Qual a desculpa agora?
          </h1>
          <p className="text-lg text-[#67748a]">
            Você pode alcançar o sonho de passar em um concurso público e adquirir a tão sonhada estabilidade financeira.
          </p>
          <button className="bg-[#ea2be2] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors">
            Quero Começar Agora!
          </button>
        </div>
        <div className="flex-1">
          <img
            src="/lovable-uploads/98b03e84-986d-4ef1-955d-f92b9422fc94.png"
            alt="Estudante estudando"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
