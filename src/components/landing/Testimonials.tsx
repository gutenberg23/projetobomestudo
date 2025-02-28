
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Testimonials = () => {
  return (
    <div className="w-full px-2.5 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#272f3c]">
            O que nossos alunos dizem
          </h2>
          <div className="flex gap-4">
            <button className="p-2 rounded-full border border-[#ea2be2] text-[#ea2be2]">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="p-2 rounded-full border border-[#ea2be2] text-[#ea2be2]">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              text: "Graças ao BomEstudo consegui ser aprovada no concurso da Polícia Federal! Os materiais são completos e as questões comentadas fizeram toda a diferença na minha preparação.",
              name: "Helena Silva",
              role: "Aprovada - Polícia Federal",
              image: "https://i.pravatar.cc/100?img=1",
            },
            {
              text: "A plataforma é incrível e totalmente gratuita! Os simulados com estatísticas me ajudaram a identificar os pontos fracos e melhorar onde eu mais precisava.",
              name: "Rafael Oliveira",
              role: "Aprovado - Tribunal de Justiça",
              image: "https://i.pravatar.cc/100?img=2",
            },
            {
              text: "O BomEstudo revolucionou meus estudos. O edital verticalizado e as videoaulas são excelentes. Consegui minha aprovação estudando apenas pela plataforma.",
              name: "Mariana Costa",
              role: "Aprovada - Banco do Brasil",
              image: "https://i.pravatar.cc/100?img=3",
            },
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-lg">
              <p className="text-[#67748a] mb-6">{testimonial.text}</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-bold text-[#272f3c]">
                    {testimonial.name}
                  </div>
                  <div className="text-[#67748a]">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
