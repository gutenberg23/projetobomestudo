
import React from "react";
import { BookOpen, Target, Brain, BarChart, FileText, Calendar } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-[#f52ebe]" />,
      title: "Questões Comentadas",
      description: "Milhares de questões com comentários detalhados para maximizar seu aprendizado e fixação de conteúdo."
    },
    {
      icon: <BarChart className="w-8 h-8 text-[#f52ebe]" />,
      title: "Estatísticas Detalhadas",
      description: "Acompanhe seu desempenho por banca, disciplina e assunto com relatórios interativos."
    },
    {
      icon: <Target className="w-8 h-8 text-[#f52ebe]" />,
      title: "Simulados Personalizados",
      description: "Crie simulados focados nos tópicos que precisa estudar para maximizar seu tempo de estudo."
    },
    {
      icon: <FileText className="w-8 h-8 text-[#f52ebe]" />,
      title: "Editais Verticalizados",
      description: "Conteúdo organizado seguindo a estrutura específica do edital do seu concurso."
    },
    {
      icon: <Calendar className="w-8 h-8 text-[#f52ebe]" />,
      title: "Ciclo de Estudos",
      description: "Organize suas sessões de estudo com nosso criador de ciclo personalizado."
    },
    {
      icon: <Brain className="w-8 h-8 text-[#f52ebe]" />,
      title: "Método Eficiente",
      description: "Estude com técnicas avançadas de aprendizagem e retenção para melhorar seus resultados."
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#f2f4f6]">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Uma plataforma completa para sua aprovação</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Tudo que você precisa para se preparar para concursos públicos em um só lugar, totalmente gratuito!
          </p>
          <div className="w-20 h-1.5 bg-[#f52ebe] mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col p-6 bg-white rounded-xl border border-gray-100"
            >
              <div className="p-3 bg-[#f52ebe]/10 rounded-lg w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
