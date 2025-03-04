
import React from "react";
import { FileText, BarChart, BookOpen, Award, CheckCircle, Target } from "lucide-react";
export const StudentBenefits = () => {
  return <div className="w-full px-4 py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#272f3c] mb-3 sm:mb-4 font-extrabold">
            Por que estudar no <span className="text-[#43a889]">BomEstudo</span>?
          </h2>
          <p className="text-sm sm:text-base text-[#67748a] max-w-2xl mx-auto leading-relaxed px-2">
            Nossa plataforma foi desenvolvida pensando exclusivamente em quem deseja ser aprovado em concursos públicos
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[{
          icon: <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#f9c54e]" />,
          title: "Acesso Gratuito",
          description: "Estude com videoaulas de qualidade dos melhores professores do YouTube, totalmente grátis"
        }, {
          icon: <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#91be6f]" />,
          title: "Questões Comentadas",
          description: "Pratique com nossa base de questões comentadas pelos professores e pela inteligência artificial"
        }, {
          icon: <BarChart className="w-8 h-8 sm:w-10 sm:h-10 text-[#43a889]" />,
          title: "Estatísticas Detalhadas",
          description: "Acompanhe seu desempenho por banca, disciplina e assunto com gráficos interativos"
        }, {
          icon: <Target className="w-8 h-8 sm:w-10 sm:h-10 text-[#5677bf]" />,
          title: "Simulados Personalizados",
          description: "Crie simulados focados nos tópicos que você mais precisa estudar para maximizar seu aprendizado"
        }, {
          icon: <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-[#277ca0]" />,
          title: "Edital Verticalizado",
          description: "Organize seu estudo seguindo a estrutura do edital do seu concurso para uma preparação eficiente"
        }, {
          icon: <Award className="w-8 h-8 sm:w-10 sm:h-10 text-[#f9c54e]" />,
          title: "Acompanhamento Contínuo",
          description: "Receba feedbacks e sugestões para melhorar seu desempenho e aumentar suas chances de aprovação"
        }].map((benefit, index) => <div key={index} className="bg-gray-50 p-4 sm:p-6 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="p-2 sm:p-3 bg-white rounded-full w-fit shadow-sm mb-3 sm:mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#272f3c] mb-2 sm:mb-3">{benefit.title}</h3>
                <p className="text-sm sm:text-base text-[#67748a] flex-grow">{benefit.description}</p>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
