
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Newsletter = () => {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prepare-se para o <span className="text-[#f52ebe]">seu futuro</span></h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              Receba novidades sobre concursos, dicas de estudo e conteúdos exclusivos diretamente no seu email.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                type="email" 
                placeholder="Seu melhor e-mail" 
                className="flex-1 bg-[#f2f4f6] border-0 focus-visible:ring-[#f52ebe] focus-visible:ring-offset-0"
              />
              <Button className="bg-[#f52ebe] hover:bg-[#f52ebe]/90 text-white">
                Inscrever-se
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Ao se inscrever, você concorda com nossa política de privacidade.
            </p>
          </div>
          
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="bg-[#f2f4f6] p-8 rounded-xl max-w-md">
              <div className="flex items-center mb-6">
                <div className="h-12 w-3 bg-[#c9ff33] mr-4"></div>
                <h3 className="text-2xl font-bold">Comece sua jornada hoje</h3>
              </div>
              <p className="text-gray-600 mb-6">
                "A preparação de hoje é o sucesso de amanhã. Cada questão resolvida é um passo mais perto da sua aprovação."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src="/lovable-uploads/bb003461-c7e3-466c-8bbd-73478baae87b.jpg" 
                    alt="Mentor" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="font-medium">Prof. Roberto Almeida</p>
                  <p className="text-sm text-gray-500">Especialista em concursos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
