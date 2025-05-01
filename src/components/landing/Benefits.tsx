
import React from "react";
import { Check } from "lucide-react";

export const Benefits = () => {
  const benefitsLeft = [
    "Acesso a milhares de questões comentadas",
    "Estatísticas detalhadas de desempenho",
    "Simulados personalizados por disciplina",
    "Aulas organizadas por editais",
    "Ciclo de estudos personalizado"
  ];
  
  const benefitsRight = [
    "Monitoramento contínuo de progresso",
    "Notícias sobre novos concursos",
    "Comunidade de apoio",
    "Totalmente gratuito",
    "Acesso em qualquer dispositivo"
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold mb-4 inline-flex items-center">
                  <span className="bg-[#c9ff33] w-1.5 h-8 mr-2"></span>
                  Para você
                </h3>
                <ul className="space-y-3">
                  {benefitsLeft.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-[#5f2ebe] mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4 inline-flex items-center">
                  <span className="bg-[#5f2ebe] w-1.5 h-8 mr-2"></span>
                  Por que usar
                </h3>
                <ul className="space-y-3">
                  {benefitsRight.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-5 h-5 text-[#5f2ebe] mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Por que escolher o BomEstudo?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Desenvolvido especialmente para concurseiros por pessoas que entendem as dificuldades e necessidades de quem está se preparando para concursos públicos.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Nossa plataforma oferece tudo que você precisa para maximizar seu tempo de estudo e aumentar suas chances de aprovação, sem custo algum.
            </p>
            <div className="inline-flex items-center space-x-2 py-2 px-4 bg-[#5f2ebe]/10 rounded-lg">
              <span className="text-[#5f2ebe] font-medium">97%</span>
              <span>dos aprovados utilizaram o BomEstudo em sua preparação</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
