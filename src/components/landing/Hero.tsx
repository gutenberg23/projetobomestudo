import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Youtube, Award, BarChart } from "lucide-react";
export const Hero = () => {
  return <div className="w-full min-h-screen relative overflow-hidden bg-[#f8f9fc]">
      {/* Background Effect */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute w-[500px] h-[500px] bg-[#ea2be2]/10 rounded-full -top-[250px] -left-[250px]"></div>
        <div className="absolute w-[300px] h-[300px] bg-[#ea2be2]/10 rounded-full top-[50%] -right-[150px]"></div>
        <div className="absolute w-[200px] h-[200px] bg-[#ea2be2]/5 rounded-full bottom-[10%] left-[10%]"></div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white/70 pointer-events-none"></div>
        
        {/* Animated dots background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-2 h-2 bg-[#ea2be2] rounded-full top-[20%] left-[30%] animate-pulse" style={{
          animationDelay: "0.5s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#ea2be2] rounded-full top-[50%] left-[70%] animate-pulse" style={{
          animationDelay: "0.7s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#ea2be2] rounded-full top-[70%] left-[20%] animate-pulse" style={{
          animationDelay: "1s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#ea2be2] rounded-full top-[30%] left-[80%] animate-pulse" style={{
          animationDelay: "1.2s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#ea2be2] rounded-full top-[80%] left-[50%] animate-pulse" style={{
          animationDelay: "0.8s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#ea2be2] rounded-full top-[40%] left-[40%] animate-pulse" style={{
          animationDelay: "1.5s"
        }}></div>
        </div>
      </div>
      
      {/* Conteúdo centralizado */}
      <div className="max-w-7xl mx-auto px-4 min-h-screen flex flex-col justify-center items-center relative z-20 py-16">
        <div className="text-center space-y-6 max-w-3xl">
          <h1 className="text-4xl text-[#272f3c] leading-none font-extrabold md:text-7xl">
            Conectando <span className="text-[#ea2be2]">Alunos</span> e <span className="text-[#ea2be2]">Professores</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#67748a] max-w-2xl mx-auto leading-none">
            Estude de graça com os melhores professores do YouTube e utilize ferramentas avançadas para potencializar seus estudos para concursos públicos.
          </p>
          
          {/* Feature Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 max-w-2xl mx-auto">
            {[{
            icon: <BookOpen className="h-6 w-6 text-[#ea2be2]" />,
            label: "Cursos Gratuitos"
          }, {
            icon: <Youtube className="h-6 w-6 text-[#ea2be2]" />,
            label: "Professores YouTubers"
          }, {
            icon: <BarChart className="h-6 w-6 text-[#ea2be2]" />,
            label: "Estatísticas Detalhadas"
          }, {
            icon: <Award className="h-6 w-6 text-[#ea2be2]" />,
            label: "Acompanhamento Completo"
          }].map((item, index) => <div key={index} className="flex flex-col items-center gap-2 p-4">
                <div className="p-2 bg-white rounded-full shadow-md">
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-[#67748a]">{item.label}</span>
              </div>)}
          </div>
          
          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/login">
              <Button className="text-white rounded-lg text-lg font-medium hover:bg-opacity-90 transition-all px-8 py-6 bg-[#ea2be2] hover:translate-y-[-2px] w-full sm:w-auto">
                QUERO ESTUDAR GRÁTIS
              </Button>
            </Link>
            <Link to="/teacher-signup">
              <Button className="rounded-lg text-lg font-medium transition-all px-8 py-6 bg-white border-2 border-[#ea2be2] text-[#ea2be2] hover:bg-[#ea2be2]/5 hover:translate-y-[-2px] w-full sm:w-auto">
                QUERO SER PROFESSOR
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};