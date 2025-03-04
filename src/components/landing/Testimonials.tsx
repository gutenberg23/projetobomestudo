
import React from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

export const Testimonials = () => {
  return (
    <div className="w-full px-2.5 py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c]">
            O que nossos alunos dizem
          </h2>
          
          <div className="hidden md:flex gap-2">
            <button className="p-2 border border-gray-200 rounded-full hover:bg-[#43a889] hover:text-white hover:border-[#43a889] transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="p-2 border border-gray-200 rounded-full hover:bg-[#43a889] hover:text-white hover:border-[#43a889] transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              text: "O BomEstudo revolucionou minha forma de estudar. Consigo acompanhar meu progresso em cada disciplina e focar nos pontos que preciso melhorar. A plataforma me ajudou a ser aprovado no concurso do Banco do Brasil!",
              name: "Carlos Oliveira",
              role: "Aprovado BB 2023",
              image: "https://i.pravatar.cc/100?img=1"
            },
            {
              text: "Como professora no YouTube, a parceria com o BomEstudo aumentou significativamente o alcance dos meus vídeos. Minhas visualizações cresceram mais de 200% e consegui monetizar melhor meu conteúdo sem cobrar dos alunos.",
              name: "Fernanda Lima",
              role: "Professora de Português",
              image: "https://i.pravatar.cc/100?img=2"
            },
            {
              text: "As ferramentas de estudo são sensacionais! O sistema de simulados personalizados e as estatísticas por banca me ajudaram a entender onde estavam minhas falhas. Recomendo para quem está se preparando para concursos.",
              name: "Marcos Souza",
              role: "Aprovado Concurso TRT",
              image: "https://i.pravatar.cc/100?img=3"
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-[#f9c54e] text-[#f9c54e]" />
                ))}
              </div>
              <p className="text-[#67748a] mb-6">{testimonial.text}</p>
              <div className="flex items-center gap-4">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-bold text-[#272f3c]">
                    {testimonial.name}
                  </div>
                  <div className="text-[#43a889] text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8 md:hidden gap-2">
          <button className="p-2 border border-gray-200 rounded-full hover:bg-[#43a889] hover:text-white hover:border-[#43a889] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="p-2 border border-gray-200 rounded-full hover:bg-[#43a889] hover:text-white hover:border-[#43a889] transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
