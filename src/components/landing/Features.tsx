
import React from "react";
import { BookOpen, FileText, BarChart } from "lucide-react";

export const Features = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-white">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c] mb-4">
          Tudo o que você precisa para ser aprovado
        </h2>
        <p className="text-[#67748a]">Recursos completos para sua preparação</p>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <BookOpen className="w-12 h-12 text-[#ea2be2]" />,
            title: "Cursos Completos",
            description:
              "Cursos estruturados por disciplina com videoaulas, resumos e exercícios para fixação do conteúdo",
          },
          {
            icon: <FileText className="w-12 h-12 text-[#ea2be2]" />,
            title: "Questões Comentadas",
            description:
              "Banco com mais de 1 milhão de questões de concursos anteriores com resolução comentada por professores",
          },
          {
            icon: <BarChart className="w-12 h-12 text-[#ea2be2]" />,
            title: "Estatísticas Detalhadas",
            description:
              "Acompanhe seu desempenho com gráficos e relatórios que mostram seus pontos fortes e onde precisa melhorar",
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
