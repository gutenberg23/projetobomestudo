
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "O BomEstudo é realmente gratuito?",
      answer: "Sim, o BomEstudo é totalmente gratuito. Você terá acesso a todas as questões, aulas, simulados e estatísticas sem custo algum. Nossa missão é democratizar o acesso à educação para concursos públicos."
    },
    {
      question: "Como funciona o sistema de estatísticas?",
      answer: "Nosso sistema de estatísticas analisa seu desempenho em tempo real, identificando pontos fortes e fracos por disciplina, assunto e banca organizadora. Você recebe relatórios detalhados após cada simulado ou sessão de estudos."
    },
    {
      question: "O que são editais verticalizados?",
      answer: "Editais verticalizados são uma forma de organizar o conteúdo de estudo seguindo exatamente a estrutura do edital do concurso. Isso garante que você estude apenas o que realmente é necessário, otimizando seu tempo de preparação."
    },
    {
      question: "Como criar um ciclo de estudos personalizado?",
      answer: "Na plataforma, você pode acessar a ferramenta de ciclo de estudos, definir suas disciplinas prioritárias, tempo disponível por dia e o sistema irá gerar um cronograma otimizado baseado no seu perfil e nos editais dos concursos que você está visando."
    },
    {
      question: "Posso acessar pelo celular?",
      answer: "Sim, o BomEstudo é totalmente responsivo e pode ser acessado de qualquer dispositivo: computador, tablet ou smartphone. Basta acessar o site pelo navegador, não é necessário instalar aplicativos."
    },
    {
      question: "Como saber sobre novos concursos?",
      answer: "Nossa equipe de jornalismo especializado em concursos públicos atualiza diariamente a seção de notícias com informações sobre novos editais, previsões e dicas para cada concurso."
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-[#f2f4f6]">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Perguntas frequentes</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Tire suas dúvidas sobre o BomEstudo e maximize sua experiência
          </p>
          <div className="w-20 h-1.5 bg-[#f52ebe] mt-2"></div>
        </div>

        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="mb-4 border border-gray-100 rounded-lg bg-white overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 group">
                  <span className="text-left font-medium group-hover:text-[#f52ebe]">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-2 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
