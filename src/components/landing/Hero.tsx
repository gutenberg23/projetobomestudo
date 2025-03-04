
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Youtube, Award, BarChart } from "lucide-react";
export const Hero = () => {
  return <div className="w-full min-h-screen relative overflow-hidden bg-white">
      {/* Background Effect - Degradê Radial Moderno */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Primeiro círculo de degradê - maior, mais suave */}
        <div className="absolute w-[800px] h-[800px] rounded-full 
          bg-gradient-to-r from-[#f9c54e]/40 via-[#91be6f]/20 to-transparent 
          -top-[200px] -left-[200px] blur-[60px]">
        </div>
        
        {/* Segundo círculo de degradê - médio */}
        <div className="absolute w-[600px] h-[600px] rounded-full 
          bg-gradient-to-r from-[#43a889]/30 via-[#5677bf]/15 to-transparent 
          top-[40%] -right-[200px] blur-[50px]">
        </div>
        
        {/* Terceiro círculo de degradê - menor, mais intenso */}
        <div className="absolute w-[400px] h-[400px] rounded-full 
          bg-gradient-to-r from-[#277ca0]/25 via-[#5677bf]/10 to-transparent 
          bottom-[10%] left-[20%] blur-[40px]">
        </div>
        
        {/* Overlay para suavizar a transição */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-white/90 pointer-events-none"></div>
        
        {/* Pontos decorativos com animação */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-2 h-2 bg-[#f9c54e] rounded-full top-[20%] left-[30%] animate-pulse" style={{
          animationDelay: "0.5s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#91be6f] rounded-full top-[50%] left-[70%] animate-pulse" style={{
          animationDelay: "0.7s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#43a889] rounded-full top-[70%] left-[20%] animate-pulse" style={{
          animationDelay: "1s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#5677bf] rounded-full top-[30%] left-[80%] animate-pulse" style={{
          animationDelay: "1.2s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#277ca0] rounded-full top-[80%] left-[50%] animate-pulse" style={{
          animationDelay: "0.8s"
        }}></div>
          <div className="absolute w-2 h-2 bg-[#91be6f] rounded-full top-[40%] left-[40%] animate-pulse" style={{
          animationDelay: "1.5s"
        }}></div>
          
          {/* Adicionando mais pontos para melhorar o efeito visual */}
          <div className="absolute w-1 h-1 bg-[#f9c54e] rounded-full top-[25%] left-[55%] animate-pulse" style={{
          animationDelay: "1.8s"
        }}></div>
          <div className="absolute w-1 h-1 bg-[#43a889] rounded-full top-[65%] left-[35%] animate-pulse" style={{
          animationDelay: "2s"
        }}></div>
          <div className="absolute w-1 h-1 bg-[#277ca0] rounded-full top-[45%] left-[85%] animate-pulse" style={{
          animationDelay: "1.3s"
        }}></div>
        </div>
      </div>
      
      {/* Conteúdo centralizado */}
      <div className="px-4 min-h-screen flex flex-col justify-center items-center relative z-20 py-16">
        <div className="text-center space-y-6 max-w-3xl px-4">
          <h1 className="text-3xl sm:text-4xl md:text-7xl text-[#272f3c] leading-tight font-extrabold">
            Conectando <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#f9c54e] via-[#91be6f] to-[#43a889]">Alunos</span> e <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#43a889] via-[#5677bf] to-[#277ca0]">Professores</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-[#67748a] max-w-2xl mx-auto leading-relaxed">
            Estude de graça com os melhores professores do YouTube e utilize ferramentas avançadas para potencializar seus estudos para concursos públicos.
          </p>
          
          {/* Feature Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 sm:py-6 max-w-2xl mx-auto">
            {[{
            icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#f9c54e]" />,
            label: "Cursos Gratuitos"
          }, {
            icon: <Youtube className="h-5 w-5 sm:h-6 sm:w-6 text-[#91be6f]" />,
            label: "Professores YouTubers"
          }, {
            icon: <BarChart className="h-5 w-5 sm:h-6 sm:w-6 text-[#43a889]" />,
            label: "Estatísticas Detalhadas"
          }, {
            icon: <Award className="h-5 w-5 sm:h-6 sm:w-6 text-[#5677bf]" />,
            label: "Acompanhamento Completo"
          }].map((item, index) => <div key={index} className="flex flex-col items-center gap-2 p-2 sm:p-4">
                <div className="p-2 bg-white rounded-full shadow-none">
                  {item.icon}
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#67748a]">{item.label}</span>
              </div>)}
          </div>
          
          {/* Botões com design melhorado */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="text-white rounded-lg text-sm sm:text-lg font-extrabold tracking-wider hover:bg-opacity-90 transition-all px-8 sm:px-10 py-6 sm:py-7 bg-gradient-to-r from-[#f9c54e] via-[#91be6f] to-[#43a889] hover:shadow-lg hover:shadow-[#91be6f]/30 hover:-translate-y-1 w-full border-b-4 border-[#f9c54e]">
                QUERO ESTUDAR GRÁTIS
              </Button>
            </Link>
            <Link to="/teacher-signup" className="w-full sm:w-auto">
              <Button className="rounded-lg text-sm sm:text-lg font-extrabold tracking-wider transition-all px-8 sm:px-10 py-6 sm:py-7 bg-white border-2 border-[#43a889] text-[#43a889] hover:bg-[#43a889]/5 hover:shadow-lg hover:shadow-[#43a889]/20 hover:-translate-y-1 w-full">
                QUERO SER PROFESSOR
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
