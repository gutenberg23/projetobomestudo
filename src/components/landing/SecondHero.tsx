
import React from "react";
import { BarChart, BookOpen, Clock, Zap } from "lucide-react";

export const SecondHero = () => {
  return <div className="w-full px-2.5 py-16 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c]">
            Estude do seu jeito e no seu tempo
          </h2>
          <p className="text-[#67748a]">
            O BomEstudo foi desenvolvido para oferecer a melhor experiência de estudo para concursos públicos. Nossa plataforma adapta-se ao seu ritmo, fornecendo estatísticas detalhadas de desempenho e materiais personalizados para cada disciplina.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {[
              {
                icon: <BookOpen className="h-5 w-5 text-[#ea2be2]" />,
                title: "Conteúdo completo",
                description: "Todas as disciplinas para seu concurso"
              },
              {
                icon: <BarChart className="h-5 w-5 text-[#ea2be2]" />,
                title: "Estatísticas detalhadas",
                description: "Acompanhe seu progresso em tempo real"
              },
              {
                icon: <Clock className="h-5 w-5 text-[#ea2be2]" />,
                title: "Estude quando quiser",
                description: "Acesso 24 horas por dia, 7 dias por semana"
              },
              {
                icon: <Zap className="h-5 w-5 text-[#ea2be2]" />,
                title: "Metodologia eficiente",
                description: "Aprenda mais rápido com nossas técnicas"
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="mr-3 p-2 bg-[#ea2be2]/10 rounded-full">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-medium text-[#272f3c]">{feature.title}</h3>
                  <p className="text-sm text-[#67748a]">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <img alt="Plataforma de estudos" className="w-full h-auto rounded-lg shadow-lg" src="/lovable-uploads/72f4e3ba-f775-45ec-a63f-d01db14a5b60.jpg" />
        </div>
      </div>
    </div>;
};
