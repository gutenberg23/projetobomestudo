
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#f6f8fa]/80 to-transparent z-10"></div>
      
      {/* Imagem de fundo em tamanho completo */}
      <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
        <img 
          alt="Student studying" 
          src="/lovable-uploads/343607f4-044c-4c9f-8cad-1ccc0760d766.jpg" 
          className="h-full w-full object-cover object-center"
        />
      </div>
      
      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 h-screen flex items-center relative z-20">
        <div className="w-full md:w-1/2 space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#272f3c] leading-tight">
            Estude de graça! <br />
            <span className="text-[#ea2be2]">Qual a desculpa agora?</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#67748a] max-w-lg">
            Você pode alcançar o sonho de passar em um concurso público e adquirir a tão sonhada estabilidade financeira.
          </p>
          
          <div className="pt-4">
            <Link to="/login">
              <Button className="text-white rounded-lg text-lg font-medium hover:bg-opacity-90 transition-all px-8 py-6 bg-[#ea2be2] hover:translate-y-[-2px]">
                Quero Começar Agora!
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Imagem para mobile */}
      <div className="md:hidden w-full h-64 mt-8">
        <img 
          alt="Student studying" 
          src="/lovable-uploads/343607f4-044c-4c9f-8cad-1ccc0760d766.jpg" 
          className="h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
};
