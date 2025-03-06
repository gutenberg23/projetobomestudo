import React from "react";
import { TrendingUp, Users, Youtube, DollarSign, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
export const TeacherBenefits = () => {
  return <div className="w-full px-4 py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-center">
          {/* Lado Esquerdo - Texto e CTA */}
          <div className="md:w-1/2 space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#272f3c] leading-tight font-bold">
              Professor, <span className="text-[#5f2ebe]">multiplique</span> seu alcance e sua receita
            </h2>
            <p className="text-sm sm:text-base text-[#67748a] leading-relaxed">
              Ao se tornar um professor parceiro do BomEstudo, você aumenta sua visibilidade, ganha mais inscritos em seu canal e potencializa sua receita com anúncios, sem cobrar nada dos alunos.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2 sm:pt-4">
              {[{
              icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#5f2ebe]" />,
              title: "Mais visualizações",
              description: "Aumente o alcance dos seus vídeos e ganhe mais views"
            }, {
              icon: <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#5f2ebe]" />,
              title: "Novos inscritos",
              description: "Conquiste mais inscritos para seu canal do YouTube"
            }, {
              icon: <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-[#5f2ebe]" />,
              title: "Maior receita",
              description: "Aumente sua receita com monetização dos vídeos"
            }, {
              icon: <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#5f2ebe]" />,
              title: "Reconhecimento",
              description: "Torne-se uma referência no ensino para concursos"
            }].map((benefit, index) => <div key={index} className="flex items-start">
                  <div className="mr-2 sm:mr-3 p-1.5 sm:p-2 bg-white rounded-full shadow-sm">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-[#272f3c]">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-[#67748a]">{benefit.description}</p>
                  </div>
                </div>)}
            </div>
            
            <div className="pt-4 sm:pt-6">
              <Link to="/teacher-signup" className="py-[18px] px-[20px]">
                <Button 
                  variant="secondary" 
                  className="w-auto px-5 rounded-lg text-sm sm:text-base tracking-wider transition-all bg-white border-2 border-[#5f2ebe] text-[#5f2ebe] hover:bg-[#5f2ebe]/10 hover:shadow-lg hover:shadow-[#5f2ebe]/20 hover:-translate-y-1 font-normal"
                >
                  QUERO SER PROFESSOR
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Lado Direito - Ilustração */}
          <div className="md:w-1/2 relative mt-8 md:mt-0">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md relative z-10">
              <div className="rounded-lg overflow-hidden mb-4 bg-gray-100 relative">
                <Youtube className="h-16 w-16 sm:h-20 sm:w-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#5f2ebe]" />
                <img src="/lovable-uploads/7f20742a-1d1f-424b-9f56-3cece0204c7b.jpg" alt="Aula no YouTube" className="w-full h-auto opacity-75" />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#5f2ebe]/10 rounded-full">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#5f2ebe]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-[#272f3c]">Integração simples</h3>
                    <p className="text-xs sm:text-sm text-[#67748a]">Basta compartilhar os links dos seus vídeos</p>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-medium text-[#272f3c]">Suas Estatísticas:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Visualizações</span>
                      <p className="text-base sm:text-lg font-bold text-[#5f2ebe]">+247%</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Inscritos</span>
                      <p className="text-base sm:text-lg font-bold text-[#5f2ebe]">+153%</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Receita</span>
                      <p className="text-base sm:text-lg font-bold text-[#5f2ebe]">+182%</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Alunos</span>
                      <p className="text-base sm:text-lg font-bold text-[#5f2ebe]">+5.347</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute w-full h-full top-3 sm:top-5 left-3 sm:left-5 bg-[#5f2ebe]/10 rounded-xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>;
};
