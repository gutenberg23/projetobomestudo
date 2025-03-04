
import React from "react";
import { TrendingUp, Users, Youtube, DollarSign, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const TeacherBenefits = () => {
  return (
    <div className="w-full px-2.5 py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Lado Esquerdo - Texto e CTA */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c]">
              Professores, <span className="text-[#ea2be2]">multiplique</span> seu alcance e sua receita
            </h2>
            <p className="text-[#67748a]">
              Ao se tornar um professor parceiro do BomEstudo, você aumenta sua visibilidade, ganha mais inscritos em seu canal e potencializa sua receita com anúncios, sem cobrar nada dos alunos.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {[
                {
                  icon: <TrendingUp className="h-5 w-5 text-[#ea2be2]" />,
                  title: "Mais visualizações",
                  description: "Aumente o alcance dos seus vídeos e ganhe mais views"
                },
                {
                  icon: <Users className="h-5 w-5 text-[#ea2be2]" />,
                  title: "Novos inscritos",
                  description: "Conquiste mais inscritos para seu canal do YouTube"
                },
                {
                  icon: <DollarSign className="h-5 w-5 text-[#ea2be2]" />,
                  title: "Maior receita",
                  description: "Aumente sua receita com monetização dos vídeos"
                },
                {
                  icon: <Globe className="h-5 w-5 text-[#ea2be2]" />,
                  title: "Reconhecimento",
                  description: "Torne-se uma referência no ensino para concursos"
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-3 p-2 bg-white rounded-full shadow-sm">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#272f3c]">{benefit.title}</h3>
                    <p className="text-sm text-[#67748a]">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
              <Link to="/teacher-signup">
                <Button className="bg-[#ea2be2] text-white px-8 py-6 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-all hover:translate-y-[-2px]">
                  QUERO SER PROFESSOR
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Lado Direito - Ilustração */}
          <div className="md:w-1/2 relative">
            <div className="bg-white p-6 rounded-xl shadow-md relative z-10">
              <div className="rounded-lg overflow-hidden mb-4 bg-gray-100 relative">
                <Youtube className="h-20 w-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#ea2be2]" />
                <img src="/lovable-uploads/7f20742a-1d1f-424b-9f56-3cece0204c7b.jpg" alt="Aula no YouTube" className="w-full h-auto opacity-75" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#ea2be2]/10 rounded-full">
                    <Zap className="h-5 w-5 text-[#ea2be2]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#272f3c]">Integração simples</h3>
                    <p className="text-sm text-[#67748a]">Basta compartilhar os links dos seus vídeos</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#272f3c]">Suas Estatísticas:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Visualizações</span>
                      <p className="text-lg font-bold text-[#ea2be2]">+247%</p>
                    </div>
                    <div className="p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Inscritos</span>
                      <p className="text-lg font-bold text-[#ea2be2]">+153%</p>
                    </div>
                    <div className="p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Receita</span>
                      <p className="text-lg font-bold text-[#ea2be2]">+182%</p>
                    </div>
                    <div className="p-3 bg-white rounded-md">
                      <span className="text-xs text-[#67748a]">Alunos</span>
                      <p className="text-lg font-bold text-[#ea2be2]">+5.347</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute w-full h-full top-5 left-5 bg-[#ea2be2]/10 rounded-xl -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
