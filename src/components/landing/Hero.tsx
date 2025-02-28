import React from "react";
export const Hero = () => {
  return <div className="w-full px-2.5 bg-white md:py-0 pt-[58px] pb-[0px]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-6 justify-center grid">
          <h1 className="text-4xl md:text-5xl font-bold text-[rgba(38,47,60,1)] leading-tight text-center">
            Estude de graça! Qual a desculpa agora?
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Você pode alcançar o sonho de passar em um concurso público e adquirir a tão sonhada estabilidade financeira.
          </p>
          <button className="bg-[rgba(241,28,227,1)] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors text-center">
            Quero Começar Agora!
          </button>
        </div>
        <div className="flex-1">
          <img alt="Student studying" src="/lovable-uploads/343607f4-044c-4c9f-8cad-1ccc0760d766.jpg" className="w-full h-auto rounded-lg object-scale-down" />
        </div>
      </div>
    </div>;
};