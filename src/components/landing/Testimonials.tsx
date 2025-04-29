
import React from "react";

export const Testimonials = () => {
  const testimonials = [
    {
      quote: "O BomEstudo foi fundamental para minha aprovação. As estatísticas de desempenho me ajudaram a identificar meus pontos fracos e focar neles.",
      author: "Ana Beatriz",
      position: "Aprovada no Banco do Brasil",
      image: "/lovable-uploads/BIA.jpg"
    },
    {
      quote: "Estudar com questões comentadas fez toda diferença na minha preparação. Consegui entender os padrões das bancas e melhorar muito meu desempenho.",
      author: "Carlos Eduardo",
      position: "Aprovado no concurso da Receita Federal",
      image: "/lovable-uploads/a19bb9dc-c459-47ab-89f0-7addc6bbed15.png"
    },
    {
      quote: "O ciclo de estudos me ajudou a organizar meu tempo, que era muito escasso. Consegui me preparar mesmo trabalhando em tempo integral.",
      author: "Juliana Santos",
      position: "Aprovada na Polícia Federal",
      image: "/lovable-uploads/a63635e0-17bb-44d0-b68a-fb02fd8878d7.jpg"
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">O que dizem nossos alunos</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Conheça as histórias de quem conquistou a aprovação com a ajuda do BomEstudo
          </p>
          <div className="w-20 h-1.5 bg-[#f52ebe] mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`flex flex-col p-6 rounded-xl border ${
                index === 1 ? "bg-[#f52ebe] text-white border-[#f52ebe]" : "bg-white border-gray-100"
              }`}
            >
              <div className="mb-6">
                <svg 
                  width="48" 
                  height="48" 
                  viewBox="0 0 48 48" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={index === 1 ? "text-white/30" : "text-[#f52ebe]/20"}
                >
                  <path 
                    d="M14.6 18C10.1333 18 6 22.1333 6 26.6C6 31.0667 10.1333 35.2 14.6 35.2C25.8667 35.2 19.0667 48 8.6 48C18.4 48 28 39.6 28 26.6C28 22.1333 23.8667 18 19.4 18H14.6ZM38.6 18C34.1333 18 30 22.1333 30 26.6C30 31.0667 34.1333 35.2 38.6 35.2C49.8667 35.2 43.0667 48 32.6 48C42.4 48 52 39.6 52 26.6C52 22.1333 47.8667 18 43.4 18H38.6Z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              <p className={`text-lg mb-6 ${index === 1 ? "text-white/90" : "text-gray-600"}`}>
                {testimonial.quote}
              </p>
              <div className="mt-auto flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className={`font-bold ${index === 1 ? "text-white" : ""}`}>{testimonial.author}</h4>
                  <p className={`text-sm ${index === 1 ? "text-white/80" : "text-gray-600"}`}>
                    {testimonial.position}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
