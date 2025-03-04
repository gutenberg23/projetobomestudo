
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}
const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isOpen,
  onClick
}) => {
  return <div className="border border-gray-200 rounded-lg">
      <button className={`flex justify-between items-center w-full p-5 text-left ${isOpen ? "bg-[#e8f1f3]" : "bg-white"}`} onClick={onClick}>
        <h3 className="font-medium text-[#022731]">{question}</h3>
        {isOpen ? <ChevronUp className="h-5 w-5 text-[#2a8e9e]" /> : <ChevronDown className="h-5 w-5 text-[#67748a]" />}
      </button>
      {isOpen && <div className="p-5 pt-0 border-t border-gray-200">
          <p className="text-[#67748a] py-[18px]">{answer}</p>
        </div>}
    </div>;
};
export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqItems = [{
    question: "As aulas do BomEstudo são realmente gratuitas?",
    answer: "Sim! Todas as videoaulas disponíveis na plataforma são 100% gratuitas. Nosso modelo de negócio se baseia em oferecer ferramentas avançadas por assinatura, enquanto o conteúdo básico permanece gratuito para todos os usuários."
  }, {
    question: "Como funciona a parceria com professores YouTubers?",
    answer: "Os professores compartilham seus vídeos do YouTube conosco, e nós os integramos à nossa plataforma, organizados por concursos e disciplinas. Os alunos assistem aos vídeos diretamente em nossa interface, mas as visualizações são contabilizadas no YouTube, gerando receita para os professores."
  }, {
    question: "Quais são os benefícios da assinatura premium?",
    answer: "Com a assinatura premium, você tem acesso a ferramentas avançadas como estatísticas detalhadas de desempenho, simulados personalizados, edital verticalizado com conteúdo organizado, sistema de revisão espaçada, e muito mais para potencializar seus estudos."
  }, {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento. Após o cancelamento, você continuará com acesso às funcionalidades premium até o final do período já pago, e depois manterá acesso às aulas gratuitas normalmente."
  }, {
    question: "Como faço para me tornar um professor parceiro?",
    answer: "Basta clicar no botão 'QUERO SER PROFESSOR' e preencher o formulário com suas informações e links do seu canal. Nossa equipe entrará em contato para discutir os detalhes da parceria e integrar seu conteúdo à plataforma."
  }, {
    question: "O BomEstudo funciona para qualquer concurso público?",
    answer: "Sim! Temos conteúdo organizado para os principais concursos públicos a nível federal, estadual e municipal. Constantemente adicionamos novos concursos e atualizamos o conteúdo existente conforme novos editais são publicados."
  }];
  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return <div className="w-full px-2.5 py-20 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#022731] mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-[#67748a]">
            Tire suas dúvidas sobre a plataforma BomEstudo
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => <FAQItem key={index} question={item.question} answer={item.answer} isOpen={openIndex === index} onClick={() => toggleItem(index)} />)}
        </div>
      </div>
    </div>;
};
