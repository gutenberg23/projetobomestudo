
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart, Award } from "lucide-react";

export const Hero = () => {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Detalhes decorativos */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-[#f2f4f6] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-20 left-0 w-32 h-32 bg-[#f2f4f6] rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container px-4 md:px-6 mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-6">
            <div className="inline-flex px-4 py-2 rounded-full bg-[#f2f4f6] text-[#f52ebe] font-medium text-sm">
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Estudando para ser aprovado
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Conquiste sua 
              <span className="text-[#f52ebe] block">aprovação</span> 
              nos concursos públicos
            </h1>
            
            <p className="text-lg text-gray-600 max-w-lg">
              Estude gratuitamente com milhares de questões comentadas, 
              estatísticas de desempenho e aulas organizadas por editais.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <Link to="/login">
                <Button className="bg-[#f52ebe] hover:bg-[#f52ebe]/90 text-white px-8 py-6">
                  Começar agora
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" className="border-[#f52ebe] text-[#f52ebe] hover:bg-[#f52ebe]/5 px-8 py-6">
                  Explorar recursos
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100 mt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#f52ebe]">+1.3M</span>
                <span className="text-gray-500 text-sm">Questões disponíveis</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#f52ebe]">+5.000</span>
                <span className="text-gray-500 text-sm">Aulas gratuitas</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#f52ebe]">97%</span>
                <span className="text-gray-500 text-sm">Taxa de aprovação</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-full max-w-md overflow-hidden relative">
                <img 
                  src="/lovable-uploads/hero.svg" 
                  alt="Estudantes aprovados" 
                  className="w-full h-auto" 
                />
                
                <div className="absolute -bottom-2 -right-2 bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#c9ff33] p-2 rounded-full">
                      <BarChart className="w-5 h-5 text-gray-800" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Acompanhe seu progresso</p>
                      <p className="text-xs text-gray-500">Estatísticas detalhadas</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-2 -left-2 bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#f52ebe]/10 p-2 rounded-full">
                      <BookOpen className="w-5 h-5 text-[#f52ebe]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Conteúdo organizado</p>
                      <p className="text-xs text-gray-500">Por editais de concursos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
