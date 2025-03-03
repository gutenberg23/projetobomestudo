
import React from "react";
import { BookOpen, Target, Brain } from "lucide-react";

export const Features = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-white">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c] mb-4">
          A plataforma completa para a sua aprovação
        </h2>
        <p className="text-[#67748a]">Tudo o que você precisa em um só lugar</p>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <BookOpen className="w-12 h-12 text-[#ea2be2]" />,
            title: "Conteúdo Completo",
            description:
              "Todas as disciplinas e matérias organizadas por editais de concursos, com questões e explicações detalhadas.",
          },
          {
            icon: <Target className="w-12 h-12 text-[#ea2be2]" />,
            title: "Simulados Personalizados",
            description:
              "Crie simulados personalizados por concurso, banca ou disciplina, com análise de desempenho detalhada.",
          },
          {
            icon: <Brain className="w-12 h-12 text-[#ea2be2]" />,
            title: "Metodologia Eficiente",
            description:
              "Nosso método de estudo é baseado em técnicas avançadas de aprendizagem e retenção de conteúdo.",
          },
        ].map((feature, index) => (
          <div key={index} className="text-center p-6">
            <div className="flex justify-center mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-[#272f3c] mb-4">
              {feature.title}
            </h3>
            <p className="text-[#67748a]">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
