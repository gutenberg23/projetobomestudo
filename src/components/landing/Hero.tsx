
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export const Hero = () => {
  return <div className="w-full px-2.5 bg-white h-screen flex items-center">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 h-full">
        <div className="flex-1 space-y-6 py-[20px]">
          <h1 className="text-4xl md:text-5xl font-bold text-[#272f3c] leading-tight text-center md:text-left">
            Estude de graça! Qual a desculpa agora?
          </h1>
          <p className="text-lg text-[#67748a] text-center md:text-left">
            Você pode alcançar o sonho de passar em um concurso público e adquirir a tão sonhada estabilidade financeira.
          </p>
          <div className="flex justify-center md:justify-start">
            <Link to="/login">
              <Button className="text-white rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors px-6 inline-flex bg-primary-DEFAULT py-[25px]">
                Quero Começar Agora!
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 hidden md:flex items-center justify-center h-full">
          <img 
            alt="Student studying" 
            src="/lovable-uploads/343607f4-044c-4c9f-8cad-1ccc0760d766.jpg" 
            className="w-auto h-full max-h-[70vh] object-contain" 
          />
        </div>
      </div>
    </div>;
};
